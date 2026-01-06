import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox'
import { Loader2 } from 'lucide-react'

const CLASS_OPTIONS = [
    { value: 'B1 Albert', label: 'B1 Albert' },
    { value: 'B2 Albert', label: 'B2 Albert' },
    { value: 'B3 Albert', label: 'B3 Albert' },
    { value: 'M1/M2', label: 'M1/M2' },
    { value: 'B1 Eugenia', label: 'B1 Eugenia' },
    { value: 'B2 Eugenia', label: 'B2 Eugenia' },
    { value: 'B3 Eugenia', label: 'B3 Eugenia' },
]

interface AuthDialogProps {
    isOpen: boolean
    onClose: () => void
    defaultTab?: 'login' | 'signup'
}

export function AuthDialog({ isOpen, onClose, defaultTab = 'login' }: AuthDialogProps) {
    const [isLogin, setIsLogin] = useState(defaultTab === 'login')
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [selectedClass, setSelectedClass] = useState<string[]>([])

    // Fonction pour valider le domaine email
    const isValidEmailDomain = (email: string): boolean => {
        const allowedDomains = ['@eugeniaschool.com', '@albertschool.com']
        return allowedDomains.some(domain => email.toLowerCase().endsWith(domain))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            if (isForgotPassword) {
                // Validation de l'email
                if (!email || !email.includes('@')) {
                    setError('Veuillez entrer une adresse email valide.')
                    return
                }
                
                // Construire l'URL de redirection
                // Supabase utilise le hash fragment (#access_token=...) pour les SPA
                // On utilise simplement l'origin - Supabase ajoutera automatiquement le hash avec le token
                const redirectUrl = `${window.location.origin}${window.location.pathname}`
                
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl,
                })
                
                if (error) {
                    // Log l'erreur pour le debug
                    console.error('Reset password error:', {
                        message: error.message,
                        status: error.status,
                        name: error.name,
                    })
                    
                    // Messages d'erreur clairs
                    if (error.message.includes('rate limit') || error.message.includes('too many')) {
                        throw new Error('Trop de tentatives. Veuillez réessayer dans quelques minutes.')
                    } else {
                        // Ne pas révéler si l'email existe ou non (sécurité)
                        // Toujours afficher le message de succès même si l'email n'existe pas
                        // (pour éviter l'énumération d'emails)
                    }
                }
                
                // Toujours afficher le message de succès (même si l'email n'existe pas)
                // pour éviter l'énumération d'emails
                setSuccessMessage('Si cette adresse email existe, un lien de réinitialisation a été envoyé. Vérifiez votre boîte de réception et vos spams.')
                
                // Réinitialiser le champ email
                setEmail('')
                
                // Ne pas fermer automatiquement, laisser l'utilisateur lire le message
            } else if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                
                if (error) {
                    // Log l'erreur complète pour le debug
                    console.error('Login error:', {
                        message: error.message,
                        status: error.status,
                        name: error.name,
                    })
                    
                    // Messages d'erreur génériques pour éviter les fuites d'information
                    // Ne pas révéler si l'email existe ou non
                    if (error.message.includes('Invalid login credentials') || 
                        error.message.includes('Email not confirmed') ||
                        error.message.includes('Invalid password') ||
                        error.message.includes('Wrong password')) {
                        throw new Error('Email ou mot de passe incorrect')
                    } else if (error.message.includes('Too many requests')) {
                        throw new Error('Trop de tentatives. Veuillez réessayer plus tard.')
                    } else {
                        // Message générique pour les autres erreurs
                        throw new Error('Erreur de connexion. Veuillez réessayer.')
                    }
                }
                
                // Vérifier que la session a bien été créée
                if (!data.session) {
                    console.error('No session returned after login')
                    throw new Error('Erreur de connexion. Veuillez réessayer.')
                }
                
                onClose()
            } else {
                // Validation du domaine email pour l'inscription
                if (!isValidEmailDomain(email)) {
                    setError('Seules les adresses email @eugeniaschool.com et @albertschool.com sont autorisées pour créer un compte.')
                    setLoading(false)
                    return
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                            full_name: fullName,
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                            school: selectedClass[0] || '',
                        },
                    },
                })
                if (error) throw error
                onClose()
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPasswordClick = () => {
        setIsForgotPassword(true)
        setIsLogin(true)
        setError(null)
        setSuccessMessage(null)
        setPassword('')
    }

    const handleBackToLogin = () => {
        setIsForgotPassword(false)
        setIsLogin(true)
        setError(null)
        setSuccessMessage(null)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isForgotPassword 
                            ? 'Réinitialiser le mot de passe' 
                            : isLogin 
                            ? 'Welcome Back' 
                            : 'Create Account'}
                    </DialogTitle>
                    <DialogDescription>
                        {isForgotPassword
                            ? 'Entrez votre adresse email pour recevoir un lien de réinitialisation'
                            : isLogin
                            ? 'Enter your credentials to access your account'
                            : 'Join the community to share your projects'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {!isLogin && !isForgotPassword && (
                        <>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <MultiSelectCombobox
                                    label="Class"
                                    options={CLASS_OPTIONS}
                                    value={selectedClass}
                                    onChange={(val) => setSelectedClass(val.slice(-1))}
                                    renderItem={(option) => option.label}
                                    renderSelectedItem={(val) => val[0]}
                                    placeholder="Select your class..."
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="Email (@eugeniaschool.com ou @albertschool.com)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {!isLogin && !isForgotPassword && (
                            <p className="text-xs text-muted-foreground">
                                Seules les adresses email @eugeniaschool.com et @albertschool.com sont acceptées
                            </p>
                        )}
                    </div>

                    {!isForgotPassword && (
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required={!isForgotPassword}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isForgotPassword 
                                ? 'Envoyer l\'email de réinitialisation' 
                                : isLogin 
                                ? 'Sign In' 
                                : 'Sign Up'}
                        </Button>

                        {isForgotPassword ? (
                            <div className="text-center text-sm text-muted-foreground mt-2">
                                <button
                                    type="button"
                                    className="text-primary hover:underline font-medium"
                                    onClick={handleBackToLogin}
                                >
                                    Retour à la connexion
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-muted-foreground mt-2">
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium"
                                            onClick={() => setIsLogin(!isLogin)}
                                        >
                                            Sign Up
                                        </button>
                                        <br />
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium mt-1"
                                            onClick={handleForgotPasswordClick}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            className="text-primary hover:underline font-medium"
                                            onClick={() => setIsLogin(!isLogin)}
                                        >
                                            Sign In
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
