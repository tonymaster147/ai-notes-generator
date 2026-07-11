/**
 * Vercel serverless function that proxies note generation to the
 * Gemini API. The API key lives in the GEMINI_API_KEY environment
 * variable on Vercel and never reaches the browser.
 */

const MODEL = 'gemini-2.5-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const MAX_CHARS = 100000

const STYLE_INSTRUCTIONS = {
  outline: `Create a hierarchical outline with numbered main topics, lettered subtopics, and short supporting points. Keep entries concise.`,
  bullets: `Create clean bullet-point notes grouped under short bold section headings. Each bullet must capture one idea in one line where possible.`,
  detailed: `Create detailed study notes with section headings, short explanatory paragraphs, bullet lists for key facts, and a "Key Takeaways" section at the end.`,
  qa: `Create question-and-answer flashcard notes. Write each as "**Q:** ..." followed by "**A:** ...". Cover every important concept in the material.`,
}

export function buildPrompt(sourceText, style) {
  return `You are an expert study-notes writer for a student learning platform.

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
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Strip BOM/whitespace that can sneak in when the env var is set via piped stdin
  const apiKey = (process.env.GEMINI_API_KEY || '').replace(/^\uFEFF/, '').trim()
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is not configured (missing API key).' })
  }

  const { text, style } = req.body || {}
  if (typeof text !== 'string' || text.trim().length < 100) {
    return res.status(400).json({ error: 'Please provide at least 100 characters of material.' })
  }

  try {
    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text.slice(0, MAX_CHARS), style) }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '')
      console.error('Gemini API error', upstream.status, errBody.slice(0, 500))
      if (upstream.status === 429) {
        return res
          .status(429)
          .json({ error: 'Too many requests right now. Please wait a moment and try again.' })
      }
      return res.status(502).json({ error: 'The AI service returned an error. Please try again.' })
    }

    const data = await upstream.json()
    const notes = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('')
      .trim()

    if (!notes) {
      return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' })
    }

    return res.status(200).json({ notes })
  } catch (err) {
    console.error('Generate handler failed:', err)
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again.' })
  }
}
