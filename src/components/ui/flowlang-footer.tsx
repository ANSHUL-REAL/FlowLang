import { ArrowUpRight, Github, Linkedin, Mail, Play } from 'lucide-react'

import { FooterBackgroundGradient, TextHoverEffect } from '@/components/ui/text-hover-effect'

export function FlowLangFooter() {
  const scrollToPlayground = () => {
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <footer id="footer" className="relative overflow-hidden border-t border-white/10 px-6 py-16 md:px-10">
      <FooterBackgroundGradient />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="h-24 sm:h-36 md:h-48">
          <TextHoverEffect text="FLOWLANG" automatic duration={0.18} className="h-full w-full" />
        </div>

        <div className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[1.2fr_0.85fr_0.95fr]">
          <div>
            <p className="max-w-xl text-sm leading-7 text-white/55">
              FlowLang is a browser-native language lab for learning, scripting, data experiments, and safe UI
              prototyping. Code becomes tokens, AST nodes, runtime output, tables, and interface previews.
            </p>
            <button
              type="button"
              onClick={scrollToPlayground}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <Play className="h-4 w-4" />
              Run FlowLang
            </button>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">What ships today</h3>
            <div className="mt-5 grid gap-3 text-sm text-white/60">
              <span>Series math and table transforms</span>
              <span>Visual DOM preview</span>
              <span>Live playground with output console</span>
              <span>Supabase-ready auth shell</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-white/35">Contact</h3>
            <div className="mt-5 grid gap-3 text-sm text-white/60">
              <a
                className="inline-flex items-center gap-2 transition hover:text-white"
                href="https://www.linkedin.com/in/anshul-nautiyal-42760236b/"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                className="inline-flex items-center gap-2 transition hover:text-white"
                href="https://github.com/ANSHUL-REAL"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                className="inline-flex items-center gap-2 break-all transition hover:text-white"
                href="mailto:anshulnautiyal2006@gmail.com"
              >
                <Mail className="h-3.5 w-3.5" />
                anshulnautiyal2006@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <span>FlowLang V2</span>
          <span>Code -&gt; Tokens -&gt; AST -&gt; Interpreter -&gt; Data -&gt; UI</span>
        </div>
      </div>
    </footer>
  )
}
