
import { GoogleGenAI } from '@google/genai';
import { ChefRequest, CookingMode, SkillLevel } from './types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL = 'gemini-2.0-flash';

// ─── Image ingredient identification ────────────────────────────────────────

export const identifyIngredientsFromImage = async (
  base64Data: string,
  mimeType: string,
): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          {
            text: `Analyser dette bildet og list opp ALLE matingredienser du kan se.
Svar KUN med en kommaseparert liste på norsk, ingen annen tekst.
Eksempel: "Laks, sitron, smør, hvitløk, asparges"
Hvis du ikke ser matingredienser, svar: "Ingen ingredienser funnet"`,
          },
        ],
      },
    ],
    config: { temperature: 0.2 },
  });
  return response.text?.trim() || 'Ingen ingredienser funnet';
};

// ─── Recipe generation ───────────────────────────────────────────────────────

const buildSystemInstruction = (req: ChefRequest): string => {
  const modeInstructions: Record<CookingMode, string> = {
    [CookingMode.RASKT]: `Lag en enkel, rask rett klar på MAKS 30 minutter. Enkle teknikker, minimalt utstyr. Gi klare og raske steg.`,
    [CookingMode.HVERDAGSLIG]: `Lag en smakfull hverdagsrett som passer en vanlig hverdag. Balansert mellom smak og innsats.`,
    [CookingMode.FESTMAT]: `Lag en imponerende festrett som vil wow gjestene. Kan ta tid, men resultatet skal være spektakulært.`,
    [CookingMode.GRILL]: `LAG EN GRILLOPPSKRIFT. Gi spesifikke instruksjoner for grillen: direkte/indirekte varme, temperatur, tid, marinader, pensling. Bruk grillteknikker aktivt.`,
    [CookingMode.AIRFRYER]: `LAG EN AIR FRYER-OPPSKRIFT. Gi nøyaktige Air Fryer-instruksjoner: temperatur i grader Celsius, tid i minutter, om maten skal snus, fordampingsnivå. Ikke bruk ovn-instruksjoner.`,
    [CookingMode.SLOW]: `Lag en slow cook-oppskrift. Gi instruksjoner for slow cooker/crockpot: lav vs. høy innstilling, timer, væskenivå. Retten skal bli mør og smakfull.`,
    [CookingMode.MICHELIN]: `Lag en oppskrift på Michelin-stjerne-nivå med avanserte teknikker som confitering, emulsjon, sous-vide, reduksjon, gel, skum. Imponerende presentasjon.`,
  };

  const skillInstructions: Record<SkillLevel, string> = {
    [SkillLevel.ENKEL]: `Enkelt språk, ingen faguttrykk uten forklaring, basisteknikker kun. Forklar alt trinn for trinn.`,
    [SkillLevel.MIDDELS]: `Anta grunnleggende kjøkkenferdigheter. Kan bruke noe fagspråk med forklaring.`,
    [SkillLevel.AVANSERT]: `Kan bruke faglig terminologi. Avanserte teknikker velkomne.`,
    [SkillLevel.MICHELIN]: `Fullt profesjonelt kjøkkenspråk. Molekylær gastronomi, presise teknikker, restaurant-anretning.`,
  };

  return `Du er en verdenskjent kulinarisk mester og matpedagog med Michelin-erfaring og dyp kunnskap om all verdens kjøkken.

TILBEREDNINGSMODUS: ${req.cookingMode}
${modeInstructions[req.cookingMode]}

KJØKKEN: ${req.cuisine} – bruk autentiske teknikker, krydder og smaker fra dette kjøkkenet.

FERDIGHETSNIVÅ: ${req.skillLevel}
${skillInstructions[req.skillLevel]}

OUTPUT-FORMAT (alltid på norsk, alltid dette formatet – ingen avvik):

## [Kreativt navn på retten]
**Beskrivelse:** [2-3 forlokkende setninger om smak, tekstur og stemning]

**Info:**
* **Kjøkken:** ${req.cuisine}
* **Type:** ${req.mealType}
* **Tilberedning:** ${req.cookingMode}
* **Estimert tid:** [realistisk totaltid]
* **Vanskelighetsgrad:** ${req.skillLevel}
* **Porsjoner:** ${req.people}
* **Smaksprofil:** ${req.flavorProfile}

**Ingredienser (skalert for ${req.people} person(er)):**
* [nøyaktig mengde og ingrediens, ev. forberedelsesnotat]

**Fremgangsmåte:**
1. **[Stegtittel]:** [Detaljerte instruksjoner med temperaturer, tider og teknikker]
2. **[Stegtittel]:** [...]
[Fortsett for alle nødvendige steg]

**Anretning:**
[Detaljert og visuell beskrivelse av presentasjonen]

**Kokkens tips:**
* [Praktisk tips om ingredienser, teknikk eller lagring]
* [Tips om substitusjon eller variasjon]
* [En ekstra innsikt som løfter retten]

**Lær teknikken:**
* **[Teknikknavn brukt i oppskriften]:** [Kort, klar forklaring for å forstå og mestre teknikken]`;
};

export const generateRecipe = async (request: ChefRequest): Promise<string> => {
  const ai = getAI();

  const userPrompt = `Lag en oppskrift med følgende:
Ingredienser jeg har: ${request.ingredients}
Antall personer: ${request.people}
Smaksprofil: ${request.flavorProfile}${request.extraWishes ? `\nEkstra ønsker: ${request.extraWishes}` : ''}

Analyser ingrediensene, og hvis noe mangler for en komplett rett, anta at basisvarer (salt, pepper, olje, smør, hvitløk) er tilgjengelig.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: buildSystemInstruction(request),
        temperature: 0.82,
      },
    });
    return response.text || 'Beklager, jeg kunne ikke komponere en rett akkurat nå.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Kunne ikke koble til det kulinariske nettverket. Sjekk API-nøkkelen din.');
  }
};

// ─── Shopping list extraction ────────────────────────────────────────────────

export const extractShoppingList = async (recipeMarkdown: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Fra denne oppskriften, ekstraher BARE ingredienslisten som en JSON-array med strings på norsk.
Svar KUN med JSON-array, ingenting annet. Eksempel: ["500g kyllingbryst", "2 fedd hvitløk", "1 sitron"]

Oppskrift:
${recipeMarkdown}`,
    config: { temperature: 0.1 },
  });

  try {
    const text = response.text?.trim() || '[]';
    const clean = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
};
