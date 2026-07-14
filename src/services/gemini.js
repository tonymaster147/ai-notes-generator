/**
 * Note generation service.
 *
 * In production the browser calls our own server-side endpoint
 * (api/generate.php on the Assignments4U host, or api/generate.js
 * on Vercel), which holds the Gemini API key server-side — the key
 * is never shipped to visitors.
 *
 * During local development (`npm run dev`) there is no serverless
 * runtime, so if VITE_GEMINI_API_KEY is set in .env the browser
 * calls Gemini directly instead. That key stays on your machine.
 */

const DEV_MODEL = 'gemini-2.5-flash'
const DEV_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${DEV_MODEL}:generateContent`

export async function generateNotes(sourceText, style = 'bullets') {
  if (import.meta.env.DEV && import.meta.env.VITE_GEMINI_API_KEY) {
    return generateNotesDirect(sourceText, style)
  }

  const res = await fetch(`${import.meta.env.BASE_URL}api/generate.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: sourceText, style }),
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    /* non-JSON error page */
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status}). Please try again.`)
  }
  if (!data?.notes) {
    throw new Error('The AI returned an empty response. Please try again.')
  }
  return data.notes
}

/* ---------- Dev-only direct call ---------- */

const STYLE_INSTRUCTIONS = {
  outline: `Create a hierarchical outline with numbered main topics, lettered subtopics, and short supporting points. Keep entries concise.`,
  bullets: `Create clean bullet-point notes grouped under short bold section headings. Each bullet must capture one idea in one line where possible.`,
  detailed: `Create detailed study notes with section headings, short explanatory paragraphs, bullet lists for key facts, and a "Key Takeaways" section at the end.`,
  qa: `Create question-and-answer flashcard notes. Write each as "**Q:** ..." followed by "**A:** ...". Cover every important concept in the material.`,
}

async function generateNotesDirect(sourceText, style) {
  const prompt = `You are an expert study-notes writer for a student learning platform.

Convert the material below into clear, well-organized study notes.

Formatting rules:
- ${STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.bullets}
- Use Markdown formatting (headings, bold key terms, bullet lists).
- Start with a single H2 title summarizing the topic.
- Highlight definitions, dates, formulas, and names in **bold**.
- Do not add information that is not in the material.
- Do not include any preamble or closing remarks — output only the notes.

MATERIAL:
"""
${sourceText}
"""`

  const res = await fetch(DEV_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    }),
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const err = await res.json()
      if (err?.error?.message) message = err.error.message
    } catch {
      /* keep default message */
    }
    throw new Error(message)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('The AI returned an empty response. Please try again.')
  }
  return text
}
