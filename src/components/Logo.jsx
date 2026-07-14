/**
 * Assignments4U logo — official white wordmark (logo-light.png).
 * The logo is white, so always place it on a dark background
 * (header and footer both use the brand blue).
 */
export default function Logo({ height = 30 }) {
  return (
    <a
      href="https://www.assignments4u.com/"
      aria-label="Assignments4U home"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-light.png`}
        alt="Assignments4U"
        height={height}
        style={{ display: 'block', width: 'auto' }}
      />
    </a>
  )
}
