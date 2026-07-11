# AI Notes Generator — Assignments4U

A free study tool that converts pasted text or uploaded documents (PDF, DOCX, TXT, MD)
into clean, organized study notes using Google's Gemini AI.

Built with **Vite + React** (plain JavaScript).

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Configuration

Copy `.env.example` to `.env` and set your Gemini API key
(get one at https://aistudio.google.com/apikey):

```
VITE_GEMINI_API_KEY=your-key-here
```

Restart the dev server after changing `.env`.

## Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy it to any static host.

## Deployment (Vercel)

The app is deployed on Vercel. The Gemini key is stored server-side as the
`GEMINI_API_KEY` environment variable and used only by the serverless function
in [api/generate.js](api/generate.js) — it is never shipped to the browser.

To redeploy after changes:

```bash
npx vercel --prod
```

Note: in local dev (`npm run dev`) there is no serverless runtime, so the app
falls back to calling Gemini directly with `VITE_GEMINI_API_KEY` from `.env`
(dev-only; that key stays on your machine and is git-ignored).

## Project structure

```
src/
  App.jsx                     Page layout: hero, how-it-works, features, FAQ
  components/
    Header.jsx / Footer.jsx   Site chrome with Assignments4U branding
    Logo.jsx                  SVG recreation of the A4U logo
    NotesGenerator.jsx        The tool: paste/upload tabs, style picker, generate
    NotesOutput.jsx           Rendered notes with copy / download / reset
  services/
    gemini.js                 Calls /api/generate (dev fallback: direct Gemini)
    fileParser.js             PDF/DOCX/TXT text extraction (lazy-loaded, in-browser)
api/
  generate.js                 Vercel serverless function holding the Gemini key
```

## Features

- Paste text or drag-and-drop PDF / DOCX / TXT / MD files (max 15 MB)
- Four note styles: bullet points, structured outline, detailed summary, Q&A flashcards
- Files are parsed entirely in the browser — never uploaded to a server
- Copy notes or download as Markdown
- Responsive, matches Assignments4U branding
