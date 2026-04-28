
export enum FlavorProfile {
  SYRLIG = 'Syrlig & Frisk',
  RIK = 'Rik & Kremet',
  KRYDRET = 'Krydret & Intens',
  LETT = 'Lett & Elegant',
  BALANSERT = 'Balanse & Umami',
  SOET = 'Søtt & Rundt',
}

export enum CookingMode {
  RASKT = 'Raskt & Enkelt',
  HVERDAGSLIG = 'Hverdagslig',
  FESTMAT = 'Festmat',
  GRILL = 'Grill',
  AIRFRYER = 'Air Fryer',
  SLOW = 'Slow Cook',
  MICHELIN = 'Michelin-nivå',
}

export enum Cuisine {
  NORSK = 'Norsk/Nordisk',
  ITALIENSK = 'Italiensk',
  FRANSK = 'Fransk',
  GRESK = 'Gresk',
  SPANSK = 'Spansk',
  MEKSIKANSK = 'Meksikansk',
  ASIATISK = 'Asiatisk',
  JAPANSK = 'Japansk',
  THAI = 'Thai',
  INDISK = 'Indisk',
  KINESISK = 'Kinesisk',
  MIDTOSTEN = 'Midtøsten',
  AMERIKANSK = 'Amerikansk BBQ',
}

export enum MealType {
  FROKOST = 'Frokost',
  LUNSJ = 'Lunsj',
  MIDDAG = 'Middag',
  DESSERT = 'Dessert',
  FORRETT = 'Forrett/Snack',
}

export enum SkillLevel {
  ENKEL = 'Enkel',
  MIDDELS = 'Middels',
  AVANSERT = 'Avansert',
  MICHELIN = 'Michelin',
}

export interface ChefRequest {
  ingredients: string;
  people: number;
  flavorProfile: FlavorProfile;
  cookingMode: CookingMode;
  cuisine: Cuisine;
  mealType: MealType;
  skillLevel: SkillLevel;
  extraWishes?: string;
}

export interface SavedRecipe {
  id: string;
  title: string;
  markdown: string;
  request: ChefRequest;
  savedAt: string;
}

export type AppView = 'home' | 'ingredients' | 'preferences' | 'recipe' | 'history';
