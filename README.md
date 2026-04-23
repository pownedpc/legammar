# Le Gamaar Cinema

Videoclub selecto en HTML estático con perfiles, catálogos por socio, búsqueda TMDB y chatbot vía OpenRouter.

## Publicar en GitHub

1. Crea un repositorio nuevo en GitHub.
2. Desde esta carpeta:

```bash
git init
git add .
git commit -m "Initial Le Gamaar Cinema"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Publicar en Vercel

1. Entra en Vercel y elige `Add New Project`.
2. Importa el repositorio de GitHub.
3. Framework preset: `Other`.
4. Build command: déjalo vacío.
5. Output directory: déjalo vacío.
6. Añade una variable de entorno:

```text
OPENROUTER_API_KEY=tu_clave_de_openrouter
```

7. Deploy.

## Abrir en local

Puedes abrir `index.html` directamente en el navegador para probar la interfaz, pero el chatbot no funcionará desde `file://` porque necesita la ruta serverless `/api/legaamaar`.

Para probarlo completo en local:

```bash
npm install -g vercel
vercel dev
```

Después abre la URL local que muestre Vercel, normalmente:

```text
http://localhost:3000
```

## Ajustes dentro de la app

- La API key de TMDB se puede guardar desde `Ajustes`.
- OpenRouter funciona de forma segura en Vercel usando `OPENROUTER_API_KEY` a través de `/api/legaamaar`.
- El campo `Routercode / API key de OpenRouter` queda como alternativa local, pero no hace falta usarlo en producción.

## Seguridad

No subas claves reales al repositorio. La clave de OpenRouter debe ir en variables de entorno de Vercel.
