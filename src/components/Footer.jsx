const TOOLS = [
  { label: 'Spell Checker', href: 'https://www.assignments4u.com/spell-checker/' },
  { label: 'Grammar Checker', href: 'https://www.assignments4u.com/grammar-checker/' },
  { label: 'Factoring Calculator', href: 'https://www.assignments4u.com/factoring-calculator/' },
  { label: 'Plagiarism Checker', href: 'https://www.assignments4u.com/plagiarism-checker/' },
]

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="13" fill="var(--a4u-primary)" />
      <path
        d="m7.5 13.2 3.6 3.6 7.4-7.4"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer>
      <section className="tools-section">
        <div className="container">
          <h2 className="tools-title">Other Free Tools We Provide</h2>
          <ul className="tools-grid">
            {TOOLS.map((tool) => (
              <li key={tool.label}>
                <a href={tool.href}>
                  <CheckIcon />
                  {tool.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="footer-bar">
        <div className="container">
          Assignments4u.com Copyright © 2013-{new Date().getFullYear()} All
          Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
