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

## ⚠️ Before going live: protect your API key

Any `VITE_*` variable is bundled into the browser JavaScript, so the Gemini key
is **visible to every visitor** and could be abused. Fine for development, not
for production. Before launch:

1. Create a small backend endpoint (Node/Express, a serverless function, or a
   route on your existing site) that holds the key and forwards requests to Gemini.
2. Point the frontend at it — [src/services/gemini.js](src/services/gemini.js)
   is the **only** file that needs to change (swap `API_URL` and remove the key header).

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
    gemini.js                 AI call (swap this file for your backend later)
    fileParser.js             PDF/DOCX/TXT text extraction (lazy-loaded, in-browser)
```

## Features

- Paste text or drag-and-drop PDF / DOCX / TXT / MD files (max 15 MB)
- Four note styles: bullet points, structured outline, detailed summary, Q&A flashcards
- Files are parsed entirely in the browser — never uploaded to a server
- Copy notes or download as Markdown
- Responsive, matches Assignments4U branding
