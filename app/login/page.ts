'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Verificar si ya hay sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        router.push('/dashboard')
      }
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: '#1a202c',
            marginBottom: '0.5rem'
          }}>
            Dashboard Levi 🤖
          </h1>
          <p style={{ color: '#718096', fontSize: '0.95rem' }}>
            Bot de ventas WhatsApp
          </p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#667eea',
                  brandAccent: '#764ba2'
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar sesión',
                loading_button_label: 'Iniciando sesión...',
                link_text: '¿Ya tienes cuenta? Inicia sesión'
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Registrarse',
                loading_button_label: 'Registrando...',
                link_text: '¿No tienes cuenta? Regístrate'
              },
              forgotten_password: {
                link_text: '¿Olvidaste tu contraseña?',
                button_label: 'Enviar instrucciones',
                loading_button_label: 'Enviando...'
              }
            }
          }}
          providers={[]}
          view="sign_in"
        />
      </div>
    </div>
  )
}
