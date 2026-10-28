# Concurso de disfraces · Halloween 2026 · Métrica

App de votación: cada persona elige desde qué área vota y su nombre, y vota por el mejor disfraz de las otras dos áreas. Solo se vota una vez. Los ganadores se revelan al cierre.

- **Votación:** `/`
- **Ganadores:** `/resultados` (bloqueada hasta el cierre; ideal para proyectar)
- **Control (solo organización):** `/admin`

## Publicarla en Vercel (unos 10 minutos)

1. **Sube el proyecto a GitHub.** En github.com → *New repository* → nombre `halloween-metrica` → *Private* → *Create*. En la página del repo vacío, entra a *uploading an existing file* y arrastra **todo el contenido** de esta carpeta (no la carpeta en sí). *Commit changes*.
2. **Impórtalo en Vercel.** vercel.com → *Add New… → Project* → elige `halloween-metrica` → *Deploy*. No cambies nada.
3. **Conecta la base de votos (gratis).** En el proyecto de Vercel → pestaña *Storage* → *Create Database* → **Upstash for Redis** (plan *Free*) → *Connect* a este proyecto. Vercel agrega solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Tiene que ser **Upstash**: otras bases no sirven con esta app.
4. **Pon tu clave de organización.** *Settings → Environment Variables* → nombre `ADMIN_CLAVE`, valor: la clave que quieras → *Save*.
5. **Vuelve a publicar** para que tome la base y la clave: *Deployments* → los tres puntitos del último → *Redeploy*.

## Probarla hoy (antes de que abra)

1. Entra a `/admin` con tu clave → **Abrir ahora**.
2. Vota desde tu celular como cualquier persona.
3. En `/admin` → **Cerrar votación y revelar ganadores** → mira `/resultados`.
4. En `/admin` → *Borrar todos los votos (para pruebas)* → escribe `BORRAR`. Esto borra todo y la deja otra vez en horario automático: abrirá sola el jueves 29 a las 11:00 a. m.

Ojo: en el navegador donde votaste quedará la pantalla de «Voto enviado». Para volver a probar, abre una ventana de incógnito.

## El día del concurso

- Abre sola a las **11:00 a. m. del jueves 29**.
- Cuando decidas terminar: `/admin` → **Cerrar votación y revelar ganadores**. Si nadie la cierra, se cierra sola a las **11:59 p. m.**
- En `/admin` ves cuántos votaron por área y quién falta.
- En `/resultados` cada tarjeta se voltea al tocarla, para revelar los ganadores uno por uno.

## Cómo se evita el voto doble

- Cada nombre vota una sola vez: después aparece como «ya votó» y no se puede elegir.
- La base registra el voto en un solo paso, así que dos personas no pueden votar con el mismo nombre al mismo tiempo.

Si alguien dice «yo no voté y aparezco como que ya voté», la app no permite anular un voto suelto: decide tú cómo manejarlo al anunciar.

## Cambiar algo

Todo lo editable está en `lib/config.js`: horarios, áreas y la lista de nombres. Después de editar en GitHub, Vercel publica solo.
