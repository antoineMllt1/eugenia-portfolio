import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react'

interface UpdatePasswordDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function UpdatePasswordDialog({ isOpen, onClose }: UpdatePasswordDialogProps) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Le mot de passe doit faire au moins 6 caractères.')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            // Clear URL fragment to avoid re-triggering
            window.location.hash = ''

            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Nouveau mot de passe</DialogTitle>
                    <DialogDescription className="text-center">
                        Veuillez définir votre nouveau mot de passe pour sécuriser votre compte.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-6 text-center space-y-3">
                        <div className="text-green-600 font-medium">Mot de passe mis à jour !</div>
                        <p className="text-sm text-muted-foreground">Vous allez être redirigé vers l'accueil...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nouveau mot de passe</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmer le mot de passe</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="******"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Mettre à jour le mot de passe
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
