/**
 * Extracts plain text from uploaded files (TXT, MD, PDF, DOCX).
 * PDF parsing uses pdfjs-dist; DOCX uses mammoth. Both run fully
 * in the browser — no file ever leaves the user's machine here.
 * The parser libraries are heavy, so they are dynamically imported
 * only when a matching file is actually uploaded.
 */

export const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx']
export const MAX_FILE_MB = 15

export async function extractTextFromFile(file) {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`)
  }

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

  if (ext === '.txt' || ext === '.md') {
    return await file.text()
  }

  if (ext === '.pdf') {
    return await extractPdf(file)
  }

  if (ext === '.docx') {
    const { default: mammoth } = await import('mammoth/mammoth.browser')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  throw new Error(
    `Unsupported file type "${ext}". Please upload ${ACCEPTED_EXTENSIONS.join(', ')}.`,
  )
}

async function extractPdf(file) {
  const [pdfjsLib, { default: pdfWorkerUrl }] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => item.str).join(' '))
  }

  const text = pages.join('\n\n').trim()
  if (!text) {
    throw new Error(
      'No readable text found in this PDF. It may be a scanned document (image-only).',
    )
  }
  return text
}
