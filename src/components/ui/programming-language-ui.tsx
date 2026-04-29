'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  BookOpen,
  Code2,
  Download,
  Eye,
  Layers,
  LogIn,
  PlayCircle,
  Sparkles,
  Terminal,
  WandSparkles,
  Zap,
} from 'lucide-react'

import { Playground } from '@/components/Playground'
import { AuthSection } from '@/components/ui/auth-section'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FlowLangFooter } from '@/components/ui/flowlang-footer'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

function TechCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      alpha: number
      size: number
      color: string
      drift: number
      update: () => void
      draw: (ctx: CanvasRenderingContext2D) => void
    }>
  >([])

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    let animationFrame = 0

    const render = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.globalCompositeOperation = 'lighter'

      for (let index = particlesRef.current.length - 1; index >= 0; index -= 1) {
        const particle = particlesRef.current[index]
        particle.update()
        particle.draw(context)
        if (particle.alpha <= 0) {
          particlesRef.current.splice(index, 1)
        }
      }

      context.globalCompositeOperation = 'source-over'
      animationFrame = window.requestAnimationFrame(render)
    }

    render()

    const onMove = (event: MouseEvent) => {
      const colors = ['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = 18 + Math.random() * 30

      particlesRef.current.push({
        x: event.clientX,
        y: event.clientY,
        alpha: 1,
        size,
        color,
        drift: -0.8 + Math.random() * 1.6,
        update() {
          this.y -= 0.35
          this.x += this.drift
          this.size *= 0.985
          this.alpha -= 0.018
        },
        draw(ctx) {
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
          gradient.addColorStop(0, `${this.color}cc`)
          gradient.addColorStop(0.28, `${this.color}66`)
          gradient.addColorStop(1, `${this.color}00`)
          ctx.globalAlpha = this.alpha
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        },
      })
    }

    window.addEventListener('mousemove', onMove)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 h-full w-full" />
}

