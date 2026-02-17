# 2e2a Logística – Operaciones Dashboard

Aplicación Next.js para captura operativa, dashboard gerencial y chatbot inteligente sobre movimientos (subidas/bajadas), turnos y excepciones. Incluye administración de unidades y alertas por anomalías.

## Rutas principales
- `/` Home con accesos
- `/operacion` Captura de movimientos
- `/dashboard` KPIs y estado
- `/chat` Chat operativo (LLM opcional + heurísticas)
- `/unidades` Administración del catálogo de unidades
- `/api/chat` Endpoint de preguntas/respuestas sobre los datos

## Requisitos
- Node.js LTS
- Cuenta Firebase (Firestore) y proyecto configurado
- Opcional: clave de Groq para respuestas naturales del chatbot

## Instalación y desarrollo
```bash
npm install
cp .env.example .env.local
# Rellena .env.local con tus variables de Firebase y Groq
npm run dev
# http://localhost:3000
```

## Variables de entorno
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (formato recomendado: `<project>.appspot.com`)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `GROQ_API_KEY` (opcional, para respuestas enriquecidas)
- `GROQ_MODEL` (por defecto `llama-3.1-70b-versatile`)

Nota: No versionar secretos. `.env.local` está ignorado por Git.

## Firebase – colecciones esperadas
- `movimientos` (documentos)
  - `unidadId` (ej. `MA-006668`)
  - `dia` (`LUNES|MARTES|MIÉRCOLES|JUEVES|VIERNES|SÁBADO`)
  - `tipo` (`SUBIDA|BAJADA`)
  - `turno` (`1|2|3`)
  - `estado` (`NORMAL|BAJO EN TIEMPO|EXCEPCIÓN`)
  - `planificado` (bool), `realizado` (bool)
- `unidades` (documentos)
  - `codigo` (ej. `MA-006668`)
  - `activo` (bool, default `true`)

Reglas: ver `firestore.rules` y ajustar a tus roles.

## Chat operativo
- Heurísticas locales: alertas por tasa de excepciones, turnos sin actividad, subidas/bajadas no correspondidas por unidad.
- LLM opcional (Groq): respuestas naturales y explicativas. Si no se define `GROQ_API_KEY`, el sistema responde con KPIs y heurísticas deterministas.

## Despliegue en Vercel – checklist
1) Importar el repo: `halvarez22/2e2a-logistica`, rama `main`
2) Root Directory: `/`
3) Variables (Production y Preview):
   - todas las de Firebase + `GROQ_API_KEY` y `GROQ_MODEL`
4) Redeploy usando el último commit (verifica que muestre rutas `/operacion`, `/dashboard`, `/chat`, `/unidades`)
5) Opcional: desactivar telemetría
   - `NEXT_TELEMETRY_DISABLED=1` o `npx next telemetry disable`

## Scripts útiles
```bash
npm run dev       # desarrollo
npm run build     # build producción
npm run lint      # lint
```

## Seguridad
- Mantener claves únicamente en variables de entorno
- Revisar y endurecer reglas de Firestore para producción
- Minimizar datos sensibles en prompts de LLM

## Troubleshooting despliegue
- Si Vercel muestra el “starter” de Next.js:
  - Revisa que el proyecto esté vinculado al repo correcto y a la rama `main`
  - Asegura Root Directory `/`
  - Verifica que el último commit incluya las carpetas `app/chat`, `app/operacion`, `app/unidades`, `app/api/chat`, `lib/*`
