/** Perfiles ficticios de la demo: no hay usuarios reales. */
export const PROFILES = {
  pr1: { name: 'Profesional de Podología', role: 'Podología', loginLabel: 'Entrar como profesional de Podología' },
  pr2: { name: 'Profesional de Estética', role: 'Estética', loginLabel: 'Entrar como profesional de Estética' },
} as const
export type ProfileId = keyof typeof PROFILES
