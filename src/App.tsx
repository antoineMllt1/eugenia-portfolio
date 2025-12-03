import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Search, Home, User as UserIcon, SquarePlus, Bell, Send, ChevronLeft, ChevronRight, Loader2, LogIn, LogOut, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { supabase } from '@/lib/supabase';
import { EditProfileDialog } from './components/profile/EditProfileDialog';
import { PublicProfileDialog } from './components/profile/PublicProfileDialog';
import { CreateStoryDialog } from './components/story/CreateStoryDialog';
import { MenuBar } from '@/components/ui/glow-menu';

// Types
interface StudentProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  course?: string;
}

interface ProjectPost {
  id: string;
  user_id: string;
  profiles: StudentProfile; // Joined profile data
  title: string;
  description: string;
  images: string[];
  tags: string[];
  likes_count: number; // Count from DB
  comments_count: number; // Count from DB
  created_at: string;
  liked_by_user?: boolean; // Computed
  saved_by_user?: boolean; // Computed
}

interface StoryItem {
  id: string;
  user_id: string;
  profiles: StudentProfile;
  title: string;
  description: string;
  image_url: string;
  progress?: number;
  achievement?: string;
  created_at: string;
}

// Story Component (Unchanged logic, just types)
interface StoryProps {
  mediaLength: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

interface StoryContextValue {
  mediaLength: number;
  currentIndex: number;
  progress: number;
  isPaused: boolean;
  isEnded: boolean;
  handleControl: () => void;
  setCurrentIndex: (index: number) => void;
  setIsPaused: (paused: boolean) => void;
  setIsEnded: (ended: boolean) => void;
}

const StoryContext = React.createContext<StoryContextValue | undefined>(undefined);

function useStoryContext() {
  const context = React.useContext(StoryContext);
  if (!context) throw new Error('useStoryContext must be used within a Story');
  return context;
}

const Story: React.FC<StoryProps> = ({ mediaLength, duration = 5000, className = '', children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const progressRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [currentIndex, duration, mediaLength]);

  useEffect(() => {
    if (mediaLength === 0 || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const tick = 50;
    const totalTicks = duration / tick;

    intervalRef.current = setInterval(() => {
      progressRef.current += 1;
      const newProgress = (progressRef.current / totalTicks) * 100;
      setProgress(newProgress);

      if (progressRef.current >= totalTicks) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        if (currentIndex < mediaLength - 1) {
          setCurrentIndex((idx) => idx + 1);
        } else {
          setIsPaused(true);
          setIsEnded(true);
        }
      }
    }, tick);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, currentIndex, duration, mediaLength]);

  const handleControl = () => {
    if (isEnded) {
      setCurrentIndex(0);
      setIsEnded(false);
      setIsPaused(false);
    } else {
      setIsPaused((prev) => !prev);
    }
  };

  return (
    <StoryContext.Provider
      value={{
        mediaLength,
        currentIndex,
        progress,
        isPaused,
        isEnded,
        handleControl,
        setCurrentIndex,
        setIsPaused,
        setIsEnded,
      }}
    >
      <div className={className}>{children}</div>
    </StoryContext.Provider>
  );
};

const StoryProgress: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mediaLength, currentIndex, progress, setCurrentIndex, setIsEnded, setIsPaused } = useStoryContext();

  const handleProgressClick = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(false);
    setIsEnded(false);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: mediaLength }).map((_, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div
            key={index}
            className="h-1 flex-1 rounded bg-white/30 cursor-pointer"
            onClick={() => handleProgressClick(index)}
          >
            <div
              className="h-full rounded bg-white transition-all duration-200"
              style={{
                width: isActive ? `${progress}%` : isCompleted ? '100%' : '0%',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const StorySlide: React.FC<{ index: number; children: React.ReactNode; className?: string }> = ({
  index,
  className = '',
  children,
}) => {
  const { currentIndex } = useStoryContext();
  if (index !== currentIndex) return null;
  return <div className={`animate-in fade-in ${className}`}>{children}</div>;
};

// Main Component
const StudentPortfolio: React.FC = () => {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<ProjectPost[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const [selectedPost, setSelectedPost] = useState<ProjectPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'create' | 'profile'>('home');
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Profile State
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            course
          ),
          likes (user_id),
          saved_posts (user_id)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('Fetched posts:', postsData); // Debug log

      // Transform data to match interface
      const formattedPosts: ProjectPost[] = (postsData || []).map((post: any) => ({
        ...post,
        saved_by_user: false, // TODO: Implement check
      }));

      setPosts(formattedPosts);

      // Fetch Stories
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;
      setStories(storiesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    // Optimistic update
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, liked_by_user: !post.liked_by_user, likes_count: post.liked_by_user ? post.likes_count - 1 : post.likes_count + 1 }
        : post
    ));

    // TODO: Actual DB call
    // await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  };

  const handleSave = (postId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, saved_by_user: !post.saved_by_user }
        : post
    ));
  };

  const handleComment = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (commentText.trim() && selectedPost) {
      // Optimistic update
      setCommentText('');
      setPosts(posts.map(post =>
        post.id === selectedPost.id
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));

      // DB Call
      await supabase.from('comments').insert({
        post_id: selectedPost.id,
        user_id: user.id,
        text: commentText
      });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostImage) return;

    setUploading(true);
    try {
      // 1. Upload Image
      const fileExt = newPostImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, newPostImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      // 2. Create Post
      const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        title: newPostTitle,
        description: newPostDesc,
        images: [publicUrl],
        tags: newPostTags.split(',').map(t => t.trim()),
      });

      if (dbError) throw dbError;

      // Reset and refresh
      setNewPostTitle('');
      setNewPostDesc('');
      setNewPostTags('');
      setNewPostImage(null);
      setActiveTab('home');
      fetchData();

    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(`Failed to create post: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="min-h-screen h-full flex flex-col font-light relative overflow-hidden w-full pb-20 bg-background"
    >

      <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        user={user}
        onProfileUpdate={() => {
          fetchUserProfile();
          fetchData(); // Refresh posts to show updated avatar/name
        }}
      />
      <PublicProfileDialog
        userId={viewingUserId}
        isOpen={!!viewingUserId}
        onClose={() => setViewingUserId(null)}
      />
      <CreateStoryDialog
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        user={user}
        onStoryCreated={() => {
          fetchData(); // Refresh stories
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GeniaGram</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { }}>
              <Bell className="h-5 w-5" />
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setActiveTab('profile')}>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthOpen(true)} size="sm">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Stories Section */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Add Story Button */}
            {user && (
              <button
                onClick={() => setIsCreateStoryOpen(true)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:bg-muted/80 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
                <span className="text-xs font-medium">Add Story</span>
              </button>
            )}

            {stories.map((story) => (
              <button
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="flex flex-col items-center gap-2 flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 p-0.5">
                    <Avatar className="w-full h-full border-2 border-background">
                      <AvatarImage src={story.profiles.avatar_url} />
                      <AvatarFallback>{story.profiles.username[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-xs max-w-[64px] truncate">{story.profiles.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No posts yet. Be the first to share!
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setViewingUserId(post.user_id)}>
                        <AvatarImage src={post.profiles.avatar_url} />
                        <AvatarFallback>{post.profiles.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-semibold text-sm cursor-pointer hover:underline"
                          onClick={() => setViewingUserId(post.user_id)}
                        >
                          {post.profiles.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{post.profiles.course || 'Student'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="relative">
                    {post.images.length > 1 && (
                      <>
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setCurrentImageIndex(Math.min(post.images.length - 1, currentImageIndex + 1))}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </>
                      </>
                    )}
                    <img
                      src={post.images[currentImageIndex % post.images.length]}
                      alt={post.title}
                      className="w-full aspect-square object-cover cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    />
                    {post.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLike(post.id)}
                          className={post.liked_by_user ? 'text-red-500' : ''}
                        >
                          <Heart className={`h-6 w-6 ${post.liked_by_user ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPost(post)}>
                          <MessageCircle className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-6 w-6" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(post.id)}
                        className={post.saved_by_user ? 'text-primary' : ''}
                      >
                        <Bookmark className={`h-6 w-6 ${post.saved_by_user ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    <div>
                      <p className="font-semibold text-sm">{post.likes_count} likes</p>
                      <p className="text-sm mt-1">
                        <span className="font-semibold">{post.profiles.username}</span>{' '}
                        <span className="font-bold">{post.title}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{post.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-sm text-muted-foreground mt-2"
                      >
                        View all {post.comments_count} comments
                      </button>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects, students, tags..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Create New Project</h2>
            {!user ? (
              <div className="text-center py-10">
                <p className="mb-4">You need to sign in to create a post.</p>
                <Button onClick={() => setAuthOpen(true)}>Sign In</Button>
              </div>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Title</label>
                  <Input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="My Awesome Project"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newPostDesc}
                    onChange={(e) => setNewPostDesc(e.target.value)}
                    placeholder="Tell us about your project..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="react, ai, design"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploading ? 'Creating...' : 'Share Project'}
                </Button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile?.avatar_url || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` : '')} />
                <AvatarFallback>{userProfile?.full_name?.[0] || 'ME'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{userProfile?.full_name || user?.user_metadata?.full_name || 'Guest'}</h2>
                <p className="text-sm text-muted-foreground">@{userProfile?.username || user?.user_metadata?.username || 'guest'}</p>
                <p className="text-sm mt-1 font-medium text-primary">{userProfile?.course || 'Student'}</p>
                {userProfile?.bio && <p className="text-sm mt-2">{userProfile.bio}</p>}

                {user && (
                  <Button variant="outline" className="mt-4 h-8 text-sm" onClick={() => setIsEditProfileOpen(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">My Projects</h3>
              <div className="grid grid-cols-2 gap-4">
                {posts.filter(p => p.user_id === user?.id).map((post) => (
                  <div key={post.id} className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <p className="font-bold text-sm">{post.title}</p>
                        <div className="flex items-center justify-center gap-2 mt-1 text-xs">
                          <Heart className="w-3 h-3 fill-white" /> {post.likes_count}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {posts.filter(p => p.user_id === user?.id).length === 0 && (
                <p className="text-muted-foreground text-center py-8">You haven't posted any projects yet.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <MenuBar
          items={[
            {
              icon: Home,
              label: 'Home',
              href: '#',
              gradient: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
              iconColor: 'text-blue-500',
            },
            {
              icon: Search,
              label: 'Search',
              href: '#',
              gradient: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
              iconColor: 'text-orange-500',
            },
            {
              icon: SquarePlus,
              label: 'Create',
              href: '#',
              gradient: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
              iconColor: 'text-green-500',
            },
            {
              icon: UserIcon,
              label: 'Profile',
              href: '#',
              gradient: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)',
              iconColor: 'text-red-500',
            },
          ]}
          activeItem={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          onItemClick={(item) => setActiveTab(item.toLowerCase() as any)}
        />
      </div>

      {/* Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="grid md:grid-cols-2 h-[80vh]">
            <div className="bg-black flex items-center justify-center">
              {selectedPost && (
                <img
                  src={selectedPost.images[0]}
                  alt={selectedPost.title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <div className="flex flex-col h-full bg-background">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedPost?.profiles.avatar_url} />
                    <AvatarFallback>{selectedPost?.profiles.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selectedPost?.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPost?.profiles.course}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedPost?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPost?.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPost?.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Comments Section Placeholder */}
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-medium">Comments</p>
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-background">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedPost && handleLike(selectedPost.id)}
                    className={selectedPost?.liked_by_user ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-6 w-6 ${selectedPost?.liked_by_user ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-6 w-6" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedPost && handleSave(selectedPost.id)}
                    className={selectedPost?.saved_by_user ? 'text-primary' : ''}
                  >
                    <Bookmark className={`h-6 w-6 ${selectedPost?.saved_by_user ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  />
                  <Button size="icon" onClick={handleComment} disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setSelectedStory(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-md aspect-[9/16] relative bg-zinc-900 rounded-lg overflow-hidden">
            <Story mediaLength={1} duration={5000}>
              <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <StoryProgress className="mb-4" />
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={selectedStory.profiles.avatar_url} />
                    <AvatarFallback>{selectedStory.profiles.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium text-sm">{selectedStory.profiles.username}</span>
                  <span className="text-white/60 text-xs">• {new Date(selectedStory.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <StorySlide index={0} className="w-full h-full">
                <img
                  src={selectedStory.image_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
                {selectedStory.description && (
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <p className="text-lg font-medium text-center">{selectedStory.description}</p>
                  </div>
                )}
              </StorySlide>
            </Story>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortfolio;
