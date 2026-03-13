export interface Batiment {
  id: string;
  nom: string;
  adresse: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  nom: string;
  icone: string;
  ordre: number;
  created_at: string;
}

export interface Annonce {
  id: string;
  titre: string;
  description: string | null;
  type_espace: string;
  surface: number | null;
  prix_mensuel: number | null;
  charges: string | null;
  disponibilite: string | null;
  statut: string;
  batiment_id: string | null;
  conditions_duree: string | null;
  conditions_preavis: string | null;
  conditions_bail: string | null;
  conditions_garantie: string | null;
  conditions_notes: string | null;
  mise_en_avant: boolean;
  created_at: string;
  updated_at: string;
  batiment?: Batiment | null;
  services?: Service[];
  medias?: Media[];
}

export interface Media {
  id: string;
  annonce_id: string;
  type: string;
  url: string;
  ordre: number;
  created_at: string;
}

export interface PageContent {
  id: string;
  titre: string | null;
  description: string | null;
  chiffres: Record<string, string>;
  avantages: Array<{ titre: string; description: string; icone: string }>;
  photos: string[];
  updated_at: string;
}

export const TYPES_ESPACE = [
  'Bureau privatif',
  'Open space flex',
  'Atelier',
  'Salle de formation',
  'Autre',
] as const;

export const CHARGES_OPTIONS = ['incluses', 'non incluses', 'à préciser'] as const;

export const STATUTS = ['publiee', 'brouillon', 'archivee'] as const;

export const DUREES = ['Sans engagement', '1 mois', '3 mois', '6 mois', '1 an'] as const;

export const PREAVIS = ['1 mois', '3 mois'] as const;

export const BAILS = [
  'Contrat de prestation',
  'Bail commercial 3-6-9',
  'Convention d\'occupation précaire',
  'Autre',
] as const;

export function prixM2Mois(prix: number | null, surface: number | null): number | null {
  if (!prix || !surface || surface === 0) return null;
  return Math.round((prix / surface) * 100) / 100;
}

export function prixM2An(prix: number | null, surface: number | null): number | null {
  if (!prix || !surface || surface === 0) return null;
  return Math.round(((prix * 12) / surface) * 100) / 100;
}
