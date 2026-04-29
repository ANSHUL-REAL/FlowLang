import { motion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export function TextHoverEffect({
  text,
  duration,
  automatic = false,
  className,
}: {
  text: string
  duration?: number
  automatic?: boolean
  className?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rawId = useId()
  const id = rawId.replace(/:/g, '')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' })

  useEffect(() => {
    if (!svgRef.current) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
    const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
    setMaskPosition({
      cx: `${cxPercentage}%`,
      cy: `${cyPercentage}%`,
    })
  }, [cursor])

  useEffect(() => {
    if (!automatic || hovered) return

    let frame = 0
    let animationFrame = 0

    const animate = () => {
      frame += 0.018
      setMaskPosition({
        cx: `${50 + Math.cos(frame) * 28}%`,
        cy: `${50 + Math.sin(frame * 1.4) * 24}%`,
      })
      animationFrame = window.requestAnimationFrame(animate)
    }

    animationFrame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [automatic, hovered])

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 600 120"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(event) => setCursor({ x: event.clientX, y: event.clientY })}
      className={cn('select-none uppercase', className)}
      role="img"
      aria-label={text}
    >
      <defs>
        <linearGradient id={`${id}-text-gradient`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="120">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="25%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#80eeb4" />
          <stop offset="75%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        <motion.radialGradient
          id={`${id}-reveal-mask`}
          gradientUnits="userSpaceOnUse"
          r="26%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0.18, ease: 'easeOut' }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`${id}-text-mask`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-reveal-mask)`} />
        </mask>
      </defs>

      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.8"
        className="fill-transparent stroke-white/20 font-sans text-[76px] font-black tracking-[-0.08em]"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.8"
        className="fill-transparent stroke-[#3ca2fa99] font-sans text-[76px] font-black tracking-[-0.08em]"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke={`url(#${id}-text-gradient)`}
        strokeWidth="0.9"
        mask={`url(#${id}-text-mask)`}
        className="fill-transparent font-sans text-[76px] font-black tracking-[-0.08em]"
      >
        {text}
      </text>
    </svg>
  )
}

export function FooterBackgroundGradient() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: 'radial-gradient(125% 125% at 50% 10%, #0F0F1166 50%, #3ca2fa33 100%)',
      }}
    />
  )
}
