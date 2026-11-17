# Aster Journal design system

## Direction
A quiet writing desk: warm white pages, ink typography, a clear blue action, airy rhythm. Serif headings make reflection feel personal; native Material controls keep the app familiar. Operate mode for library/editor/settings; Read mode for prompt text. This is an original synthesis, not a reproduction of supplied artwork.

## Tokens
| Role | Light | Dark |
|---|---|---|
| primary / onPrimary | #2856C5 / #FFFFFF | #ADC6FF / #082B71 |
| background / onBackground | #FAFBFE / #172239 | #10141E / #E3E8F5 |
| surface / onSurface | #FFFFFF / #172239 | #171D2A / #E3E8F5 |
| surfaceContainer | #F0F3FA | #202838 |
| primaryContainer / onPrimaryContainer | #E5EDFF / #183D91 | #263E70 / #DBE6FF |
| onSurfaceVariant | #56637B | #B8C3D7 |
| outlineVariant | #DFE5F0 | #364257 |
| error | #B3261E | #FFB4AB |

## Type and spacing
Bundled DM Serif Display Regular for Material headline roles. Bundled Plus Jakarta Sans Regular/Semibold for body and controls; system fallback. Headline 32/40sp, 28/36sp; title 20/28sp; body 16/26sp, secondary 14/22sp; labels 12/16sp minimum. Text follows Android font scale. Layout padding 24dp (16dp at compact editor controls), section rhythm 24/32dp, component gaps 8/12/16dp, corner radii 12/16dp. Interactive targets at least 48dp.

## Composition
Library: brand app bar, editorial heading and honest count, search, horizontally scrollable filter chips, pinned/recent list, one create FAB. Default empty state is deliberate and helpful; no seeded notes. Reflection: focused daily prompt, optional mood, thematic prompt library, recent reflections. Collections: actual folders plus favorite/archive/trash. Settings: appearance, privacy, reminders, data ownership. Editor: back and save status always visible; title, content/checklist, prompt follow-ups; secondary actions in menu. No per-keystroke UI-wide recomposition.

## Native behavior
Scaffold owns safe drawing insets; editor applies IME insets. Bottom navigation at compact sizes; navigation rail at expanded sizes. Standard Material dialogs, chips, sheets, switches, date/time conventions, text selection and ripple. NavController maintains predictable Back and source collection. UI state survives recreation; content survives process restart via Room. Material motion respects system animation duration scale; no perpetual animation. Crossfades use 180–220ms.

## Asset policy
Use bundled licensed fonts, Material icons, and the pre-existing app icon. No reference screenshots in APK. No decorative photo dependency. Photo Picker handles user images without broad storage permissions.

## Review contract
Check real empty/populated/editor/error states, light/dark, compact/expanded, 1.3–2.0 font scale, IME and Android Back. Screenshots must come from Android; web mockups cannot verify native UI. Performance evidence from software emulation does not establish physical POCO F6 performance.
