import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import i18n from '@/lib/i18n'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signOut: () => Promise<void>
    changeLanguage: (lang: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    // Function to change language and save it
    const changeLanguage = async (lang: string, userId?: string) => {
        if (!['fr', 'en', 'es', 'de', 'it'].includes(lang)) {
            console.warn('Invalid language code:', lang)
            return
        }

        // Change language immediately
        i18n.changeLanguage(lang)

        const targetUserId = userId || user?.id
        if (!targetUserId) {
            // If no user, just save to localStorage (handled by i18next)
            return
        }

        try {
            // Save to user_metadata
            const { error: metadataError } = await supabase.auth.updateUser({
                data: { language: lang }
            })

            if (metadataError) {
                console.error('Error updating user_metadata language:', metadataError)
            }

            // Save to profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: targetUserId,
                    language: lang,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                })

            if (profileError) {
                console.error('Error updating profiles language:', profileError)
            }
        } catch (error) {
            console.error('Error saving language preference:', error)
        }
    }

    // Function to load user language preference
    const loadUserLanguage = async (userId: string) => {
        try {
            // First, try to get from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('language')
                .eq('id', userId)
                .single()

            if (profile?.language && ['fr', 'en', 'es', 'de', 'it'].includes(profile.language)) {
                i18n.changeLanguage(profile.language)
                return
            }

            // If not in profiles, check user_metadata
            const { data: { user } } = await supabase.auth.getUser()
            const userLanguage = user?.user_metadata?.language
            
            if (userLanguage && ['fr', 'en', 'es', 'de', 'it'].includes(userLanguage)) {
                i18n.changeLanguage(userLanguage)
                return
            }

            // If no language set, detect from browser and save it
            const browserLang = navigator.language.split('-')[0]
            const detectedLang = ['fr', 'en', 'es', 'de', 'it'].includes(browserLang) ? browserLang : 'fr'
            
            // Save detected language
            await changeLanguage(detectedLang, userId)
        } catch (error) {
            console.error('Error loading user language:', error)
            // Fallback to browser detection or default
            const browserLang = navigator.language.split('-')[0]
            const detectedLang = ['fr', 'en', 'es', 'de', 'it'].includes(browserLang) ? browserLang : 'fr'
            i18n.changeLanguage(detectedLang)
        }
    }

    useEffect(() => {
        // Safety timeout - always set loading to false after 3 seconds max
        const timeoutId = setTimeout(() => {
            setLoading(false)
        }, 3000)

        // Wrap in try-catch to prevent crashes
        try {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            
            // Load user language preference if user is logged in
            if (session?.user?.id) {
                await loadUserLanguage(session.user.id)
            }
            
            setLoading(false)
                clearTimeout(timeoutId)
            }).catch((error) => {
                console.error('Error getting session:', error)
                setLoading(false)
                clearTimeout(timeoutId)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            
            // Load user language preference if user is logged in
            if (session?.user?.id) {
                await loadUserLanguage(session.user.id)
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
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Error signing out:', error)
                throw error
            }
            // Explicitly clear local state
            setUser(null)
            setSession(null)
        } catch (error) {
            console.error('Error during sign out:', error)
            // Still clear local state even if there's an error
            setUser(null)
            setSession(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, changeLanguage }}>
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
