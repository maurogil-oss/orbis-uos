import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

export interface InstitucionalUser {
  id: string
  email: string
  name: string
  cargo?: string
  orgao?: string
}

interface AuthContextType {
  user: InstitucionalUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  changePassword: (
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string,
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InstitucionalUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const syncAuthUser = () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      const model = pb.authStore.record
      setUser({
        id: model.id,
        email: model.email,
        name: model.name || model.email.split('@')[0],
        cargo: (model as any).cargo || 'Servidor Público Autorizado',
        orgao: (model as any).orgao || 'Gabinete Municipal',
      })
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    syncAuthUser()
    setIsLoading(false)

    // Ouvir alterações de sessão no PocketBase SDK
    const unsubscribe = pb.authStore.onChange(() => {
      syncAuthUser()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await pb.collection('users').authWithPassword(email.trim(), password)
      syncAuthUser()
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    newPasswordConfirm: string,
  ) => {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      throw new Error('Usuário não está autenticado.')
    }
    if (newPassword.length < 8) {
      throw new Error('A nova senha deve possuir pelo menos 8 caracteres.')
    }
    if (newPassword !== newPasswordConfirm) {
      throw new Error('A confirmação da nova senha não confere.')
    }

    const userId = pb.authStore.record.id

    // Chamada ao endpoint nativo de update do usuário com oldPassword e password
    await pb.collection('users').update(userId, {
      oldPassword,
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    })

    // Atualizar / sincronizar estado da sessão institucional
    syncAuthUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && pb.authStore.isValid,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
