import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface ResetPasswordDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function ResetPasswordDialog({ isOpen, onClose, onSuccess }: ResetPasswordDialogProps) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Réinitialiser l'état quand le dialog s'ouvre/ferme
    useEffect(() => {
        if (isOpen) {
            // Réinitialiser les champs quand le dialog s'ouvre
            setPassword('')
            setConfirmPassword('')
            setError(null)
            setSuccessMessage(null)
            
            // Vérifier et logger le hash pour debug
            const hash = window.location.hash
            if (hash) {
                console.log('Reset password - Hash détecté dans l\'URL:', hash.substring(0, 100) + '...')
            } else {
                console.warn('Reset password - Aucun hash détecté dans l\'URL')
            }
        } else {
            // Réinitialiser l'état quand le dialog se ferme
            setPassword('')
            setConfirmPassword('')
            setError(null)
            setSuccessMessage(null)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        // Validation côté client
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.')
            setLoading(false)
            return
        }

        try {
            // Vérifier qu'on a un token dans l'URL (hash)
            const hash = window.location.hash
            console.log('Reset password - Tentative de mise à jour')
            console.log('Reset password - Hash dans l\'URL:', hash ? hash.substring(0, 100) + '...' : 'AUCUN HASH')
            
            // Si pas de hash avec access_token, on ne peut pas continuer
            // Mais on essaie quand même updateUser car Supabase peut avoir traité le hash
            // et créé une session en arrière-plan
            if (!hash.includes('access_token') && !hash.includes('type=recovery')) {
                console.warn('Reset password - Pas de token visible dans l\'URL, mais on essaie quand même updateUser')
                // On continue quand même car Supabase peut avoir traité le hash
            }

            // Forcer Supabase à traiter le hash s'il est présent
            // En appelant getSession(), on force Supabase à traiter le token dans le hash
            if (hash.includes('access_token')) {
                console.log('Reset password - Forçage du traitement du hash par Supabase...')
                await supabase.auth.getSession()
                // Attendre un peu pour que Supabase traite le hash
                await new Promise(resolve => setTimeout(resolve, 500))
            }

            // Mettre à jour le mot de passe
            // Supabase utilise automatiquement le token de récupération dans le hash
            // pour valider et créer/valider la session
            // Si le token est invalide ou expiré, updateUser retournera une erreur
            console.log('Reset password - Appel à updateUser avec le nouveau mot de passe...')
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: password,
            })

            if (updateError) {
                console.error('Update password error:', updateError)
                
                // Messages d'erreur spécifiques selon le type d'erreur
                if (updateError.message.includes('session') || 
                    updateError.message.includes('expired') ||
                    updateError.message.includes('invalid') ||
                    updateError.message.includes('token')) {
                    setError('Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.')
                } else if (updateError.message.includes('weak') || updateError.message.includes('password')) {
                    setError('Le mot de passe est trop faible. Utilisez un mot de passe plus fort (minimum 6 caractères).')
                } else {
                    setError(`Erreur lors de la mise à jour du mot de passe: ${updateError.message}`)
                }
                setLoading(false)
                return
            }

            // Vérifier que la mise à jour a réussi
            if (!data.user) {
                setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.')
                setLoading(false)
                return
            }

            // Succès
            setSuccessMessage('Votre mot de passe a été mis à jour avec succès.')
            
            // Déconnecter toutes les autres sessions (optionnel, pour sécurité)
            // Supabase le fait automatiquement lors du changement de mot de passe
            
            // Attendre un peu pour que l'utilisateur voie le message
            setTimeout(() => {
                // Fermer le dialog et rediriger vers la connexion
                onClose()
                if (onSuccess) {
                    onSuccess()
                }
            }, 2000)

        } catch (err: any) {
            console.error('Unexpected error:', err)
            setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouveau mot de passe</DialogTitle>
                    <DialogDescription>
                        Entrez votre nouveau mot de passe
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Nouveau mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 6 caractères
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Confirmer le mot de passe"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                {successMessage}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </Button>
                        </div>
                    </form>
            </DialogContent>
        </Dialog>
    )
}
