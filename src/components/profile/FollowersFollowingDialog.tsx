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
    onUserClick?: (userId: string) => void
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
    onFollowChange,
    onUserClick
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

    const fetchItems = async () => {
        setLoading(true)
        try {
            let data: any[] | null = null;
            let error: any = null;

            if (type === 'followers') {
                const result = await supabase
                    .from('follows')
                    .select('id, created_at, follower_id')
                    .eq('following_id', userId)
                    .order('created_at', { ascending: false });
                data = result.data;
                error = result.error;
            } else {
                const result = await supabase
                    .from('follows')
                    .select('id, created_at, following_id')
                    .eq('follower_id', userId)
                    .order('created_at', { ascending: false });
                data = result.data;
                error = result.error;
            }

            if (error) throw error

            if (!data || data.length === 0) {
                setItems([])
                return
            }

            const profileIds = data.map(item => type === 'followers' ? item.follower_id : item.following_id);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, course, bio')
                .in('id', profileIds);

            if (profileError) throw profileError;

            const profileMap = (profileData || []).reduce((acc: any, p: any) => {
                acc[p.id] = p;
                return acc;
            }, {});

            const formattedItems: FollowItem[] = data.map((item: any) => {
                const targetId = type === 'followers' ? item.follower_id : item.following_id;
                return {
                    id: item.id,
                    user: profileMap[targetId],
                    created_at: item.created_at,
                };
            }).filter(item => item.user !== null && item.user !== undefined);

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
                        {type === 'followers' ? 'Abonnés' : 'Abonnements'}
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
                                    ? "Aucun abonné pour le moment"
                                    : "Aucun abonnement pour le moment"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/80 transition-all group cursor-pointer active:scale-[0.98]"
                                    onClick={() => onUserClick?.(item.user.id)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="relative group-hover:scale-105 transition-transform duration-200">
                                            <Avatar className="w-12 h-12 flex-shrink-0 transition-all group-hover:ring-2 group-hover:ring-primary/20">
                                                <AvatarImage src={item.user?.avatar_url} />
                                                <AvatarFallback className="bg-accent text-primary">
                                                    {item.user?.full_name?.[0] || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                                {item.user?.full_name || 'Utilisateur'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{item.user?.username || 'username'}
                                            </p>
                                            {item.user?.course && (
                                                <p className="text-[10px] text-primary/70 font-medium mt-0.5">
                                                    {item.user.course}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {user && item.user.id !== user.id && (
                                        <Button
                                            variant={item.isFollowing ? "outline" : "default"}
                                            size="sm"
                                            className="ml-2 rounded-full h-8 px-4 flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (item.isFollowing) {
                                                    handleUnfollow(item.user.id)
                                                } else {
                                                    handleFollow(item.user.id)
                                                }
                                            }}
                                            disabled={unfollowingIds.has(item.user.id)}
                                        >
                                            {unfollowingIds.has(item.user.id) ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : item.isFollowing ? (
                                                'Suivi'
                                            ) : (
                                                'Suivre'
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

