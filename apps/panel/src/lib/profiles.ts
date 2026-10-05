/** Perfiles ficticios de la demo: no hay usuarios reales. */
export const PROFILES = {
  pr1: { name: 'Inés (Podología)', role: 'Podóloga' },
  pr2: { name: 'Valentina (Estética)', role: 'Esteticista' },
} as const
export type ProfileId = keyof typeof PROFILES
