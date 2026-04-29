'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Lock, Mail, User, X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'

import { supabase, supabaseEnabled } from '@/lib/supabase'

const vertexSmokeySource = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.5;
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

type BlurSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const blurClassMap: Record<BlurSize, string> = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return [r, g, b]
}

function SmokeyBackground({
  backdropBlurAmount = 'sm',
  color = '#1E40AF',
  className = '',
}: {
  backdropBlurAmount?: BlurSize
  color?: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hoverRef = useRef(false)
  const mousePositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution')
    const iTimeLocation = gl.getUniformLocation(program, 'iTime')
    const iMouseLocation = gl.getUniformLocation(program, 'iMouse')
    const uColorLocation = gl.getUniformLocation(program, 'u_color')

    const [r, g, b] = hexToRgb(color)
    gl.uniform3f(uColorLocation, r, g, b)

    let frame = 0
    let animationFrame = 0

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)

      gl.uniform2f(iResolutionLocation, width, height)
      gl.uniform1f(iTimeLocation, frame)
      gl.uniform2f(
        iMouseLocation,
        hoverRef.current ? mousePositionRef.current.x : width / 2,
        hoverRef.current ? height - mousePositionRef.current.y : height / 2,
      )

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      frame += 0.016
      animationFrame = window.requestAnimationFrame(render)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePositionRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const handleMouseEnter = () => {
      hoverRef.current = true
    }

    const handleMouseLeave = () => {
      hoverRef.current = false
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    render()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [color])

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className={`absolute inset-0 ${blurClassMap[backdropBlurAmount]}`} />
    </div>
  )
}

export function AuthSection({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, open])

  useEffect(() => {
    if (!supabase) return

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!supabaseEnabled || !supabase) {
      setStatus('Supabase is wired in the app, but it needs your project URL and anon key before auth can go live.')
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setStatus('Signed in. Your workspace session is ready.')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })
        if (error) throw error
        setStatus('Account created. Check your email to confirm the session if your Supabase project requires it.')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong while talking to Supabase.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabaseEnabled || !supabase) {
      setStatus('Google sign-in is ready in the UI, but it needs your Supabase credentials and Google provider setup.')
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setStatus(error.message)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return

    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)

    if (error) {
      setStatus(error.message)
      return
    }

    setStatus('Signed out. See you soon.')
  }

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="FlowLang login"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        id="auth-panel"
        className="relative my-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto overflow-x-hidden rounded-[34px] border border-white/10 bg-[#050816] shadow-[0_35px_140px_rgba(0,0,0,0.65)]"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-white/75 backdrop-blur transition hover:bg-white hover:text-black"
          aria-label="Close login"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative z-10 hidden flex-col justify-between border-b border-white/10 bg-black/25 p-6 lg:flex lg:border-b-0 lg:border-r lg:border-white/10 lg:p-10">
            <div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
                Auth and workspace
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] text-white md:text-5xl">
                Sign in without leaving the page.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/58 md:text-base">
                Supabase auth is connected. This modal keeps the flow fast, so you can jump back into the playground
                after signing in.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {[
                ['Email auth', 'Sign in or create an account'],
                ['Google auth', 'One-click login flow is prepared'],
                ['Workspace ready', 'Built for saved FlowLang projects'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-1 text-xs leading-6 text-white/45">{copy}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[620px] max-lg:min-h-[auto]">
          <div className="absolute inset-0">
            <SmokeyBackground color="#2563eb" backdropBlurAmount="sm" />
          </div>

          <div className="relative z-10 flex min-h-[640px] items-center justify-center p-5 max-lg:min-h-[auto] sm:p-8">
            <div className="w-full max-w-sm space-y-6 rounded-[28px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-bold text-white">Welcome Back</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    {session?.user?.email
                      ? `Signed in as ${session.user.email}`
                      : mode === 'signin'
                        ? 'Sign in to continue with FlowLang.'
                        : 'Create your FlowLang workspace.'}
                  </p>
                </div>
                <div className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                  {supabaseEnabled ? 'live' : 'pending'}
                </div>
              </div>

              {!session && (
                <div className="grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      mode === 'signin' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      mode === 'signup' ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {!session ? (
                <form className="space-y-8" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="relative z-0">
                    <input
                      type="text"
                      id="floating_name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-0"
                      placeholder=" "
                    />
                    <label
                      htmlFor="floating_name"
                      className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-300 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-400"
                    >
                      <User className="mr-2 inline-block -mt-1" size={16} />
                      Full Name
                    </label>
                  </div>
                )}

                <div className="relative z-0">
                  <input
                    type="email"
                    id="floating_email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-0"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_email"
                    className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-300 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-400"
                  >
                    <Mail className="mr-2 inline-block -mt-1" size={16} />
                    Email Address
                  </label>
                </div>

                <div className="relative z-0">
                  <input
                    type="password"
                    id="floating_password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent px-0 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-0"
                    placeholder=" "
                    required
                  />
                  <label
                    htmlFor="floating_password"
                    className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-300 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-400"
                  >
                    <Lock className="mr-2 inline-block -mt-1" size={16} />
                    Password
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    {supabaseEnabled ? 'Supabase connected' : 'Waiting for Supabase project keys'}
                  </span>
                  <a href="#footer" className="text-xs text-gray-300 transition hover:text-white">
                    Need help?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Working...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-400/30" />
                  <span className="mx-4 flex-shrink text-xs text-gray-400">OR CONTINUE WITH</span>
                  <div className="flex-grow border-t border-gray-400/30" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex w-full items-center justify-center rounded-lg bg-white/90 px-4 py-2.5 font-semibold text-gray-700 transition-all duration-300 hover:bg-white"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                  </svg>
                  Sign in with Google
                </button>
                </form>
              ) : (
                <div className="space-y-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">Current session</div>
                    <div className="text-sm text-white/80">{session.user.email}</div>
                    <div className="text-xs text-white/45">
                      Provider: {session.user.app_metadata.provider ?? 'email'}
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-white/62">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      This account is now connected to the real Supabase project. Next we can add saved programs,
                      project history, and protected workspaces.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="group flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 font-semibold text-black transition-all duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? 'Working...' : 'Sign Out'}
                    <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {status && (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-white/72">
                  {status}
                </div>
              )}

              <p className="text-center text-xs text-gray-400">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </motion.div>
  )
}
