'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Button } from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true) // Toggle entre login/registro
  const router = useRouter()
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return createClient()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!supabase) {
      setLoading(false)
      setError('Configura las variables de Supabase para iniciar sesión.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } else if (data.user) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!supabase) {
      setLoading(false)
      setError('Configura las variables de Supabase para registrarte.')
      return
    }

    // Registrar usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 👇 Esto hace que no requiera confirmación de email
        emailRedirectTo: undefined,
      },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // Si el registro fue exitoso, hacer login automático
    if (signUpData.user) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      setLoading(false)

      if (signInError) {
        setError('Cuenta creada, pero hubo un error al iniciar sesión. Intenta hacer login.')
      } else if (signInData.user) {
        router.push('/dashboard')
        router.refresh()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-200/50 p-8 w-full max-w-md border border-white/20">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </h1>
          <p className="text-slate-600">
            {isLogin ? 'Accede a tu panel de control' : 'Comienza a automatizar tus ventas'}
          </p>
        </div>

        {/* Mensajes de Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (isLogin ? 'Ingresando...' : 'Creando cuenta...') 
              : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')
            }
          </Button>
        </form>

        {/* Toggle Login/Registro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            {isLogin 
              ? '¿No tienes cuenta? Crear una nueva' 
              : '¿Ya tienes cuenta? Iniciar sesión'
            }
          </button>
        </div>

        {/* Volver al inicio */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-cyan-600 transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
