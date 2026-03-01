
export enum FlavorProfile {
  SYRLIG = 'Syrlig & Frisk',
  RIK = 'Rik & Kremet',
  KRYDRET = 'Krydret & Intens',
  LETT = 'Lett & Elegant',
  BALANSERT = 'Balanse & Umami'
}

export interface ChefRequest {
  ingredients: string;
  people: number;
  flavorProfile: FlavorProfile;
}

export interface RecipeResponse {
  rawMarkdown: string;
}
