import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // We might need to create this or use Input
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox'
import { Loader2, Upload, Github, Linkedin, Sparkles, User } from 'lucide-react'
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
    username: string | null
    full_name: string | null
    avatar_url: string | null
    bio?: string | null
    course?: string | null
    github_url?: string | null
    linkedin_url?: string | null
    role?: string | null
}

interface Highlight {
    id: string
    title: string
    cover_image: string | null
    stories: Array<{ id: string; image: string; media_url?: string; media_type?: 'image' | 'video' }>
}

interface EditProfileDialogProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    user: any // Auth user object
    onProfileUpdate: () => void
}

export function EditProfileDialog({ isOpen, onClose, profile, user, onProfileUpdate }: EditProfileDialogProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'highlights'>('profile')
    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState('')
    const [bio, setBio] = useState('')
    const [selectedClass, setSelectedClass] = useState<string[]>([])
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [githubUrl, setGithubUrl] = useState('')
    const [linkedinUrl, setLinkedinUrl] = useState('')

    // Highlights state
    const [highlights, setHighlights] = useState<Highlight[]>([])
    const [loadingHighlights, setLoadingHighlights] = useState(false)
    const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null)
    const [highlightCoverFile, setHighlightCoverFile] = useState<File | null>(null)
    const [highlightCoverPreview, setHighlightCoverPreview] = useState<string | null>(null)
    const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
    const [highlightTitle, setHighlightTitle] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            if (profile) {
                setFullName(profile.full_name || '')
                setBio(profile.bio || '')
                setSelectedClass(profile.course ? [profile.course] : [])
                setPreviewUrl(profile.avatar_url)
                setGithubUrl(profile.github_url || '')
                setLinkedinUrl(profile.linkedin_url || '')
            } else if (user) {
                // Fallback to auth metadata if no profile row exists
                setFullName(user.user_metadata?.full_name || '')
                setPreviewUrl(user.user_metadata?.avatar_url || '')
                setBio('')
                setSelectedClass([])
                setGithubUrl('')
                setLinkedinUrl('')
            }

            // Fetch highlights when dialog opens
            if (user) {
                fetchHighlights()
            }
        }
    }, [profile, user, isOpen])

    const fetchHighlights = async () => {
        if (!user) return

        setLoadingHighlights(true)
        try {
            const { data, error } = await supabase
                .from('highlights')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching highlights:', error)
                return
            }

            setHighlights((data || []).map((h: any) => ({
                id: h.id,
                title: h.title,
                cover_image: h.cover_image,
                stories: Array.isArray(h.stories) ? h.stories : [],
            })))
        } catch (error) {
            console.error('Error fetching highlights:', error)
        } finally {
            setLoadingHighlights(false)
        }
    }

    const handleHighlightCoverChange = (e: React.ChangeEvent<HTMLInputElement>, highlightId: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setEditingHighlightId(highlightId)
            setHighlightCoverFile(file)
            setHighlightCoverPreview(URL.createObjectURL(file))
        }
    }

    const handleUpdateHighlightCover = async (highlightId: string) => {
        if (!user || !highlightCoverFile) return

        setLoading(true)
        try {
            const fileExt = highlightCoverFile.name.split('.').pop()
            const fileName = `${user.id}/highlight_${highlightId}_${Date.now()}.${fileExt}`

            // Upload new cover image
            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(fileName, highlightCoverFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(fileName)

            // Update highlight cover_image
            const highlight = highlights.find(h => h.id === highlightId)
            if (!highlight) return

            const { error: updateError } = await supabase
                .from('highlights')
                .update({ cover_image: publicUrl })
                .eq('id', highlightId)
                .eq('user_id', user.id)

            if (updateError) throw updateError

            // Update local state
            setHighlights(prev => prev.map(h =>
                h.id === highlightId ? { ...h, cover_image: publicUrl } : h
            ))

            // Reset editing state
            setEditingHighlightId(null)
            setHighlightCoverFile(null)
            if (highlightCoverPreview) {
                URL.revokeObjectURL(highlightCoverPreview)
            }
            setHighlightCoverPreview(null)

            onProfileUpdate()
        } catch (error: any) {
            console.error('Error updating highlight cover:', error)
            alert(`Failed to update highlight cover: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleStartEditTitle = (highlightId: string, currentTitle: string) => {
        setEditingTitleId(highlightId)
        setHighlightTitle(currentTitle)
    }

    const handleCancelEditTitle = () => {
        setEditingTitleId(null)
        setHighlightTitle('')
    }

    const handleUpdateHighlightTitle = async (highlightId: string) => {
        if (!user || !highlightTitle.trim()) return

        setLoading(true)
        try {
            const { error: updateError } = await supabase
                .from('highlights')
                .update({ title: highlightTitle.trim() })
                .eq('id', highlightId)
                .eq('user_id', user.id)

            if (updateError) throw updateError

            // Update local state
            setHighlights(prev => prev.map(h =>
                h.id === highlightId ? { ...h, title: highlightTitle.trim() } : h
            ))

            // Reset editing state
            setEditingTitleId(null)
            setHighlightTitle('')

            onProfileUpdate()
        } catch (error: any) {
            console.error('Error updating highlight title:', error)
            alert(`Failed to update highlight title: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

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
                github_url: githubUrl.trim() || null,
                linkedin_url: linkedinUrl.trim() || null,
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Fixed Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information visible to others.
                    </DialogDescription>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex border-b border-border px-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Profil</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('highlights')}
                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'highlights'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Stories à la une</span>
                        </div>
                    </button>
                </div>

                {/* Scrollable Content */}
                {activeTab === 'profile' ? (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

                            {/* Social Links */}
                            <div className="space-y-4 pt-4 border-t border-border pb-2">
                                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                        🔗
                                    </span>
                                    Professional Links
                                </p>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Github className="w-4 h-4" />
                                        GitHub Profile
                                    </label>
                                    <Input
                                        type="url"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Linkedin className="w-4 h-4" />
                                        LinkedIn Profile
                                    </label>
                                    <Input
                                        type="url"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-card flex-shrink-0">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {loadingHighlights ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
                                </div>
                            ) : highlights.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Sparkles className="w-12 h-12 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Aucun highlight</p>
                                    <p className="text-xs text-muted-foreground mt-1">Créez des highlights depuis votre profil</p>
                                </div>
                            ) : (
                                highlights.map((highlight) => (
                                    <div key={highlight.id} className="border border-border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            {editingTitleId === highlight.id ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <Input
                                                        value={highlightTitle}
                                                        onChange={(e) => setHighlightTitle(e.target.value)}
                                                        placeholder="Nom du highlight"
                                                        className="flex-1 h-9"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateHighlightTitle(highlight.id)
                                                            } else if (e.key === 'Escape') {
                                                                handleCancelEditTitle()
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => handleUpdateHighlightTitle(highlight.id)}
                                                        disabled={loading || !highlightTitle.trim()}
                                                    >
                                                        {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                        ✓
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleCancelEditTitle}
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3
                                                        className="font-semibold text-foreground flex-1 cursor-pointer hover:text-primary transition-colors"
                                                        onClick={() => handleStartEditTitle(highlight.id, highlight.title)}
                                                        title="Cliquez pour modifier"
                                                    >
                                                        {highlight.title}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                                        {highlight.stories.length} {highlight.stories.length === 1 ? 'story' : 'stories'}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                                                {editingHighlightId === highlight.id && highlightCoverPreview ? (
                                                    <img
                                                        src={highlightCoverPreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={highlight.cover_image || highlight.stories[0]?.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'}
                                                        alt={highlight.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleHighlightCoverChange(e, highlight.id)}
                                                    className="hidden"
                                                    id={`highlight-cover-${highlight.id}`}
                                                />
                                                {editingHighlightId === highlight.id ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={() => handleUpdateHighlightCover(highlight.id)}
                                                            disabled={loading}
                                                        >
                                                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                                            Enregistrer
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingHighlightId(null)
                                                                setHighlightCoverFile(null)
                                                                if (highlightCoverPreview) {
                                                                    URL.revokeObjectURL(highlightCoverPreview)
                                                                }
                                                                setHighlightCoverPreview(null)
                                                            }}
                                                        >
                                                            Annuler
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => document.getElementById(`highlight-cover-${highlight.id}`)?.click()}
                                                    >
                                                        <Upload className="w-3 h-3 mr-2" />
                                                        Modifier la photo
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-card flex-shrink-0">
                            <Button type="button" variant="ghost" onClick={onClose}>Fermer</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
