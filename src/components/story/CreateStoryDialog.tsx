import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Image as ImageIcon, Video } from 'lucide-react'

interface CreateStoryDialogProps {
    isOpen: boolean
    onClose: () => void
    user: any
    onStoryCreated: () => void
}

export function CreateStoryDialog({ isOpen, onClose, user, onStoryCreated }: CreateStoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
    const [title, setTitle] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const isVideo = file.type.startsWith('video/')
            const isImage = file.type.startsWith('image/')

            if (!isVideo && !isImage) {
                alert('Veuillez sélectionner une image ou une vidéo')
                return
            }

            setMediaFile(file)
            setMediaType(isVideo ? 'video' : 'image')
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mediaFile || !user) return

        setLoading(true)
        try {
            const fileExt = mediaFile.name.split('.').pop()
            const fileName = `${user.id}/story_${Date.now()}.${fileExt}`

            // 1. Upload Media (Image or Video)
            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(fileName, mediaFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(fileName)

            // 2. Create Story Record
            const { error: insertError } = await supabase
                .from('stories')
                .insert({
                    user_id: user.id,
                    image_url: publicUrl, // Keep for backward compatibility
                    media_url: publicUrl, // New field for both images and videos
                    media_type: mediaType!, // 'image' or 'video'
                    title: title || null,
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
                })

            if (insertError) throw insertError

            onStoryCreated()
            handleClose()
        } catch (error: any) {
            console.error('Error creating story:', error)
            alert(`Failed to create story: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setMediaFile(null)
        setPreviewUrl(null)
        setMediaType(null)
        setTitle('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add to Story</DialogTitle>
                    <DialogDescription>
                        Share a moment from your day. Stories disappear after 24 hours.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="flex flex-col items-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-full max-w-[280px] mx-auto aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-lg">
                                {mediaType === 'video' ? (
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                    />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                )}
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-2 right-2 z-10"
                                    onClick={() => {
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl)
                                        }
                                        setMediaFile(null)
                                        setPreviewUrl(null)
                                        setMediaType(null)
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="w-full max-w-[280px] mx-auto aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('story-media-upload')?.click()}
                            >
                                <div className="flex flex-col items-center gap-2 p-4">
                                    <div className="flex gap-3">
                                        <ImageIcon className="w-10 h-10 text-muted-foreground" />
                                        <Video className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm text-muted-foreground text-center">Click to upload photo or video</span>
                                </div>
                            </div>
                        )}

                        <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="story-media-upload"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add a caption (optional)..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || !mediaFile}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Share Story
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
