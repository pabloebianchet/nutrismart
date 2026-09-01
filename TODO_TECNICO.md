# TODOs técnicos — pendientes que requieren decisión humana

Este archivo es solo para dejar registro de cosas que el código no puede
resolver por sí solo (decisiones de negocio, legales, o acciones manuales
fuera del repo). No es una lista de tareas de desarrollo normales.

## Pagos — Sales tax en EE.UU. (Stripe)

**Estado:** `managed_payments: { enabled: false }` en
`backend/routes/stripePayments.js` — desactivado deliberadamente.

**Por qué:** Stripe Managed Payments calcula y remite impuestos de venta
automáticamente, pero requiere un `tax_code` por producto y activarlo sin
entender las obligaciones reales (nexus por estado, registro fiscal, etc.)
puede generar una obligación de compliance mal gestionada.

**Quién lo resuelve:** el usuario, con un contador/asesor fiscal de
EE.UU. No es una tarea de código — cuando haya una decisión, la
implementación es agregar `tax_code` a los productos y flippear el flag.

## SEO — Google Search Console

**Estado:** sin verificar por falta de acceso — no hay credenciales ni
API de Search Console conectadas a este entorno de trabajo.

**Qué falta confirmar ahí:** errores de indexación/cobertura nuevos
desde que se agregaron las rutas `/en/*` y se corrigió el prerenderizado
(setiembre 2026). Si se comparte acceso (o exports de los reportes de
Cobertura/Indexación), se puede auditar.

## Vercel — Dominio www

**Estado:** `www.nuiapp.com` está configurado como Production Domain
independiente en Vercel — sirve contenido directo (HTTP 200) en vez de
redirigir a `nuiapp.com`. El `redirects` de `vercel.json` no alcanza a
corregir esto porque Vercel no lo evalúa para un dominio servido así.

**Quién lo resuelve:** acción manual en Vercel Dashboard → Settings →
Domains → configurar `www.nuiapp.com` como redirect (no hay CLI de
Vercel disponible en este entorno para hacerlo por script).

## Legal — páginas específicas de EE.UU.

**Estado:** `/privacidad`, `/terminos`, `/legal` citan específicamente
la Ley 25.326 argentina. No existe una versión equivalente para
visitantes de EE.UU. (no hay `/en/privacy` ni contenido legal US-specific).

**Quién lo resuelve:** requiere revisión legal real, no es algo para
resolver unilateralmente en código.
