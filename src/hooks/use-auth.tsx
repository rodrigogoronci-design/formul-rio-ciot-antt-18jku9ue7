import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import type { AuthModel } from 'pocketbase'

interface AuthContextType {
  user: AuthModel | null
  signUp: (email: string, pass: string) => Promise<{ error: string | null }>
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>
  signOut: () => void
  recoverPassword: (email: string) => Promise<{ error: string | null }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthModel | null>(pb.authStore.record)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record)
    })
    setLoading(false)
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, pass: string) => {
    try {
      await pb.collection('users').create({ email, password: pass, passwordConfirm: pass })
      await pb.collection('users').authWithPassword(email, pass)
      return { error: null }
    } catch (err) {
      return { error: getErrorMessage(err) }
    }
  }

  const signIn = async (email: string, pass: string) => {
    try {
      await pb.collection('users').authWithPassword(email, pass)
      return { error: null }
    } catch (err) {
      return { error: getErrorMessage(err) }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  const recoverPassword = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (err) {
      return { error: getErrorMessage(err) }
    }
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, recoverPassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
