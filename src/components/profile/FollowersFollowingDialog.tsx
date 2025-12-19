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
    username: string
    full_name: string
    avatar_url: string
    course?: string
    bio?: string
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
        if (isOpen && userId) {
            fetchItems()
        } else {
            setItems([])
        }
    }, [isOpen, userId, type])
    
    // Add fetchItems to dependency array warning fix
    // eslint-disable-next-line react-hooks/exhaustive-deps

    const fetchItems = async () => {
        setLoading(true)
        try {
            let query

            let followsData: any[]
            let profileIds: string[]

            if (type === 'followers') {
                // Get users who follow this user
                const { data: follows, error: followsError } = await supabase
                    .from('follows')
                    .select('id, created_at, follower_id')
                    .eq('following_id', userId)
                    .order('created_at', { ascending: false })

                if (followsError) {
                    console.error(`Error fetching ${type}:`, followsError)
                    throw followsError
                }

                followsData = follows || []
                profileIds = followsData.map(f => f.follower_id)
            } else {
                // Get users that this user follows
                const { data: follows, error: followsError } = await supabase
                    .from('follows')
                    .select('id, created_at, following_id')
                    .eq('follower_id', userId)
                    .order('created_at', { ascending: false })

                if (followsError) {
                    console.error(`Error fetching ${type}:`, followsError)
                    throw followsError
                }

                followsData = follows || []
                profileIds = followsData.map(f => f.following_id)
            }

            // Fetch profiles for these user IDs (only if there are IDs to fetch)
            let profilesData: any[] = []
            if (profileIds.length > 0) {
                const { data, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url, course, bio')
                    .in('id', profileIds)

                if (profilesError) {
                    console.error(`Error fetching profiles for ${type}:`, profilesError)
                    throw profilesError
                }

                profilesData = data || []
            }

            if (profilesError) {
                console.error(`Error fetching profiles for ${type}:`, profilesError)
                throw profilesError
            }

            // Create a map of profile ID to profile data
            const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]))

            // Format items by combining follows data with profiles
            const formattedItems: FollowItem[] = followsData
                .map((follow: any) => {
                    const userIdToLookup = type === 'followers' ? follow.follower_id : follow.following_id
                    const profile = profilesMap.get(userIdToLookup)

                    if (!profile) {
                        return null
                    }

                    return {
                        id: follow.id,
                        user: profile,
                        created_at: follow.created_at,
                    }
                })
                .filter((item): item is FollowItem => item !== null)

            // Check if current user follows each person (only for followers list)
            if (type === 'followers' && user && formattedItems.length > 0) {
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
            } else if (type === 'following') {
                // For following list, all items are followed by the user
                formattedItems.forEach(item => {
                    item.isFollowing = true
                })
            }

            setItems(formattedItems)
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
                                            <AvatarImage src={item.user.avatar_url} />
                                            <AvatarFallback className="bg-accent text-primary">
                                                {item.user.full_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">
                                                {item.user.full_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{item.user.username}
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

