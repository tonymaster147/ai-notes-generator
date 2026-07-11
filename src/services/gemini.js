/**
 * Note generation service.
 *
 * Currently calls the Gemini API directly from the browser using
 * VITE_GEMINI_API_KEY. Anything shipped to the browser is visible to
 * visitors, so before going live swap API_URL for your own backend
 * endpoint that holds the key server-side — this file is the only
 * place that needs to change.
 */

const MODEL = 'gemini-2.5-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const STYLE_INSTRUCTIONS = {
  outline: `Create a hierarchical outline with numbered main topics, lettered subtopics, and short supporting points. Keep entries concise.`,
  bullets: `Create clean bullet-point notes grouped under short bold section headings. Each bullet must capture one idea in one line where possible.`,
  detailed: `Create detailed study notes with section headings, short explanatory paragraphs, bullet lists for key facts, and a "Key Takeaways" section at the end.`,
  qa: `Create question-and-answer flashcard notes. Write each as "**Q:** ..." followed by "**A:** ...". Cover every important concept in the material.`,
}

export async function generateNotes(sourceText, style = 'bullets') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing API key. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.',
    )
  }

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

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
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
    if (res.status === 400 && /api key/i.test(message)) {
      throw new Error('The API key is invalid. Please check VITE_GEMINI_API_KEY in .env.')
    }
    if (res.status === 429) {
      throw new Error('Too many requests right now. Please wait a moment and try again.')
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
