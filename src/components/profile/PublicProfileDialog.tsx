import { useEffect, useState } from 'react'
import { FollowersFollowingDialog } from './FollowersFollowingDialog'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Heart, Loader2, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface PublicProfileDialogProps {
    userId: string | null
    isOpen: boolean
    onClose: () => void
    onFollowChange?: () => void
    onStartConversation?: (userId: string) => void
}

import type { StudentProfile } from '@/types'

type ProfileData = StudentProfile

interface ProjectPost {
    id: string
    title: string
    images: string[]
    likes_count: any // Bypassing complex join typing issue
}

export function PublicProfileDialog({ userId, isOpen, onClose, onFollowChange, onStartConversation }: PublicProfileDialogProps) {
    const { user } = useAuth()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [projects, setProjects] = useState<ProjectPost[]>([])
    const [loading, setLoading] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [loadingFollow, setLoadingFollow] = useState(false)
    const [followersFollowingDialog, setFollowersFollowingDialog] = useState<{
        isOpen: boolean;
        type: 'followers' | 'following';
    }>({ isOpen: false, type: 'followers' })

    useEffect(() => {
        if (userId && isOpen) {
            fetchProfileData()
            if (user && userId !== user.id) {
                checkFollowStatus()
            }
        }
    }, [userId, isOpen, user])

    const fetchProfileData = async () => {
        if (!userId) return
        setLoading(true)
        try {
            // Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (profileError) throw profileError
            setProfile(profileData as ProfileData)

            // Fetch Projects
            const { data: projectsData, error: projectsError } = await supabase
                .from('posts')
                .select(`
                    id,
                    title,
                    images,
                    likes_count:likes(count)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (projectsError) throw projectsError
            setProjects(projectsData as any || [])

            // Fetch follow counts
            await fetchFollowCounts(userId)

        } catch (error) {
            console.error('Error fetching public profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFollowCounts = async (userId: string) => {
        try {
            // Get followers count
            const { count: followers } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', userId)

            // Get following count
            const { count: following } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', userId)

            setFollowersCount(followers || 0)
            setFollowingCount(following || 0)
        } catch (error) {
            console.error('Error fetching follow counts:', error)
        }
    }

    const checkFollowStatus = async () => {
        if (!user || !userId || userId === user.id) return

        try {
            const { data } = await supabase
                .from('follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', userId)
                .single()

            setIsFollowing(!!data)
        } catch (error) {
            setIsFollowing(false)
        }
    }

    const handleFollow = async () => {
        if (!user || !userId || userId === user.id) return

        setLoadingFollow(true)
        try {
            const { error } = await supabase
                .from('follows')
                .insert({
                    follower_id: user.id,
                    following_id: userId,
                })

            if (error) throw error

            setIsFollowing(true)
            setFollowersCount(prev => prev + 1)
            onFollowChange?.()
        } catch (error: any) {
            console.error('Error following user:', error)
            alert(`Failed to follow user: ${error.message || 'Unknown error'}`)
        } finally {
            setLoadingFollow(false)
        }
    }

    const handleUnfollow = async () => {
        if (!user || !userId) return

        setLoadingFollow(true)
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', userId)

            if (error) throw error

            setIsFollowing(false)
            setFollowersCount(prev => Math.max(0, prev - 1))
            onFollowChange?.()
        } catch (error: any) {
            console.error('Error unfollowing user:', error)
            alert(`Failed to unfollow user: ${error.message || 'Unknown error'}`)
        } finally {
            setLoadingFollow(false)
        }
    }

    if (!profile && !loading) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Student Profile</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6 pt-2">
                        {loading ? (
                            <div className="flex justify-center py-8">Loading...</div>
                        ) : (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="flex items-start gap-6">
                                    <Avatar className="w-24 h-24 border-2 border-primary/10">
                                        <AvatarImage src={profile?.avatar_url || undefined} />
                                        <AvatarFallback>{(profile?.full_name || 'U')[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                                                <p className="text-muted-foreground">@{profile?.username}</p>
                                            </div>
                                            {user && userId !== user.id && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => onStartConversation?.(userId!)}
                                                        className="rounded-full"
                                                    >
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Message
                                                    </Button>
                                                    <Button
                                                        variant={isFollowing ? "outline" : "default"}
                                                        onClick={isFollowing ? handleUnfollow : handleFollow}
                                                        disabled={loadingFollow}
                                                        className="rounded-full"
                                                    >
                                                        {loadingFollow ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        ) : null}
                                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 pt-2">
                                            <div>
                                                <span className="font-semibold">{projects.length}</span>
                                                <span className="text-muted-foreground text-sm ml-1">projects</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    console.log('Followers button clicked, userId:', userId)
                                                    setFollowersFollowingDialog({ isOpen: true, type: 'followers' })
                                                }}
                                                className="text-left cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                <span className="font-semibold">{followersCount}</span>
                                                <span className="text-muted-foreground text-sm ml-1">followers</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log('Following button clicked, userId:', userId)
                                                    setFollowersFollowingDialog({ isOpen: true, type: 'following' })
                                                }}
                                                className="text-left cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                <span className="font-semibold">{followingCount}</span>
                                                <span className="text-muted-foreground text-sm ml-1">following</span>
                                            </button>
                                        </div>

                                        {profile?.course && (
                                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                                {profile.course}
                                            </div>
                                        )}

                                        {profile?.bio && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {profile.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Projects Grid */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Projects</h3>
                                    {projects.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {projects.map((project) => (
                                                <div key={project.id} className="group relative aspect-video rounded-lg overflow-hidden bg-muted border">
                                                    {project.images?.[0] ? (
                                                        <img
                                                            src={project.images[0]}
                                                            alt={project.title}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                            No Image
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                                                        <p className="font-bold truncate w-full">{project.title}</p>
                                                        <div className="flex items-center gap-1 mt-2 text-sm">
                                                            <Heart className="w-4 h-4 fill-white" />
                                                            <span>{project.likes_count?.[0]?.count || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg border border-dashed">
                                            No projects yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {userId && (
                <FollowersFollowingDialog
                    userId={userId}
                    isOpen={followersFollowingDialog.isOpen}
                    onClose={() => setFollowersFollowingDialog(prev => ({ ...prev, isOpen: false }))}
                    type={followersFollowingDialog.type}
                    onFollowChange={() => {
                        fetchFollowCounts(userId)
                        onFollowChange?.()
                    }}
                />
            )}
        </>
    )
}
