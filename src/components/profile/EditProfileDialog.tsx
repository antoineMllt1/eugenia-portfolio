import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // We might need to create this or use Input
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox'
import { Loader2, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Reusing class options from AuthDialog - ideally this should be in a shared constant file
const CLASS_OPTIONS = [
    { value: 'B1 Albert', label: 'B1 Albert' },
    { value: 'B2 Albert', label: 'B2 Albert' },
    { value: 'B3 Albert', label: 'B3 Albert' },
    { value: 'M1/M2', label: 'M1/M2' },
    { value: 'B1 Eugenia', label: 'B1 Eugenia' },
    { value: 'B2 Eugenia', label: 'B2 Eugenia' },
    { value: 'B3 Eugenia', label: 'B3 Eugenia' },
]

interface UserProfile {
    id: string
    username: string
    full_name: string
    avatar_url: string
    bio?: string
    course?: string
}

interface EditProfileDialogProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    user: any // Auth user object
    onProfileUpdate: () => void
}

export function EditProfileDialog({ isOpen, onClose, profile, user, onProfileUpdate }: EditProfileDialogProps) {
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [selectedClass, setSelectedClass] = useState<string[]>([])
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            if (profile) {
                setFullName(profile.full_name || '')
                setBio(profile.bio || '')
                setSelectedClass(profile.course ? [profile.course] : [])
                setPreviewUrl(profile.avatar_url)
            } else if (user) {
                // Fallback to auth metadata if no profile row exists
                setFullName(user.user_metadata?.full_name || '')
                setPreviewUrl(user.user_metadata?.avatar_url || '')
                setBio('')
                setSelectedClass([])
            }
        }
    }, [profile, user, isOpen])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setAvatarFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ''

            // 1. Upload new avatar if selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop()
                const userId = user.id
                const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('portfolio-media')
                    .upload(fileName, avatarFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('portfolio-media')
                    .getPublicUrl(fileName)

                avatarUrl = publicUrl
            }

            // 2. Update or Insert Profile
            const profileData = {
                id: user.id,
                username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0],
                full_name: fullName,
                bio: bio,
                course: selectedClass[0] || null,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert(profileData)

            if (updateError) throw updateError

            onProfileUpdate()
            onClose()
        } catch (error: any) {
            console.error('Error updating profile:', error)
            alert(`Failed to update profile: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information visible to others.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={previewUrl || ''} />
                            <AvatarFallback>{fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="avatar-upload"
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                <Upload className="w-4 h-4 mr-2" />
                                Change Photo
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Class</label>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                            value={bio}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
