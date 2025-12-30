import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isRecoveryMode: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRecoveryMode, setIsRecoveryMode] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setLoading(false)
        }, 3000)

        // Check handle recovery in URL before session check
        if (window.location.hash && window.location.hash.includes('type=recovery')) {
            setIsRecoveryMode(true)
        }

        try {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
                clearTimeout(timeoutId)
            }).catch((error) => {
                console.error('Error getting session:', error)
                setLoading(false)
                clearTimeout(timeoutId)
            })

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (event === 'PASSWORD_RECOVERY') {
                    setIsRecoveryMode(true)
                }

                setLoading(false)
                clearTimeout(timeoutId)
            })

            return () => {
                clearTimeout(timeoutId)
                if (subscription) {
                    subscription.unsubscribe()
                }
            }
        } catch (error) {
            console.error('Error initializing auth:', error)
            setLoading(false)
            clearTimeout(timeoutId)
        }
    }, [])

    const signOut = async () => {
        setIsRecoveryMode(false)
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, isRecoveryMode, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
