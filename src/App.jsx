import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import NotesGenerator from './components/NotesGenerator.jsx'
import './App.css'

const STEPS = [
  {
    title: 'Add your material',
    text: 'Paste text or upload a PDF, DOCX, or TXT file — lectures, chapters, articles, anything you need to study.',
  },
  {
    title: 'Pick a note style',
    text: 'Choose bullet points, a structured outline, a detailed summary, or Q&A flashcards.',
  },
  {
    title: 'Get clear notes',
    text: 'AI organizes the key concepts into clean, highlighted notes you can copy or download in seconds.',
  },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Fast and free',
    text: 'Turn pages of material into organized notes within seconds — no sign-up walls, no cost.',
  },
  {
    icon: '🎯',
    title: 'Key concepts highlighted',
    text: 'Definitions, dates, formulas, and names are automatically bolded so the essentials stand out.',
  },
  {
    icon: '📄',
    title: 'Works with your files',
    text: 'PDF, DOCX, TXT, and Markdown files are read directly in your browser — nothing is stored.',
  },
  {
    icon: '🗂️',
    title: 'Four note styles',
    text: 'Outlines for structure, bullets for speed, summaries for depth, flashcards for revision.',
  },
]

const FAQS = [
  {
    q: 'Is the AI notes generator free to use?',
    a: 'Yes. The tool is completely free — paste or upload your material and generate as many notes as you need.',
  },
  {
    q: 'What file types can I upload?',
    a: 'PDF, DOCX, TXT, and Markdown files up to 15 MB. Files are read directly in your browser and are never uploaded to our servers.',
  },
  {
    q: 'Can I use the notes for exam revision?',
    a: 'Absolutely. Choose the Q&A flashcards style to turn any material into ready-made revision questions, or the outline style for a structured overview.',
  },
  {
    q: 'How accurate are the generated notes?',
    a: 'The AI only summarizes what is in your material and never invents facts. Still, always review notes against the original source before an exam.',
  },
]

export default function App() {
  return (
    <>
      <Header />

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-panel">
              <h1>AI Notes Generator</h1>
              <p className="hero-tagline">
                Convert any material into clear notes within minutes. Learn
                faster and better by organizing information and highlighting
                key concepts.
              </p>
              <ul className="hero-points">
                <li>✔ Paste text or upload PDF &amp; DOCX</li>
                <li>✔ Four note styles, including flashcards</li>
                <li>✔ Copy or download your notes instantly</li>
              </ul>
            </div>
            <div className="hero-tool">
              <NotesGenerator />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">How it works</h2>
            <div className="steps-grid">
              {STEPS.map((step, i) => (
                <div className="step-card" key={step.title}>
                  <span className="step-number">{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <h2 className="section-title">Why students use our notes generator</h2>
            <div className="features-grid">
              {FEATURES.map((f) => (
                <div className="feature-card" key={f.title}>
                  <span className="feature-icon" aria-hidden="true">
                    {f.icon}
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container faq-container">
            <h2 className="section-title">Frequently asked questions</h2>
            {FAQS.map((faq) => (
              <details className="faq-item" key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