function ProcessSection() {
  const steps = [
    {
      label: 'Tokens',
      title: 'Source becomes pieces',
      body: 'FlowLang first breaks code into readable parts like LET, IDENTIFIER, NUMBER, and STRING.',
      icon: Code2,
    },
    {
      label: 'Parse',
      title: 'Pieces become structure',
      body: 'The parser turns those tokens into an AST so loops, calls, tables, and UI commands have meaning.',
      icon: Layers,
    },
    {
      label: 'Execute',
      title: 'Structure becomes output',
      body: 'The interpreter runs the AST locally and produces console output, series, tables, and errors.',
      icon: Terminal,
    },
    {
      label: 'Render',
      title: 'UI stays inspectable',
      body: 'Visual DOM commands render into a safe preview tree instead of mutating the real page.',
      icon: Eye,
    },
  ]

  return (
    <section className="relative overflow-hidden border-y border-white/10 px-6 py-20 md:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.11),transparent_28%),radial-gradient(circle_at_80%_60%,rgba(139,92,246,0.10),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/55">
              Runtime pipeline
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
              Code stops being hidden work.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/52">
            Each stage is visible in the playground, so users can connect syntax, structure, execution, and UI.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.article
                key={step.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-sky-300/30 hover:bg-white/[0.055]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/40">
                    0{index + 1}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/25 text-sky-200">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.24em] text-sky-200/70">{step.label}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/55">{step.body}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SiteHeader({ onLogin }: { onLogin: () => void }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-background/75 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-left"
          aria-label="Go to FlowLang home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white text-sm font-black text-black">
            F
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.22em] text-white">FLOWLANG</span>
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-white/40 sm:block">
              Runtime Lab
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-5 text-sm text-white/58 md:flex">
          <button type="button" className="transition hover:text-white" onClick={() => scrollTo('playground')}>
            Playground
          </button>
          <button type="button" className="transition hover:text-white" onClick={() => scrollTo('docs')}>
            Features
          </button>
          <button type="button" className="transition hover:text-white" onClick={() => scrollTo('footer')}>
            Contact
          </button>
        </nav>

        <button
          type="button"
          onClick={onLogin}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <LogIn className="h-4 w-4" />
          Login
        </button>
      </div>
    </header>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const trigger = gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 82%',
        },
      },
    )

    return () => {
      trigger.scrollTrigger?.kill()
      trigger.kill()
    }
  }, [delay])

  return (
    <Card
      ref={cardRef}
      className="group relative overflow-hidden border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.06]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/8 via-violet-500/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-sky-300">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-7 text-white/60">{description}</p>
      </div>
    </Card>
  )
}

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const context = gsap.context(() => {
      gsap.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 })
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 70 },
        { opacity: 1, y: 0, duration: 1, delay: 0.1, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.25, ease: 'power3.out' },
      )
      gsap.fromTo(
        '.hero-cta',
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.45, ease: 'back.out(1.5)' },
      )
      gsap.fromTo(
        '.hero-orb',
        { opacity: 0, scale: 0.85, rotate: -8 },
        { opacity: 1, scale: 1, rotate: 0, duration: 1.1, delay: 0.15, ease: 'power3.out' },
      )
    }, heroRef)

    return () => context.revert()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-12 pt-24 md:px-10"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.08]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.16),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="max-w-3xl">
          <div className="hero-eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.26em] text-white/65">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            Browser-native UI scripting language lab
          </div>

          <div className="hero-title">
            <h1 className="text-5xl font-black leading-[0.94] tracking-[-0.06em] text-white md:text-7xl lg:text-[6.4rem]">
              See how code really works. Build while you learn.
            </h1>
          </div>

          <p className="hero-subtitle mt-8 max-w-2xl text-lg leading-8 text-white/62 md:text-xl">
            FlowLang is a browser-native programming language where your code does not just run. It reveals itself.
            Write programs. Watch them turn into tokens, syntax trees, output, and a live interface.
          </p>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/48">
            No setup. No JavaScript. No black boxes.
          </p>

          <div className="hero-cta mt-10 flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={() => scrollTo('playground')}
            >
              Open Playground
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo('docs')}>
              <BookOpen className="h-4 w-4" />
              Read Docs
            </Button>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ['Tokens', 'How code is read'],
              ['AST', 'How structure is understood'],
              ['UI', 'How it renders visually'],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur">
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="mt-2 text-xs leading-6 text-white/45">{detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/42">
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-emerald-400" />
              Client-side interpreter
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-sky-400" />
              Visual DOM preview
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-2 w-2 rounded-full bg-violet-400" />
              Series and table helpers
            </span>
          </div>
        </div>

        <div className="hero-orb relative">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-sky-500/20 via-transparent to-violet-500/20 blur-3xl" />
          <motion.div
            animate={{ y: [0, -16, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_40px_160px_rgba(0,0,0,0.55)] backdrop-blur-md"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/45">
                Live Runtime
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-white/10 bg-black/45 p-5">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] text-white/40">source.flow</div>
                <pre className="overflow-hidden rounded-2xl bg-black/40 p-4 font-mono text-sm leading-7 text-white/82">
{`let sales = [12, 18, 25, 31, 42]
let trend = linspace(0, 1, 5)

say mean(sales)
say std(sales)
say trend`}
                </pre>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-sky-400/20 bg-sky-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-sky-200/80">tokens</div>
                  <p className="mt-3 font-mono text-sm leading-6 text-white/80">LET IDENT EQUAL LBRACKET NUMBER NUMBER ...</p>
                </div>
                <div className="rounded-[24px] border border-violet-400/20 bg-violet-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-violet-200/80">ast</div>
                  <p className="mt-3 font-mono text-sm leading-6 text-white/80">Program -&gt; VariableDeclaration -&gt; CallExpression</p>
                </div>
                <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">output</div>
                  <p className="mt-3 font-mono text-sm leading-6 text-white/80">25.6{"\n"}series(0, 0.25, 0.5, 0.75, 1)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollTo('playground')}
        className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/50 backdrop-blur transition hover:bg-white/10 hover:text-white/75"
      >
        <PlayCircle className="h-4 w-4" />
        Jump to playground
      </button>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Code2,
      title: 'Minimal, Learnable Syntax',
      description: 'Small enough to learn in one sitting. Powerful enough to build something real.',
    },
    {
      icon: Zap,
      title: 'Control Flow That Feels Natural',
      description: 'Use repeat loops, for loops, ranges, and readable conditions without heavy syntax.',
    },
    {
      icon: Layers,
      title: 'Functions and Reuse',
      description: 'Create reusable blocks like func greet(name) and call them directly from FlowLang.',
    },
    {
      icon: Terminal,
      title: 'Structured Data',
      description: 'Use series math, table transforms, summaries, and filtering so FlowLang feels closer to a tiny notebook.',
    },
    {
      icon: Eye,
      title: 'Visual DOM Mode',
      description: 'UI commands render into a safe visual tree so you can inspect elements, structure, and events.',
    },
    {
      icon: WandSparkles,
      title: 'Errors That Teach',
      description: 'Mistakes come back clear, immediate, and helpful instead of crashing the whole experience.',
    },
  ]

  return (
    <section id="docs" className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-3xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
            From code to understanding
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
            FlowLang does not just execute code. It explains it.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/58">
            Every line becomes tokens, an AST, output, and when you use UI commands, a safe visual interface.
            Most tools hide what happens under the hood. FlowLang makes it visible.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CodeShowcase() {
  const codeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!codeRef.current) return

    const animation = gsap.fromTo(
      codeRef.current,
      { opacity: 0, x: -90 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: codeRef.current,
          start: 'top 74%',
        },
      },
    )

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [])

  return (
    <section className="relative px-6 py-28 md:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <h2 className="text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
            Build logic and UI in one language.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/58">
            FlowLang V2 introduces a safe UI layer and a lightweight data runtime. You can model data, render an
            interface, and handle interactions without leaving the language.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Loops', 'Functions', 'Series Math', 'Tables', 'Visual DOM', 'Logic'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div ref={codeRef}>
          <Card className="overflow-hidden border-white/10 bg-white/[0.04] p-0 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-sm text-white/55">
              <span>flowlang-demo.flow</span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/40">
                Browser Execution
              </span>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
              <pre className="whitespace-pre-wrap break-words border-b border-white/10 bg-black/35 p-6 font-mono text-sm leading-7 text-white/85 lg:border-b-0 lg:border-r lg:border-r-white/10">
{`let monthly = [120, 132, 141, 156]
let trend = linspace(118, 160, 4)
let report = table(
  ["month", "sales"],
  [["Jan", 120], ["Feb", 132], ["Mar", 141], ["Apr", 156]]
)

say mean(monthly)
say describe(report)
say trend`}
              </pre>
              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-white/40">lexer</div>
                  <p className="font-mono text-xs leading-6 text-sky-200/80">[LET, IDENTIFIER, EQUAL, LBRACKET, NUMBER, ...]</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-white/40">parser</div>
                  <p className="font-mono text-xs leading-6 text-violet-200/80">Program -&gt; ArrayLiteral -&gt; CallExpression</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.24em] text-white/40">interpreter</div>
                  <p className="font-mono text-xs leading-6 text-emerald-200/80">series(monthly){"\n"}table(report)</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function LanguageKitSection() {
  const downloads = [
    {
      title: 'Syntax Spec',
      detail: 'Keywords, operators, builtins, examples, and the compiler pipeline in JSON.',
      href: '/downloads/flowlang-syntax.json',
      label: 'Download JSON',
    },
    {
      title: 'Editor Grammar',
      detail: 'TextMate-compatible grammar you can use as the start of a VS Code language extension.',
      href: '/downloads/flowlang.tmLanguage.json',
      label: 'Download Grammar',
    },
    {
      title: 'Starter Program',
      detail: 'A real `.flow` file using tables, filters, rename, describe, and safe UI rendering.',
      href: '/downloads/flowlang-starter.flow',
      label: 'Download .flow',
    },
    {
      title: 'Runtime Notes',
      detail: 'A concise overview of lexer, parser, interpreter, Visual DOM, and supported APIs.',
      href: '/downloads/flowlang-runtime-notes.md',
      label: 'Download Notes',
    },
  ]

  return (
    <section className="relative px-6 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/55">
              Language kit
            </span>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
              Download the syntax. Study the compiler.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/58">
            FlowLang now ships like a real language project: syntax metadata, editor grammar, starter source,
            runtime notes, tests, and a browser compiler pipeline built from lexer to interpreter.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {downloads.map((item) => (
            <a
              key={item.href}
              href={item.href}
              download
              className="group flex min-h-[230px] flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-sky-300/35 hover:bg-white/[0.06]"
            >
              <span>
                <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/25 text-sky-200">
                  <Download className="h-5 w-5" />
                </span>
                <span className="block text-xl font-semibold text-white">{item.title}</span>
                <span className="mt-3 block text-sm leading-7 text-white/55">{item.detail}</span>
              </span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-200">
                {item.label}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const scrollToPlayground = () => {
    document.getElementById('playground')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative px-6 py-28 md:px-10">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-sky-500/15 via-violet-500/10 to-white/[0.04] p-10 text-center shadow-[0_40px_160px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">
            Start building and understanding at the same time.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            FlowLang is where code stops being magic and starts making sense.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-white/90" onClick={scrollToPlayground}>
              Open Playground
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Features
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function ProgrammingLanguageUI() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader onLogin={() => setAuthOpen(true)} />
      <TechCursor />
      <HeroSection />
      <Playground />
      <ProcessSection />
      <FeaturesSection />
      <CodeShowcase />
      <LanguageKitSection />
      <CTASection />
      <AnimatePresence>
        {authOpen && <AuthSection open={authOpen} onClose={() => setAuthOpen(false)} />}
      </AnimatePresence>
      <FlowLangFooter />
    </div>
  )
}

