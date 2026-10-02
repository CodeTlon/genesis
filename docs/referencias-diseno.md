# Referencias de diseño para Genesis — decisión final

Fuente: `references/diseños` (codetlon-design-library, `react-bits/ts-tailwind`). Criterio: "spa clínico" calmo, AA, Lighthouse móvil ≥90, **cero dependencias pesadas** (regla del prompt: ADR para cada una), sin CDN de terceros, adultos mayores y compu modesta de Inés. Licencia react-bits: MIT + Commons Clause → se copia el componente suelto, no la carpeta.

## Traídos (en `componentes-seleccionados/`, a mover a `packages/ui/vendor/` al scaffold)
| Componente | Dónde | Por qué | Adaptar |
|---|---|---|---|
| `SpotlightCard.tsx` (72 l, 0 deps) | cards de las 19 servicios | Hover sutil, liviano | Color del spotlight = lila `#C9A7EB`; sin depender del hover (móvil); foco visible por teclado |
| `Stepper.tsx` (336 l, dep `motion`) | onboarding de 5 pasos del panel | Es justo el caso de uso | Textos es-AR, botones ≥48px, `aria-current`; `motion` = única dep de animación del panel (ADR) |
| `HoldButton.tsx` (358 l, 0 deps, respeta reduced-motion) | acciones delicadas (firmar/cerrar atención, descartar borrador) | Previene toques accidentales; alternativa por teclado obligatoria | Texto + ícono, tiempo de hold corto (~600 ms) por motricidad de adultos |

## Evaluados y descartados (con motivo)
- **FadeContent / AnimatedContent / SplitText** → traen `gsap` + ScrollTrigger (~70 KB) para un fade-in. Se reemplaza por un `<Reveal>` propio (IntersectionObserver + CSS, 0 deps, con `prefers-reduced-motion`).
- **BlurText** → dep `motion` en el sitio público; innecesario, un título estático pesa menos y mejora LCP.
- **Masonry** → `gsap`; la galería arranca casi vacía (pocas fotos cat. 3). CSS columns alcanza.
- **Grainient / SoftAurora / Silk** (WebGL: `ogl` / `three`) → comprometen Lighthouse ≥90 y batería. Fondo = gradiente malva→mármol + textura de grano en CSS/SVG.
- **SwipeToast** (hugeicons) / **StatusMark** → duplican Sonner (shadcn, con acción "Deshacer") y un `Badge` propio texto+ícono para estados de turno.
- **password-strength / modern-login-signup / vertical-tabs** (`componentes/`) → son de Fase 1 (auth real con 2FA); la demo usa una contraseña única. Se re-evalúan entonces (traducir, reglas en inglés).
- Cursores, glitch/ASCII, 3D, `kage.md` (sin licencia) → tono incorrecto.

## Estilo
`DESIGN.md` de Notion/Apple como referencia de calma y jerarquía (`awesome-design-md.md`), adaptado a los tokens de `marca.md`. Skills a correr al diseñar: `ui-ux-pro-max`, `bencium-controlled-ux-designer` (panel clínico, WCAG AA) y `hallmark audit` sobre el sitio.

## Pendiente
Al crear `../output/genesis`: mover los 3 componentes a `packages/ui/vendor/`, tokenizar con `marca.md`, y anotar en su `.claude/CLAUDE.md` qué se usó. `<Reveal>` se escribe nuevo.
