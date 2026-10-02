# Marca — Genesis Estética Integral (Checkpoint 1)

## Logo
`brand/logo.jpg` (1080×1080, fondo mármol blanco): pie estilizado (lila degradé) + perfil de rostro femenino (violeta) + hojas negras + piedras de spa, circunferencia negra abierta, script "Génesis" + "ESTÉTICA INTEGRAL" en sans.
- Para web: vectorizar a SVG (pie, rostro, hojas como íconos/separadores). Si la vectorización pierde calidad, usar el JPG recortado en círculo y el script solo como imagen del logo.
- El script caligráfico **solo** vive en el logo, nunca como fuente del sitio.

## Paleta (aproximada — confirmar con cuentagotas sobre el archivo original)
| Token | Hex | Uso |
|---|---|---|
| violeta | `#A259E0` | acento, íconos, bordes (no para texto chico) |
| violeta-oscuro | `#7B3FB8` | botones y fondos con texto blanco (propuesto) |
| lila | `#C9A7EB` | fondos suaves, chips |
| malva | `#AC9BB0` | fondo de tarjetas/piezas |
| tinta | `#1A1A1A` | texto principal |
| mármol | `#F4F3F5` | fondo de página |

## Contraste (calculado WCAG, AA texto normal ≥ 4.5)
| Combinación | Ratio | Veredicto |
|---|---|---|
| blanco sobre malva `#AC9BB0` | **2.6** | ❌ (como se sospechaba) |
| tinta sobre malva | 6.69 | ✅ |
| blanco sobre violeta `#A259E0` | 4.17 | ❌ texto normal / ✅ solo texto grande ≥24px |
| blanco sobre violeta-oscuro `#7B3FB8` | 6.47 | ✅ |
| tinta sobre lila `#C9A7EB` | 8.46 | ✅ |
| tinta sobre mármol | 15.73 | ✅ |
| violeta-oscuro sobre mármol | 5.85 | ✅ |
| violeta `#A259E0` sobre mármol | 3.77 | ❌ texto; ok decorativo |

Regla: texto blanco solo sobre violeta-oscuro; sobre malva, texto tinta.

## Tipografía (autoalojada con `next/font`, `display: swap`; sin CDN)
- Títulos: **Montserrat Light**, mayúsculas, tracking amplio.
- Cuerpo: **Montserrat Regular**, base ≥ 18 px (requisito del panel; el sitio también).
- Etiquetas superiores: **Roboto Condensed**.

## Patrón de pieza → patrón de página de servicio
Foto grande arriba → pregunta-gancho en mayúsculas → subtítulo explicativo → botón WhatsApp. Se replica en cada página de servicio (ver `servicios.json`).

## Sistema
Tokens (color, tipografía, espaciado, radios, sombras) en un único archivo de `packages/config`. Estética "spa clínico": mucho aire, fotos grandes, bordes suaves. Modo claro; oscuro opcional.
