'use client'
import { MotionConfig } from 'motion/react'
import { ToastProvider } from './toast'

/** Las animaciones por JS (Stepper) no obedecen el CSS de prefers-reduced-motion: se lo indicamos acá. */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user"><ToastProvider>{children}</ToastProvider></MotionConfig>
}
