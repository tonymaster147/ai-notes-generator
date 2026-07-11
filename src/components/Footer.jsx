import Logo from './Logo.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo height={28} />
          <p>
            Helping students learn faster with expert academic support and free
            AI-powered study tools.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href="https://www.assignments4u.com/">Home</a>
          <a href="https://www.assignments4u.com/services/">Services</a>
          <a href="https://www.assignments4u.com/reviews/">Reviews</a>
          <a href="https://www.assignments4u.com/contact-us/">Contact</a>
        </nav>
      </div>
      <div className="container footer-copy">
        © {new Date().getFullYear()} Assignments4U. All rights reserved.
      </div>
    </footer>
  )
}
