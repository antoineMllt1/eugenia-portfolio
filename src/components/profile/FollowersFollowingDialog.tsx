import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface FollowersFollowingDialogProps {
    userId: string
    isOpen: boolean
    onClose: () => void
    type: 'followers' | 'following'
    onFollowChange?: () => void
}

interface UserProfile {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    course?: string | null
    bio?: string | null
}

interface FollowItem {
    id: string
    user: UserProfile
    created_at: string
    isFollowing?: boolean
}

export function FollowersFollowingDialog({
    userId,
    isOpen,
    onClose,
    type,
    onFollowChange
}: FollowersFollowingDialogProps) {
    const { user } = useAuth()
    const [items, setItems] = useState<FollowItem[]>([])
    const [loading, setLoading] = useState(false)
    const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        console.log('FollowersFollowingDialog useEffect:', { isOpen, userId, type })
        if (isOpen && userId) {
            fetchItems()
        } else {
            setItems([])
        }
    }, [isOpen, userId, type])

    const fetchItems = async () => {
        setLoading(true)
        try {
            console.log('Fetching items for type:', type, 'userId:', userId)

            if (type === 'followers') {
                // Get users who follow this user
                const { data: followsData, error: followsError } = await supabase
                    .from('follows')
                    .select('id, created_at, follower_id')
                    .eq('following_id', userId)
                    .order('created_at', { ascending: false })

                if (followsError) throw followsError

                console.log('Follows data:', followsData)

                if (!followsData || followsData.length === 0) {
                    setItems([])
                    setLoading(false)
                    return
                }

                // Get profiles for all followers
                const followerIds = followsData.map(f => f.follower_id)
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, course, bio')
                    .in('id', followerIds)

                if (profilesError) throw profilesError

                console.log('Profiles data:', profilesData)

                // Combine the data
                const formattedItems: FollowItem[] = followsData.map(follow => {
                    const profile = profilesData?.find(p => p.id === follow.follower_id)
                    return {
                        id: follow.id,
                        user: profile || {
                            id: follow.follower_id,
                            username: 'unknown',
                            full_name: 'Unknown User',
                            avatar_url: '',
                            course: '',
                            bio: ''
                        },
                        created_at: follow.created_at,
                    }
                })

                // Check if current user follows each person displayed in the list
                if (user && formattedItems.length > 0) {
                    const userIds = formattedItems.map(item => item.user.id)
                    const { data: followData } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', user.id)
                        .in('following_id', userIds)

                    const followingIds = new Set(followData?.map(f => f.following_id) || [])
                    formattedItems.forEach(item => {
                        item.isFollowing = followingIds.has(item.user.id)
                    })
                }

                setItems(formattedItems)
            } else {
                // Get users that this user follows
                const { data: followsData, error: followsError } = await supabase
                    .from('follows')
                    .select('id, created_at, following_id')
                    .eq('follower_id', userId)
                    .order('created_at', { ascending: false })

                if (followsError) throw followsError

                console.log('Following data:', followsData)

                if (!followsData || followsData.length === 0) {
                    setItems([])
                    setLoading(false)
                    return
                }

                // Get profiles for all following
                const followingIds = followsData.map(f => f.following_id)
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, course, bio')
                    .in('id', followingIds)

                if (profilesError) throw profilesError

                console.log('Following profiles data:', profilesData)

                // Combine the data
                const formattedItems: FollowItem[] = followsData.map(follow => {
                    const profile = profilesData?.find(p => p.id === follow.following_id)
                    return {
                        id: follow.id,
                        user: profile || {
                            id: follow.following_id,
                            username: 'unknown',
                            full_name: 'Unknown User',
                            avatar_url: '',
                            course: '',
                            bio: ''
                        },
                        created_at: follow.created_at,
                    }
                })

                // Check if current user follows each person displayed in the list
                if (user && formattedItems.length > 0) {
                    const userIds = formattedItems.map(item => item.user.id)
                    const { data: followData } = await supabase
                        .from('follows')
                        .select('following_id')
                        .eq('follower_id', user.id)
                        .in('following_id', userIds)

                    const followingIds = new Set(followData?.map(f => f.following_id) || [])
                    formattedItems.forEach(item => {
                        item.isFollowing = followingIds.has(item.user.id)
                    })
                }

                setItems(formattedItems)
            }
        } catch (error: any) {
            console.error(`Error fetching ${type}:`, error)
        } finally {
            setLoading(false)
        }
    }

    const handleUnfollow = async (targetUserId: string) => {
        if (!user) return

        setUnfollowingIds(prev => new Set(prev).add(targetUserId))
        try {
            const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId)

            if (error) throw error

            // Remove from list
            setItems(prev => prev.filter(item => item.user.id !== targetUserId))
            onFollowChange?.()
        } catch (error: any) {
            console.error('Error unfollowing:', error)
            alert(`Failed to unfollow: ${error.message || 'Unknown error'}`)
        } finally {
            setUnfollowingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(targetUserId)
                return newSet
            })
        }
    }

    const handleFollow = async (targetUserId: string) => {
        if (!user) return

        setUnfollowingIds(prev => new Set(prev).add(targetUserId))
        try {
            const { error } = await supabase
                .from('follows')
                .insert({
                    follower_id: user.id,
                    following_id: targetUserId,
                })

            if (error) throw error

            // Update the item
            setItems(prev => prev.map(item =>
                item.user.id === targetUserId
                    ? { ...item, isFollowing: true }
                    : item
            ))
            onFollowChange?.()
        } catch (error: any) {
            console.error('Error following:', error)
            alert(`Failed to follow: ${error.message || 'Unknown error'}`)
        } finally {
            setUnfollowingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(targetUserId)
                return newSet
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold">
                        {type === 'followers' ? 'Followers' : 'Following'}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {type === 'followers'
                                    ? 'No followers yet'
                                    : 'Not following anyone yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Avatar className="w-12 h-12 flex-shrink-0">
                                            <AvatarImage src={item.user.avatar_url || undefined} />
                                            <AvatarFallback className="bg-accent text-primary">
                                                {item.user.full_name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">
                                                {item.user.full_name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{item.user.username || 'unknown'}
                                            </p>
                                            {item.user.course && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {item.user.course}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {user && item.user.id !== user.id && (
                                        <Button
                                            variant={item.isFollowing ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => {
                                                if (item.isFollowing) {
                                                    handleUnfollow(item.user.id)
                                                } else {
                                                    handleFollow(item.user.id)
                                                }
                                            }}
                                            disabled={unfollowingIds.has(item.user.id)}
                                            className="rounded-full flex-shrink-0"
                                        >
                                            {unfollowingIds.has(item.user.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : item.isFollowing ? (
                                                'Unfollow'
                                            ) : (
                                                'Follow'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

