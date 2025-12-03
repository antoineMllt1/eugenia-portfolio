import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Image as ImageIcon } from 'lucide-react'

interface CreateStoryDialogProps {
    isOpen: boolean
    onClose: () => void
    user: any
    onStoryCreated: () => void
}

export function CreateStoryDialog({ isOpen, onClose, user, onStoryCreated }: CreateStoryDialogProps) {
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [title, setTitle] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!imageFile || !user) return

        setLoading(true)
        try {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}/story_${Date.now()}.${fileExt}`

            // 1. Upload Image
            const { error: uploadError } = await supabase.storage
                .from('portfolio-media')
                .upload(fileName, imageFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-media')
                .getPublicUrl(fileName)

            // 2. Create Story Record
            const { error: insertError } = await supabase
                .from('stories')
                .insert({
                    user_id: user.id,
                    image_url: publicUrl,
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
        setImageFile(null)
        setPreviewUrl(null)
        setTitle('')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add to Story</DialogTitle>
                    <DialogDescription>
                        Share a moment from your day. Stories disappear after 24 hours.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="flex flex-col items-center gap-4">
                        {previewUrl ? (
                            <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setImageFile(null)
                                        setPreviewUrl(null)
                                    }}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="w-full aspect-[9/16] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('story-image-upload')?.click()}
                            >
                                <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">Click to upload photo</span>
                            </div>
                        )}

                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="story-image-upload"
                        />
                    </div>

                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add a caption (optional)..."
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || !imageFile}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Share Story
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
