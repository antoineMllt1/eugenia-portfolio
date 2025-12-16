import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Video, X } from 'lucide-react'

interface CreateReelDialogProps {
    isOpen: boolean
    onClose: () => void
    user: any
    onReelCreated: () => void
}

export function CreateReelDialog({ isOpen, onClose, user, onReelCreated }: CreateReelDialogProps) {
    const [loading, setLoading] = useState(false)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const isVideo = file.type.startsWith('video/')
            
            if (!isVideo) {
                alert('Veuillez sélectionner une vidéo')
                return
            }
            
            setVideoFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!videoFile || !user) return

        setLoading(true)
        try {
            const fileExt = videoFile.name.split('.').pop()
            const fileName = `${user.id}/reel_${Date.now()}.${fileExt}`

            // 1. Upload Video
            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(fileName, videoFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(fileName)

            // 2. Create Reel Record in posts table with type 'reel'
            const { error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    title: title.trim() || 'Untitled Reel',
                    description: description.trim() || '',
                    images: [publicUrl], // Store video URL in images array for compatibility
                    video_url: publicUrl, // New field for video
                    post_type: 'reel', // Distinguish from regular posts
                    tags: [],
                    created_at: new Date().toISOString(),
                })

            if (insertError) throw insertError

            onReelCreated()
            handleClose()
        } catch (error: any) {
            console.error('Error creating reel:', error)
            alert(`Failed to create reel: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setVideoFile(null)
        setPreviewUrl(null)
        setTitle('')
        setDescription('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Reel</DialogTitle>
                    <DialogDescription>
                        Share a video reel with the community.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="flex flex-col items-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-full max-w-[280px] mx-auto aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-lg">
                                <video 
                                    src={previewUrl} 
                                    className="w-full h-full object-cover"
                                    controls
                                    muted
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-2 right-2 z-10"
                                    onClick={() => {
                                        if (previewUrl) {
                                            URL.revokeObjectURL(previewUrl)
                                        }
                                        setVideoFile(null)
                                        setPreviewUrl(null)
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="w-full max-w-[280px] mx-auto aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('reel-video-upload')?.click()}
                            >
                                <div className="flex flex-col items-center gap-2 p-4">
                                    <Video className="w-12 h-12 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground text-center">Click to upload video</span>
                                </div>
                            </div>
                        )}

                        <Input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="reel-video-upload"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title (optional)..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description (optional)..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || !videoFile}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Share Reel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

