'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, MessageCircle, Zap, Shield, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATS = [
  { value: '+340', label: 'PYMEs activas' },
  { value: '94%',  label: 'Automatizado'  },
  { value: '2.8s', label: 'Respuesta avg' },
]

const FEATURES = [
  { icon: Zap,        text: 'Respuestas en segundos, no horas' },
  { icon: TrendingUp, text: 'Métricas de ventas en tiempo real' },
  { icon: Shield,     text: 'Cifrado end-to-end con WhatsApp'  },
]

function LoginFormInner() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [isLogin, setIsLogin]           = useState(true)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') ?? '/dashboard'
  const supabase     = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isLogin) {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (err) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      } else if (data.user) {
        router.push(redirect)
        router.refresh()
      }
    } else {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setLoading(false)
        setError(signUpError.message)
        return
      }
      if (signUpData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (signInError) {
          setError('Cuenta creada. Verifica tu email o intenta iniciar sesión.')
        } else if (signInData.user) {
          router.push('/onboarding')
          router.refresh()
        }
      }
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (err) {
      setGoogleLoading(false)
      setError('Error al conectar con Google. Intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative z-10">
        <div
          className="absolute top-0 left-0 w-[480px] h-[480px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(10,186,181,0.06) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-[400px] mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors group w-fit"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
            Volver al inicio
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="w-full max-w-[400px] glass-card p-8"
        >
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)', boxShadow: 'var(--accent-glow)' }}>
              <span className="font-display font-black text-sm text-[#080c10]">W</span>
            </div>
            <span className="font-display font-bold text-xl tracking-[-0.02em]"
              style={{ color: 'var(--text-primary)' }}>
              WAAXP
            </span>
          </div>

          <div className="mb-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-display font-bold text-2xl tracking-[-0.03em] mb-1"
                  style={{ color: 'var(--text-primary)' }}>
                  {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {isLogin
                    ? 'Ingresa tus datos para acceder al panel'
                    : 'Comienza a automatizar tus ventas por WhatsApp'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-5 p-3.5 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
          >
            {googleLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>o con email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mb-5">
            <div className="floating-input">
              <input type="email" id="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                required placeholder=" " autoComplete="email" />
              <label htmlFor="email">Correo electrónico</label>
            </div>

            <div className="floating-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={6} placeholder=" " className="pr-10"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <label htmlFor="password">Contraseña</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword
                  ? <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  : <Eye    className="w-4 h-4" strokeWidth={1.75} />
                }
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="btn-accent w-full py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading
                ? (isLogin ? 'Ingresando...' : 'Creando cuenta...')
                : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')
              }
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null) }}
              className="font-semibold transition-colors hover:underline"
              style={{ color: 'var(--accent)' }}>
              {isLogin ? 'Crear una nueva' : 'Iniciar sesión'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="hidden lg:flex w-[480px] xl:w-[560px] flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }} />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'var(--accent)' }} />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'var(--accent)' }} />

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay: 0.15 }}
          className="relative z-10 px-12 max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', boxShadow: 'var(--accent-glow)' }}>
            <MessageCircle className="w-8 h-8" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
          </div>
          <h2 className="font-display font-extrabold text-3xl tracking-[-0.04em] mb-4 leading-tight"
            style={{ color: 'var(--text-primary)' }}>
            Automatiza tus ventas<br />por WhatsApp
          </h2>
          <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
            Bot de ventas 24/7 con IA. Recupera leads perdidos y mide tu ROI en tiempo real.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {STATS.map((s, i) => (
              <motion.div key={s.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <p className="font-display font-extrabold text-2xl tracking-[-0.03em]"
                  style={{ color: 'var(--accent)' }}>{s.value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3 text-left">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} strokeWidth={1.75} />
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  )
}
