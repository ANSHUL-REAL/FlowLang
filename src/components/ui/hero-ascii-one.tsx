import { ArrowDown } from 'lucide-react'

const meterHeights = [10, 17, 8, 21, 13, 26, 11, 18]
const dotRows = Array.from({ length: 15 })
const dotColumns = Array.from({ length: 30 })

export default function HeroAsciiOne() {
  const scrollToPlayground = () => {
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="hero-shell">
      <div className="ascii-background" aria-hidden="true">
        <div className="stars-layer" />
        <div className="snow-field" />
      </div>

      <header className="ascii-header">
        <div className="ascii-brand">
          <strong>FLOWLANG</strong>
          <i />
          <span>EST. 2026</span>
        </div>
        <div className="ascii-coords">
          <span>LEX: 37.7749</span>
          <b />
          <span>AST: 122.4194</span>
        </div>
      </header>

      <div className="corner-frame top-left" />
      <div className="corner-frame top-right" />
      <div className="corner-frame bottom-left" />
      <div className="corner-frame bottom-right" />

      <button className="side-arrow left-arrow" type="button" aria-label="Previous visual">
        {'<'}
      </button>
      <button className="side-arrow right-arrow" type="button" aria-label="Next visual">
        {'>'}
      </button>

      <div className="ascii-content">
        <div className="ascii-art-panel" aria-hidden="true">
          <div className="golden-frame">
            <div className="big-arc" />
            <div className="small-arc" />
            <div className="horizon-line" />
            <div className="lower-line" />

            <div className="code-sphere">
              {dotRows.map((_, row) => (
                <span key={row}>
                  {dotColumns.map((__, column) => (
                    <i key={`${row}-${column}`} />
                  ))}
                </span>
              ))}
              <div className="ball-wave wave-one" />
              <div className="ball-wave wave-two" />
              <div className="ball-wave wave-three" />
            </div>

            <div className="ball-scan" />

            <pre className="ascii-sculpture">{
              "                           ___\n" +
              "                        .-'   '-.\n" +
              "                     .-'  .---.  '-.\n" +
              "                   .'   .'     `.   `.\n" +
              "                  /   .'  .-.    `.   \\\\\n" +
              "                 /  .'   /   \\\\     `.  \\\\\n" +
              "                / .'    /     \\\\      `. \\\\\n" +
              "               /_/_____/_______\\\\_______\\\\_\\\\\n" +
              "                   /   /  _  \\\\   \\\\\n" +
              "                  /   /  ( )  \\\\   \\\\\n" +
              "                 /   / .-^^^-. \\\\   \\\\\n" +
              "                /   / /  ___  \\\\ \\\\   \\\\\n" +
              "               /   / /  /   \\\\  \\\\ \\\\   \\\\\n" +
              "              /   / /  /     \\\\  \\\\ \\\\   \\\\\n" +
              "             /   /_/__/       \\\\__\\\\_\\\\   \\\\\n" +
              "            /      /  _  ___  _  \\\\      \\\\\n" +
              "           /      /  / \\\\/   \\\\/ \\\\  \\\\      \\\\\n" +
              "          /______/  /   \\\\___/   \\\\  \\\\______\\\\\n" +
              "             /_____/             \\\\_____\\\\"
            }</pre>

            <div className="mini-diagram">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="ascii-panel">
          <div className="decor-line">
            <i />
            <span>INF</span>
            <i />
          </div>

          <div className="title-wrap">
            <div className="dither-bar" aria-hidden="true" />
            <h1>ENTER FLOWLANG</h1>
          </div>

          <div className="dot-strip" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>

          <div className="ascii-description">
            <p>
              Every line becomes tokens, trees, and output. Learn the language by watching each command move
              through the interpreter in real time.
            </p>
            <span aria-hidden="true" />
          </div>

          <div className="ascii-actions">
            <button type="button" onClick={scrollToPlayground}>
              <span className="button-corner corner-a" />
              <span className="button-corner corner-b" />
              ENTER FLOWLANG
            </button>
            <button type="button" onClick={scrollToPlayground}>
              OPEN PLAYGROUND
            </button>
          </div>

          <div className="protocol-line">
            <span>INF</span>
            <i />
            <strong>FLOWLANG.PROTOCOL</strong>
          </div>
        </div>
      </div>

      <footer className="ascii-footer">
        <div className="system-status">
          <span>SYSTEM.ACTIVE</span>
          <div>
            {meterHeights.map((height, index) => (
              <i key={index} style={{ height }} />
            ))}
          </div>
          <span>V1.0.0</span>
        </div>
        <div className="render-status">
          <span>RENDERING</span>
          <i />
          <i />
          <i />
          <span>FRAME: INF</span>
        </div>
      </footer>

      <button className="scroll-cue" type="button" onClick={scrollToPlayground} aria-label="Scroll to playground">
        <span>SCROLL</span>
        <ArrowDown size={16} />
      </button>
    </section>
  )
}
