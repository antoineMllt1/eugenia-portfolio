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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [fullName, setFullName] = useState('')
    const [selectedClass, setSelectedClass] = useState<string[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            } else {
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
            }
            onClose()
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
                    <DialogTitle>{isLogin ? 'Welcome Back' : 'Create Account'}</DialogTitle>
                    <DialogDescription>
                        {isLogin
                            ? 'Enter your credentials to access your account'
                            : 'Join the community to share your projects'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {!isLogin && (
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
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground mt-2">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="text-primary hover:underline font-medium"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
