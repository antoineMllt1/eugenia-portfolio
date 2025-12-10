import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Search, Home, User as UserIcon, SquarePlus, Send, ChevronLeft, ChevronRight, Loader2, LogIn, LogOut, Plus, GraduationCap, Clapperboard, Image, Image as ImageIcon, Video, Music, Github, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { supabase } from '@/lib/supabase';
import { EditProfileDialog } from './components/profile/EditProfileDialog';
import { PublicProfileDialog } from './components/profile/PublicProfileDialog';
import { FollowersFollowingDialog } from './components/profile/FollowersFollowingDialog';
import { CreateStoryDialog } from './components/story/CreateStoryDialog';
import { CreateReelDialog } from './components/reel/CreateReelDialog';
import { MenuBar } from '@/components/ui/glow-menu';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

// Types
interface StudentProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  course?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface ProjectPost {
  id: string;
  user_id: string;
  profiles: StudentProfile;
  title: string;
  description: string;
  images: string[];
  video_url?: string;
  post_type?: 'post' | 'reel';
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked_by_user?: boolean;
  saved_by_user?: boolean;
}

interface Reel {
  id: string;
  user_id: string;
  profiles: StudentProfile;
  title: string;
  description: string;
  video_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked_by_user?: boolean;
  saved_by_user?: boolean;
}

type SavedPostItem = (ProjectPost & { type: 'post' }) | (Reel & { type: 'reel'; images: string[] });

type PostOrReel = ProjectPost | (Reel & { images: string[]; tags?: string[] });

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles: StudentProfile;
}

interface StoryItem {
  id: string;
  user_id: string;
  profiles: StudentProfile;
  title: string;
  description: string;
  image_url: string;
  media_url?: string; // New field for both images and videos
  media_type?: 'image' | 'video'; // New field to distinguish media type
  progress?: number;
  achievement?: string;
  created_at: string;
}

interface HighlightStory {
  id: string;
  image: string;
  media_url?: string; // New field for videos
  media_type?: 'image' | 'video'; // New field to distinguish media type
  description: string;
}

interface Highlight {
  id: string;
  user_id: string;
  title: string;
  cover_image: string | null;
  stories: HighlightStory[];
  created_at?: string;
  updated_at?: string;
}

// Grouped stories by user
interface GroupedUserStories {
  user_id: string;
  profile: StudentProfile;
  stories: StoryItem[];
  hasMultiple: boolean;
}

// Story Component
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

// @ts-ignore - Story component may be used in future
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

// @ts-ignore - StoryProgress component may be used in future
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
            className="h-1 flex-1 rounded-full bg-white/30 cursor-pointer overflow-hidden"
            onClick={() => handleProgressClick(index)}
          >
            <div
              className="h-full rounded-full bg-white transition-all duration-200"
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

// @ts-ignore - StorySlide component may be used in future
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
  const [reels, setReels] = useState<Reel[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState<GroupedUserStories | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<PostOrReel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'reels' | 'create' | 'profile'>('home');
  const [showCreateChoice, setShowCreateChoice] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    user: StudentProfile;
    lastMessage: string;
    timestamp: string;
    conversation_id: string;
  }>>([]);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender: StudentProfile;
  }>>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<StudentProfile[]>([]);
  const [newConversationSearch, setNewConversationSearch] = useState('');
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  // Highlights State - Now fetched from Supabase
  const [profileHighlights, setProfileHighlights] = useState<Highlight[]>([]);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightName, setHighlightName] = useState('');
  const [selectedArchivedStories, setSelectedArchivedStories] = useState<string[]>([]);
  const [showAddToHighlight, setShowAddToHighlight] = useState(false);
  const [userArchivedStories, setUserArchivedStories] = useState<Array<{
    id: string;
    image: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    date: string;
    created_at: string;
  }>>([]);
  const [loadingArchivedStories, setLoadingArchivedStories] = useState(false);
  
  // Highlight Viewer State
  const [viewingHighlight, setViewingHighlight] = useState<Highlight | null>(null);
  const [highlightStoryIndex, setHighlightStoryIndex] = useState(0);
  const [addedToHighlightToast, setAddedToHighlightToast] = useState<string | null>(null);

  // Handle creating new highlight - Now persists to Supabase
  const handleCreateHighlight = async () => {
    if (!user) return;
    if (!highlightName.trim() || selectedArchivedStories.length === 0) return;

    try {
      const selectedStoryObjects = userArchivedStories
        .filter(s => selectedArchivedStories.includes(s.id))
        .map(s => ({ 
          id: s.id, 
          image: s.media_url || s.image, 
          media_url: s.media_url || s.image,
          media_type: s.media_type || 'image',
          description: '' 
        }));
      
      const coverImage = selectedStoryObjects[0]?.image || null;

      // Insert into Supabase
      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: user.id,
          title: highlightName.trim(),
          cover_image: coverImage,
          stories: selectedStoryObjects,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating highlight:', error);
        let errorMessage = error.message;
        
        // Provide helpful message if table doesn't exist
        if (error.message.includes('Could not find the table') || error.message.includes('relation') || error.code === '42P01') {
          errorMessage = `La table 'highlights' n'existe pas dans la base de données. Veuillez exécuter le fichier SQL de migration (supabase_migration_highlights.sql) dans votre éditeur SQL Supabase.`;
        }
        
        alert(`Échec de la création du highlight: ${errorMessage}`);
        return;
      }

      // Update local state with the new highlight
      const newHighlight: Highlight = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        cover_image: data.cover_image,
        stories: Array.isArray(data.stories) ? data.stories : [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProfileHighlights(prev => [...prev, newHighlight]);
      setShowHighlightModal(false);
      setHighlightName('');
      setSelectedArchivedStories([]);
    } catch (error: any) {
      console.error('Error creating highlight:', error);
      alert(`Failed to create highlight: ${error.message || 'Unknown error'}`);
    }
  };

  // Toggle archived story selection
  const toggleArchivedStorySelection = (storyId: string) => {
    setSelectedArchivedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  // Add current story to existing highlight - Now persists to Supabase
  const addStoryToHighlight = async (highlightId: string, highlightTitle: string) => {
    if (!user || !selectedUserStories || !selectedUserStories.stories[currentStoryIndex]) return;

    try {
      const currentStory = selectedUserStories.stories[currentStoryIndex];
      const newStoryObj: HighlightStory = {
        id: currentStory.id,
        image: currentStory.image_url,
        media_url: currentStory.media_url || currentStory.image_url,
        media_type: currentStory.media_type || 'image',
        description: currentStory.description || '',
      };

      // Find the current highlight to get its stories
      const currentHighlight = profileHighlights.find(h => h.id === highlightId);
      if (!currentHighlight) {
        console.error('Highlight not found');
        return;
      }

      // Create updated stories array
      const updatedStories = [...currentHighlight.stories, newStoryObj];

      // Update in Supabase
      const { error } = await supabase
        .from('highlights')
        .update({ 
          stories: updatedStories,
          // Update cover_image if this is the first story
          cover_image: currentHighlight.cover_image || newStoryObj.image,
        })
        .eq('id', highlightId)
        .eq('user_id', user.id); // Security: ensure user owns this highlight

      if (error) {
        console.error('Error adding story to highlight:', error);
        alert(`Failed to add story: ${error.message}`);
        return;
      }

      // Update local state
      setProfileHighlights(prev => prev.map(h => 
        h.id === highlightId 
          ? { 
              ...h, 
              stories: updatedStories,
              cover_image: h.cover_image || newStoryObj.image,
            }
          : h
      ));
      setShowAddToHighlight(false);
      
      // Show toast notification
      setAddedToHighlightToast(highlightTitle);
      setTimeout(() => setAddedToHighlightToast(null), 2000);
    } catch (error: any) {
      console.error('Error adding story to highlight:', error);
      alert(`Failed to add story: ${error.message || 'Unknown error'}`);
    }
  };

  // Open highlight viewer
  const openHighlightViewer = (highlight: typeof profileHighlights[0]) => {
    setViewingHighlight(highlight);
    setHighlightStoryIndex(0);
  };

  // Navigate highlight stories
  const nextHighlightStory = () => {
    if (viewingHighlight && highlightStoryIndex < viewingHighlight.stories.length - 1) {
      setHighlightStoryIndex(prev => prev + 1);
    } else {
      setViewingHighlight(null);
      setHighlightStoryIndex(0);
    }
  };

  const prevHighlightStory = () => {
    if (highlightStoryIndex > 0) {
      setHighlightStoryIndex(prev => prev - 1);
    }
  };

  // Profile State
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  
  // Saved Posts State
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);

  // Follow State
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState<Record<string, boolean>>({});
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [followersFollowingDialog, setFollowersFollowingDialog] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
  }>({ isOpen: false, type: 'followers' });

  // Create Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Group stories by user
  const groupedStories = useMemo<GroupedUserStories[]>(() => {
    const grouped = stories.reduce((acc, story) => {
      const existingGroup = acc.find(g => g.user_id === story.user_id);
      if (existingGroup) {
        existingGroup.stories.push(story);
      } else {
        acc.push({
          user_id: story.user_id,
          profile: story.profiles,
          stories: [story],
          hasMultiple: false
        });
      }
      return acc;
    }, [] as GroupedUserStories[]);

    // Mark groups with multiple stories and sort stories by date
    return grouped.map(group => ({
      ...group,
      hasMultiple: group.stories.length > 1,
      stories: group.stories.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }));
  }, [stories]);

  // Handle opening a user's stories
  const handleOpenUserStories = (group: GroupedUserStories) => {
    setSelectedUserStories(group);
    setCurrentStoryIndex(0);
    // User interaction detected - this allows videos to play with sound
  };

  // Handle closing stories
  const handleCloseStories = () => {
    setSelectedUserStories(null);
    setCurrentStoryIndex(0);
  };

  // Navigate to next story
  const handleNextStory = () => {
    if (!selectedUserStories) return;
    if (currentStoryIndex < selectedUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Move to next user's stories or close
      const currentUserIndex = groupedStories.findIndex(g => g.user_id === selectedUserStories.user_id);
      if (currentUserIndex < groupedStories.length - 1) {
        setSelectedUserStories(groupedStories[currentUserIndex + 1]);
        setCurrentStoryIndex(0);
      } else {
        handleCloseStories();
      }
    }
  };

  // Navigate to previous story
  const handlePrevStory = () => {
    if (!selectedUserStories) return;
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      // Move to previous user's stories
      const currentUserIndex = groupedStories.findIndex(g => g.user_id === selectedUserStories.user_id);
      if (currentUserIndex > 0) {
        const prevGroup = groupedStories[currentUserIndex - 1];
        setSelectedUserStories(prevGroup);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  useEffect(() => {
    fetchData();
    if (user) {
      fetchUserProfile();
      fetchHighlights();
      fetchUserArchivedStories();
      fetchSavedPosts();
    } else {
      // Clear highlights and archived stories when user logs out
      setProfileHighlights([]);
      setUserArchivedStories([]);
      setSavedPosts([]);
    }
  }, [user]);

  // Fetch saved posts when profile tab is opened
  useEffect(() => {
    if (activeTab === 'profile' && user) {
      fetchSavedPosts();
    }
  }, [activeTab, user]);

  // Fetch comments when a post is selected
  useEffect(() => {
    if (selectedPost) {
      fetchPostComments(selectedPost.id);
    }
  }, [selectedPost]);

  // Check follow status when viewing a user profile
  useEffect(() => {
    if (viewingUserId && user && viewingUserId !== user.id) {
      checkIfFollowing(viewingUserId).then(following => {
        setIsFollowing(prev => ({ ...prev, [viewingUserId]: following }));
      });
    }
  }, [viewingUserId, user]);

  // Fetch conversations when messages dialog opens
  useEffect(() => {
    if (isMessagesOpen && user) {
      fetchConversations();
    }
  }, [isMessagesOpen, user]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      setMessages([]); // Clear previous messages
      fetchMessages(selectedConversation);
      // Subscribe to new messages in real-time
      const channel = supabase
        .channel(`conversation:${selectedConversation}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        }, (payload) => {
          // Fetch the new message with sender info
          fetchNewMessage(payload.new.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]); // Clear messages when no conversation is selected
    }
  }, [selectedConversation, user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      // Get all conversations where user is a participant
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (participantsError) throw participantsError;

      if (!participantsData || participantsData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantsData.map(p => p.conversation_id);

      // Get all participants for these conversations to find the other user
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          user_id,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            course
          )
        `)
        .in('conversation_id', conversationIds)
        .neq('user_id', user.id);

      if (allParticipantsError) throw allParticipantsError;

      // Get last message for each conversation
      const { data: lastMessagesData, error: lastMessagesError } = await supabase
        .from('messages')
        .select('id, conversation_id, content, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (lastMessagesError) throw lastMessagesError;

      // Build conversations list
      const formattedConversations = participantsData.map(participant => {
        const conversationId = participant.conversation_id;
        const otherParticipant = allParticipants?.find(p => p.conversation_id === conversationId);
        const lastMessage = lastMessagesData?.find(m => m.conversation_id === conversationId);

        if (!otherParticipant || !otherParticipant.profiles) {
          return null;
        }

        const profile = otherParticipant.profiles as any;
        const timestamp = lastMessage 
          ? formatMessageTime(new Date(lastMessage.created_at))
          : '';

        return {
          id: conversationId,
          conversation_id: conversationId,
          user: {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url || '',
            course: profile.course,
          },
          lastMessage: lastMessage?.content || 'Aucun message',
          timestamp,
        };
      }).filter(Boolean) as Array<{
        id: string;
        conversation_id: string;
        user: StudentProfile;
        lastMessage: string;
        timestamp: string;
      }>;

      // Sort by updated_at (most recent first)
      formattedConversations.sort((a, b) => {
        const aParticipant = participantsData.find(p => p.conversation_id === a.id);
        const bParticipant = participantsData.find(p => p.conversation_id === b.id);
        const aUpdated = (aParticipant?.conversations as any)?.updated_at || '';
        const bUpdated = (bParticipant?.conversations as any)?.updated_at || '';
        return new Date(bUpdated).getTime() - new Date(aUpdated).getTime();
      });

      setConversations(formattedConversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        sender: {
          id: msg.profiles?.id || msg.sender_id,
          username: msg.profiles?.username || 'user',
          full_name: msg.profiles?.full_name || 'User',
          avatar_url: msg.profiles?.avatar_url || '',
          course: msg.profiles?.course || '',
        },
      }));

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchNewMessage = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          profiles:sender_id (
            id,
            username,
            full_name,
            avatar_url,
            course
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;

      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      setMessages(prev => [...prev, {
        id: data.id,
        content: data.content,
        sender_id: data.sender_id,
        created_at: data.created_at,
        sender: {
          id: profile?.id || data.sender_id,
          username: profile?.username || 'user',
          full_name: profile?.full_name || 'User',
          avatar_url: profile?.avatar_url || '',
          course: profile?.course || '',
        },
      }]);
    } catch (error: any) {
      console.error('Error fetching new message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessageText.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: newMessageText.trim(),
        });

      if (error) throw error;

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setNewMessageText('');
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewConversation = async (targetUserId: string) => {
    if (!user || !targetUserId || targetUserId === user.id) return;

    try {
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants) {
        const conversationIds = existingParticipants.map(p => p.conversation_id);
        const { data: existingConv } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .eq('user_id', targetUserId)
          .single();

        if (existingConv) {
          setSelectedConversation(existingConv.conversation_id);
          setIsNewConversationOpen(false);
          return;
        }
      }

      // Create new conversation using function (bypasses RLS issues)
      const { data: conversationId, error: functionError } = await supabase
        .rpc('create_conversation_with_participants', {
          participant1_id: user.id,
          participant2_id: targetUserId
        });

      if (functionError) {
        // Log the error for debugging
        console.error('Function call error:', functionError);
        console.error('Error details:', JSON.stringify(functionError, null, 2));
        
        // Fallback to direct insert if function doesn't exist
        console.warn('Function call failed, trying direct insert:', functionError);
        
        // Debug: Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('User is not authenticated');
        }
        
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();

        if (convError) {
          console.error('Conversation creation error:', convError);
          console.error('User ID:', user.id);
          console.error('Session:', session);
          throw convError;
        }

        // Add participants
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: newConversation.id, user_id: user.id },
            { conversation_id: newConversation.id, user_id: targetUserId },
          ]);

        if (participantsError) throw participantsError;
        
        // Send email notification to the target user
        await sendConversationNotification(targetUserId, user.id, newConversation.id);
        
        setSelectedConversation(newConversation.id);
        setIsNewConversationOpen(false);
        fetchConversations();
        return;
      }

      // Success with function
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Send email notification to the target user
      await sendConversationNotification(targetUserId, user.id, conversationId);

      setSelectedConversation(conversationId);
      setIsNewConversationOpen(false);
      fetchConversations();
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      alert(`Failed to start conversation: ${error.message || 'Unknown error'}`);
    }
  };

  const sendConversationNotification = async (targetUserId: string, senderId: string, conversationId: string) => {
    try {
      // Get sender profile
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', senderId)
        .single();

      // Get target user email from auth.users via Edge Function
      // We'll pass the targetUserId and let the Edge Function fetch the email
      const { error } = await supabase.functions.invoke('send-conversation-notification', {
        body: {
          targetUserId,
          senderName: senderProfile?.full_name || senderProfile?.username || 'Quelqu\'un',
          senderUsername: senderProfile?.username || '',
          conversationId,
        },
      });

      if (error) {
        console.error('Error sending notification email:', error);
        // Don't throw - email failure shouldn't block conversation creation
      }
    } catch (error: any) {
      console.error('Error in sendConversationNotification:', error);
      // Don't throw - email failure shouldn't block conversation creation
    }
  };

  const fetchAvailableUsers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, course')
        .neq('id', user.id)
        .order('full_name', { ascending: true });

      if (error) throw error;

      setAvailableUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  }, [supabase, user]);

  // Fetch available users when new conversation dialog opens
  useEffect(() => {
    if (isNewConversationOpen && user) {
      fetchAvailableUsers();
    }
  }, [isNewConversationOpen, user, fetchAvailableUsers]);

  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Maintenant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    if (days < 7) return `${days} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const fetchPostComments = async (postId: string) => {
    if (postComments[postId]) return; // Already fetched
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPostComments(prev => ({
        ...prev,
        [postId]: (data || []).map((comment: any) => ({
          id: comment.id,
          post_id: comment.post_id,
          user_id: comment.user_id,
          text: comment.text,
          created_at: comment.created_at,
          profiles: comment.profiles,
        }))
      }));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

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
    
    // Fetch followers and following counts
    await fetchFollowCounts(user.id);
  };

  const fetchFollowCounts = async (userId: string) => {
    try {
      // Get followers count (people who follow this user)
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count (people this user follows)
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  const checkIfFollowing = async (userId: string) => {
    if (!user || !userId || userId === user.id) return false;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (userId === user.id) return;

    setLoadingFollow(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;

      setIsFollowing(prev => ({ ...prev, [userId]: true }));
      
      // Update followers count for the followed user
      if (userId === userProfile?.id) {
        setFollowersCount(prev => prev + 1);
      }
      
      // Update following count for current user
      setFollowingCount(prev => prev + 1);
    } catch (error: any) {
      console.error('Error following user:', error);
      alert(`Failed to follow user: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;

    setLoadingFollow(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setIsFollowing(prev => ({ ...prev, [userId]: false }));
      
      // Update followers count for the unfollowed user
      if (userId === userProfile?.id) {
        setFollowersCount(prev => Math.max(0, prev - 1));
      }
      
      // Update following count for current user
      setFollowingCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      alert(`Failed to unfollow user: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingFollow(false);
    }
  };

  // Fetch highlights from Supabase
  const fetchHighlights = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching highlights:', error);
        return;
      }

      // Transform data to match our Highlight interface
      const formattedHighlights: Highlight[] = (data || []).map((h: any) => ({
        id: h.id,
        user_id: h.user_id,
        title: h.title,
        cover_image: h.cover_image,
        stories: Array.isArray(h.stories) ? h.stories : [],
        created_at: h.created_at,
        updated_at: h.updated_at,
      }));

      setProfileHighlights(formattedHighlights);
    } catch (error) {
      console.error('Error fetching highlights:', error);
    }
  };

  // Fetch user's archived stories (all stories, including expired ones, for highlight creation)
  const fetchUserArchivedStories = async () => {
    if (!user) return;
    
    setLoadingArchivedStories(true);
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching archived stories:', error);
        return;
      }

      // Transform stories to archived format
      const archived = (data || []).map((story: any) => ({
        id: story.id,
        image: story.media_url || story.image_url,
        media_url: story.media_url || story.image_url,
        media_type: story.media_type || (story.media_url && story.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image') || 'image',
        date: story.created_at,
        created_at: story.created_at,
      }));

      setUserArchivedStories(archived);
    } catch (error) {
      console.error('Error fetching archived stories:', error);
    } finally {
      setLoadingArchivedStories(false);
    }
  };

  const fetchSavedPosts = async () => {
    if (!user) return;
    
    setLoadingSavedPosts(true);
    try {
      // Fetch saved posts IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (savedError) {
        console.error('Error fetching saved posts:', savedError);
        return;
      }

      if (!savedData || savedData.length === 0) {
        setSavedPosts([]);
        return;
      }

      const savedPostIds = savedData.map(s => s.post_id);

      // Fetch the actual posts
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
        .in('id', savedPostIds)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching saved posts data:', postsError);
        return;
      }

      // Format saved posts and reels
      const formattedSaved = (postsData || []).map((post: any) => {
        const isReel = post.post_type === 'reel' && post.video_url;
        const baseItem = {
          id: post.id,
          user_id: post.user_id,
          profiles: post.profiles,
          title: post.title,
          description: post.description,
          likes_count: post.likes?.length || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          liked_by_user: post.likes?.some((like: any) => like.user_id === user?.id) || false,
          saved_by_user: true, // All items in this list are saved
        };

        if (isReel) {
          return {
            ...baseItem,
            type: 'reel' as const,
            video_url: post.video_url,
            images: [post.video_url],
          };
        } else {
          return {
            ...baseItem,
            type: 'post' as const,
            images: post.images || [],
            tags: post.tags || [],
          };
        }
      });

      setSavedPosts(formattedSaved);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoadingSavedPosts(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
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

      // Separate posts and reels
      const allPosts = (postsData || []).map((post: any) => ({
        ...post,
        saved_by_user: false,
      }));

      const formattedPosts = allPosts.filter((post: any) => !post.post_type || post.post_type === 'post');
      const formattedReels = allPosts
        .filter((post: any) => post.post_type === 'reel' && post.video_url)
        .map((post: any) => ({
          id: post.id,
          user_id: post.user_id,
          profiles: post.profiles,
          title: post.title,
          description: post.description,
          video_url: post.video_url,
          likes_count: post.likes?.length || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          liked_by_user: post.likes?.some((like: any) => like.user_id === user?.id) || false,
          saved_by_user: post.saved_posts?.some((saved: any) => saved.user_id === user?.id) || false,
        }));

      setPosts(formattedPosts);
      setReels(formattedReels);

      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (storiesError) throw storiesError;
      
      // Filter out expired stories (older than 24 hours)
      const now = new Date();
      const validStories = (storiesData || []).filter((story: any) => {
        if (!story.expires_at) return true; // Keep stories without expiration date
        const expiresAt = new Date(story.expires_at);
        return expiresAt > now;
      });
      
      // Map stories to include media_url and media_type for backward compatibility
      const formattedStories = validStories.map((story: any) => ({
        ...story,
        media_url: story.media_url || story.image_url,
        media_type: story.media_type || (story.media_url && story.media_url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image') || 'image'
      }));
      
      setStories(formattedStories || []);
      
      // Delete expired stories from database in background
      if (storiesData && storiesData.length > validStories.length) {
        const expiredStoryIds = (storiesData as any[])
          .filter((story: any) => {
            if (!story.expires_at) return false;
            const expiresAt = new Date(story.expires_at);
            return expiresAt <= now;
          })
          .map((story: any) => story.id);
        
        if (expiredStoryIds.length > 0) {
          // Delete expired stories in background (don't wait for response)
          supabase
            .from('stories')
            .delete()
            .in('id', expiredStoryIds)
            .then(({ error }) => {
              if (error) {
                console.error('Error deleting expired stories:', error);
              }
            });
        }
      }

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
    
    // Check if it's a reel
    const reel = reels.find(r => r.id === postId);
    const post = posts.find(p => p.id === postId);
    const targetItem = reel || post;
    
    if (!targetItem) return;
    
    const isCurrentlyLiked = targetItem.liked_by_user;
    const newLikedState = !isCurrentlyLiked;
    const newLikesCount = isCurrentlyLiked ? targetItem.likes_count - 1 : targetItem.likes_count + 1;
    
    try {
      if (newLikedState) {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error) throw error;
      } else {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      // Update local state
      if (reel) {
        setReels(reels.map(r =>
          r.id === postId
            ? { ...r, liked_by_user: newLikedState, likes_count: newLikesCount }
            : r
        ));
      } else {
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, liked_by_user: newLikedState, likes_count: newLikesCount }
            : p
        ));
      }
      
      // Update selectedPost if it's the same item
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          liked_by_user: newLikedState,
          likes_count: newLikesCount,
        });
      }
    } catch (error: any) {
      console.error('Error liking/unliking post:', error);
      alert(`Failed to ${newLikedState ? 'like' : 'unlike'} post: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    
    // Check if it's a reel
    const reel = reels.find(r => r.id === postId);
    const post = posts.find(p => p.id === postId);
    const targetItem = reel || post;
    
    if (!targetItem) return;
    
    const isCurrentlySaved = targetItem.saved_by_user;
    
    try {
      if (isCurrentlySaved) {
        // Remove from saved_posts
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Add to saved_posts
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id,
          });
        
        if (error) throw error;
      }
      
      // Update local state
      if (reel) {
        setReels(reels.map(r =>
          r.id === postId
            ? { ...r, saved_by_user: !r.saved_by_user }
            : r
        ));
      } else {
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, saved_by_user: !p.saved_by_user }
            : p
        ));
      }
      
      // Update selectedPost if it's the same item
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({
          ...selectedPost,
          saved_by_user: !isCurrentlySaved,
        });
      }
      
      // Refresh saved posts if we're viewing the saved section
      if (savedPosts.length > 0) {
        fetchSavedPosts();
      }
    } catch (error: any) {
      console.error('Error saving/unsaving post:', error);
      alert(`Failed to ${isCurrentlySaved ? 'unsave' : 'save'} post: ${error.message || 'Unknown error'}`);
    }
  };

  const handleComment = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!commentText.trim() || !selectedPost) return;
    
    const commentTextValue = commentText.trim();
    setCommentText('');
    
    try {
      // Insert comment in database
      const { error } = await supabase.from('comments').insert({
        post_id: selectedPost.id,
        user_id: user.id,
        text: commentTextValue
      });
      
      if (error) throw error;
      
      // Update local state
      const newCommentsCount = (selectedPost.comments_count || 0) + 1;
      
      // Update in posts or reels
      const reel = reels.find(r => r.id === selectedPost.id);
      if (reel) {
        setReels(reels.map(r =>
          r.id === selectedPost.id
            ? { ...r, comments_count: newCommentsCount }
            : r
        ));
      } else {
        setPosts(posts.map(post =>
          post.id === selectedPost.id
            ? { ...post, comments_count: newCommentsCount }
            : post
        ));
      }
      
      // Update selectedPost
      setSelectedPost({
        ...selectedPost,
        comments_count: newCommentsCount,
      });

      // Add the new comment to the comments list
      if (user && userProfile) {
        const newComment: Comment = {
          id: `temp-${Date.now()}`,
          post_id: selectedPost.id,
          user_id: user.id,
          text: commentTextValue,
          created_at: new Date().toISOString(),
          profiles: {
            id: user.id,
            username: userProfile.username || user.user_metadata?.username || 'user',
            full_name: userProfile.full_name || user.user_metadata?.full_name || 'User',
            avatar_url: userProfile.avatar_url || user.user_metadata?.avatar_url || '',
          },
        };

        setPostComments(prev => ({
          ...prev,
          [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment],
        }));
      }

      // Refresh comments to get the real ID from database
      setTimeout(() => {
        fetchPostComments(selectedPost.id);
      }, 500);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      alert(`Failed to add comment: ${error.message || 'Unknown error'}`);
      // Restore comment text on error
      setCommentText(commentTextValue);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPostImage) return;

    setUploading(true);
    try {
      const fileExt = newPostImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, newPostImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        title: newPostTitle,
        description: newPostDesc,
        images: [publicUrl],
        tags: newPostTags.split(',').map(t => t.trim()),
      });

      if (dbError) throw dbError;

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

  // Combine posts and reels for the feed
  const feedItems = [
    ...filteredPosts.map(p => ({ ...p, type: 'post' as const })),
    ...reels.map(r => ({ ...r, type: 'reel' as const, images: [r.video_url], tags: [] }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden w-full pb-24 bg-background">

      <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={userProfile}
        user={user}
        onProfileUpdate={() => {
          fetchUserProfile();
          fetchData();
        }}
      />
      <PublicProfileDialog
        userId={viewingUserId}
        isOpen={!!viewingUserId}
        onClose={() => setViewingUserId(null)}
        onFollowChange={() => {
          if (viewingUserId && user) {
            checkIfFollowing(viewingUserId).then(following => {
              setIsFollowing(prev => ({ ...prev, [viewingUserId]: following }));
            });
          }
        }}
        onStartConversation={async (targetUserId) => {
          setViewingUserId(null); // Close profile dialog
          await handleStartNewConversation(targetUserId);
          setIsMessagesOpen(true); // Open messages dialog
        }}
      />
      <Dialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
        <DialogContent className="w-screen h-screen max-w-none sm:max-w-none p-0 overflow-hidden rounded-none">
          <div className="grid md:grid-cols-[320px_1fr] h-full">
            {/* Sidebar */}
            <div className="border-r border-border bg-card/50">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <div>
                  <p className="font-bold text-foreground">{userProfile?.username || user?.email?.split('@')[0] || 'Vous'}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-xs"
                  onClick={() => setIsNewConversationOpen(true)}
                >
                  Nouveau
                </Button>
              </div>
              <div className="p-3 border-b border-border">
                <Input
                  placeholder="Rechercher"
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="h-10"
                />
              </div>
              <ScrollArea className="h-full">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <p className="text-sm text-muted-foreground">Aucune conversation</p>
                    <p className="text-xs text-muted-foreground mt-2">Commencez une nouvelle conversation</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {conversations
                      .filter(c =>
                        c.user.username.toLowerCase().includes(messageSearch.toLowerCase()) ||
                        c.user.full_name.toLowerCase().includes(messageSearch.toLowerCase())
                      )
                      .map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full text-left p-4 flex items-center gap-3 hover:bg-accent transition ${
                          selectedConversation === conv.id ? 'bg-accent/70' : ''
                        }`}
                      >
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={conv.user.avatar_url} />
                          <AvatarFallback>{conv.user.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">{conv.user.full_name}</p>
                            <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">@{conv.user.username}</p>
                          <p className="text-sm text-foreground truncate">{conv.lastMessage}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Conversation Area */}
            <div className="flex flex-col bg-card">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversations.find(c => c.id === selectedConversation)?.user.avatar_url} />
                        <AvatarFallback>
                          {conversations.find(c => c.id === selectedConversation)?.user.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {conversations.find(c => c.id === selectedConversation)?.user.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{conversations.find(c => c.id === selectedConversation)?.user.username}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs"
                      onClick={() => {
                        const conv = conversations.find(c => c.id === selectedConversation);
                        if (conv) {
                          setViewingUserId(conv.user.id);
                          setIsMessagesOpen(false);
                        }
                      }}
                    >
                      Voir le profil
                    </Button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-6">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <p className="text-sm text-muted-foreground">Aucun message</p>
                          <p className="text-xs text-muted-foreground mt-1">Envoyez le premier message</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {messages.map((msg) => {
                            const isOwnMessage = msg.sender_id === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`px-3 py-2 rounded-2xl max-w-[70%] ${
                                    isOwnMessage
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-accent/60 text-foreground'
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {formatMessageTime(new Date(msg.created_at))}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Écrire un message..." 
                          className="flex-1" 
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessageText.trim() || sendingMessage}
                        >
                          {sendingMessage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Envoyer'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Vos messages</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Sélectionnez une conversation ou démarrez un nouveau message pour discuter avec d'autres utilisateurs.
                  </p>
                  <Button className="mt-4" onClick={() => setIsNewConversationOpen(true)}>
                    Commencer une discussion
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Conversation Dialog */}
      <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Sélectionnez une personne pour commencer une conversation
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={newConversationSearch}
              onChange={(e) => setNewConversationSearch(e.target.value)}
              className="mb-4"
            />
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {availableUsers
                  .filter(u =>
                    u.username.toLowerCase().includes(newConversationSearch.toLowerCase()) ||
                    u.full_name.toLowerCase().includes(newConversationSearch.toLowerCase())
                  )
                  .map((userProfile) => (
                    <button
                      key={userProfile.id}
                      onClick={() => handleStartNewConversation(userProfile.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={userProfile.avatar_url} />
                        <AvatarFallback className="bg-accent text-primary">
                          {userProfile.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{userProfile.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{userProfile.username}</p>
                        {userProfile.course && (
                          <p className="text-xs text-muted-foreground">{userProfile.course}</p>
                        )}
                      </div>
                    </button>
                  ))}
                {availableUsers.filter(u =>
                  u.username.toLowerCase().includes(newConversationSearch.toLowerCase()) ||
                  u.full_name.toLowerCase().includes(newConversationSearch.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {user && (
        <FollowersFollowingDialog
          userId={user.id}
          isOpen={followersFollowingDialog.isOpen}
          onClose={() => setFollowersFollowingDialog({ isOpen: false, type: 'followers' })}
          type={followersFollowingDialog.type}
          onFollowChange={() => {
            if (user) {
              fetchFollowCounts(user.id);
            }
          }}
        />
      )}
      <CreateStoryDialog
        isOpen={isCreateStoryOpen}
        onClose={() => setIsCreateStoryOpen(false)}
        user={user}
        onStoryCreated={() => {
          fetchData();
        }}
      />

      <CreateReelDialog
        isOpen={isCreateReelOpen}
        onClose={() => setIsCreateReelOpen(false)}
        user={user}
        onReelCreated={() => {
          fetchData();
        }}
      />

      {/* Glassmorphism Header */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <ThemeSwitcher />
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Eugenia</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Portfolio</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsMessagesOpen(true)}
              aria-label="Ouvrir les conversations"
            >
              <Send className="h-5 w-5" />
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border hover:ring-primary transition-all" onClick={() => setActiveTab('profile')}>
                  <AvatarImage src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback className="bg-accent text-primary font-medium">{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setAuthOpen(true)} variant="brand" size="sm">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Stories / Highlights Section - HOME ONLY */}
      {activeTab === 'home' && (
        <div className="highlights-rail border-y border-border/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Highlights</h2>
              <span className="text-xs text-muted-foreground">• Student Stories</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* 1. ADD STORY BUTTON - Always First (Static) */}
            {user && (() => {
              const currentUserStories = groupedStories.find(g => g.user_id === user.id);
              const hasOwnStories = !!currentUserStories;
              
              return (
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    {/* Main Avatar Button */}
                    <button
                      onClick={() => {
                        if (hasOwnStories && currentUserStories) {
                          handleOpenUserStories(currentUserStories);
                        } else {
                          setIsCreateStoryOpen(true);
                        }
                      }}
                      className="group"
                    >
                      {hasOwnStories ? (
                        // User HAS stories - Show avatar with gradient ring
                        <>
                          {currentUserStories && currentUserStories.hasMultiple && (
                            <>
                              <div className="absolute -right-0.5 -top-0.5 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#ed3d66]/40 to-[#f97316]/40 transform rotate-6" />
                              <div className="absolute -right-0.5 -top-0.5 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#ed3d66]/60 to-[#f97316]/60 transform rotate-3" />
                            </>
                          )}
                          <div className="story-ring story-ring-unread relative">
                            <div className="w-[68px] h-[68px] rounded-full bg-card p-0.5">
                              <Avatar className="w-full h-full">
                                <AvatarImage 
                                  src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                                  className="object-cover" 
                                />
                                <AvatarFallback className="bg-accent text-primary font-medium">
                                  {userProfile?.username?.[0] || user.email?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </>
                      ) : (
                        // User has NO stories - Show dashed border style
                        <div className="w-[72px] h-[72px] rounded-full bg-accent border-2 border-dashed border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-accent/80 transition-all duration-300 overflow-hidden">
                          <Avatar className="w-full h-full">
                            <AvatarImage 
                              src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                              className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                            />
                            <AvatarFallback className="bg-accent text-primary/60 font-medium">
                              {userProfile?.username?.[0] || user.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </button>
                    
                    {/* Plus Badge - Always visible, opens create dialog */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateStoryOpen(true);
                      }}
                      className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-br from-[#ed3d66] to-[#f97316] rounded-full flex items-center justify-center border-2 border-card shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                    
                    {/* Story count badge for own stories */}
                    {hasOwnStories && currentUserStories && currentUserStories.stories.length > 1 && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 min-w-[20px] h-5 px-1.5 bg-card rounded-full flex items-center justify-center border border-border shadow-sm">
                        <span className="text-[10px] font-bold text-primary">{currentUserStories.stories.length}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Your Story</span>
                </div>
              );
            })()}

            {/* 2. OTHER USERS' STORIES - Dynamic Loop (excludes current user) */}
            {groupedStories.filter(g => g.user_id !== user?.id).map((group, index) => (
              <button
                key={group.user_id}
                onClick={() => handleOpenUserStories(group)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className="relative">
                  {/* Multi-story stack indicator */}
                  {group.hasMultiple && (
                    <>
                      <div className="absolute -right-0.5 -top-0.5 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#ed3d66]/40 to-[#f97316]/40 transform rotate-6" />
                      <div className="absolute -right-0.5 -top-0.5 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#ed3d66]/60 to-[#f97316]/60 transform rotate-3" />
                    </>
                  )}
                  <div className={`story-ring ${index < 3 ? 'story-ring-unread' : ''} relative`}>
                    <div className="w-[68px] h-[68px] rounded-full bg-card p-0.5">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={group.profile.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-accent text-primary font-medium">{group.profile.username[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {/* Story count badge */}
                  {group.hasMultiple && (
                    <div className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-[#ed3d66] to-[#f97316] rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                      <span className="text-[10px] font-bold text-white">{group.stories.length}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs max-w-[72px] truncate text-muted-foreground group-hover:text-foreground transition-colors font-medium">{group.profile.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl flex-1">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Be the first to share your work!</p>
                {user && (
                  <Button variant="brand" onClick={() => setActiveTab('create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                  </Button>
                )}
              </div>
            ) : (
              feedItems.map((item, index) => {
                const isReel = item.type === 'reel';
                const itemId = item.id;
                const itemPostOrReel: PostOrReel = isReel 
                  ? { ...item, images: [item.video_url], tags: [] }
                  : item as ProjectPost;
                
                return (
                <Card key={itemId} className={`feed-item overflow-hidden`} style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Post/Reel Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        className="cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all" 
                        onClick={() => setViewingUserId(item.user_id)}
                      >
                        <AvatarImage src={item.profiles.avatar_url} />
                        <AvatarFallback className="bg-accent text-primary font-medium">{item.profiles.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p
                          className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setViewingUserId(item.user_id)}
                        >
                          {item.profiles.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.profiles.course || 'Student'}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Post/Reel Media */}
                  <div className="relative bg-muted">
                    {isReel && item.video_url ? (
                      <video
                        src={item.video_url}
                        className="w-full aspect-square object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setSelectedPost(itemPostOrReel)}
                        muted
                        playsInline
                      />
                    ) : (
                      <>
                    {item.images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg z-10"
                              onClick={() =>
                                setCurrentImageIndex(prev => ({
                                  ...prev,
                                  [itemId]: Math.max(0, (prev[itemId] ?? 0) - 1)
                                }))
                              }
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card shadow-lg z-10"
                              onClick={() =>
                                setCurrentImageIndex(prev => ({
                                  ...prev,
                                  [itemId]: Math.min(item.images.length - 1, (prev[itemId] ?? 0) + 1)
                                }))
                              }
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                        <img
                          src={item.images[(currentImageIndex[itemId] ?? 0) % item.images.length]}
                          alt={item.title}
                          className="w-full aspect-square object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setSelectedPost(itemPostOrReel)}
                        />
                        {item.images.length > 1 && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {item.images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === (currentImageIndex[itemId] ?? 0) ? 'bg-primary scale-125' : 'bg-white/60'
                                  }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {isReel && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post/Reel Actions & Content */}
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLike(itemId)}
                          className={`rounded-full ${item.liked_by_user ? 'text-primary' : ''}`}
                        >
                          <Heart className={`h-6 w-6 transition-all ${item.liked_by_user ? 'fill-primary text-primary scale-110' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPost(itemPostOrReel)} className="rounded-full">
                          <MessageCircle className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Share2 className="h-6 w-6" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSave(itemId)}
                        className={`rounded-full ${item.saved_by_user ? 'text-primary' : ''}`}
                      >
                        <Bookmark className={`h-6 w-6 ${item.saved_by_user ? 'fill-primary' : ''}`} />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm">{item.likes_count} likes</p>
                      <p className="text-sm">
                        <span className="font-semibold hover:text-primary cursor-pointer transition-colors">{item.profiles.username}</span>{' '}
                        <span className="font-bold text-foreground">{item.title}</span>
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      {!isReel && item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className="tag-badge">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Comments Section */}
                      {item.comments_count > 0 && (
                        <>
                          {!expandedComments[itemId] && postComments[itemId] && postComments[itemId].length > 0 && (
                            <div className="space-y-2 mt-2">
                              {postComments[itemId].slice(-2).map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                  <p className="text-sm">
                                    <span className="font-semibold hover:text-primary cursor-pointer transition-colors">{comment.profiles.username}</span>{' '}
                                    <span className="text-foreground">{comment.text}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          {expandedComments[itemId] && postComments[itemId] && (
                            <div className="space-y-2 mt-2">
                              {postComments[itemId].map((comment) => (
                                <div key={comment.id} className="flex gap-2">
                                  <p className="text-sm">
                                    <span className="font-semibold hover:text-primary cursor-pointer transition-colors">{comment.profiles.username}</span>{' '}
                                    <span className="text-foreground">{comment.text}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={async () => {
                              if (!expandedComments[itemId]) {
                                await fetchPostComments(itemId);
                                setExpandedComments(prev => ({ ...prev, [itemId]: true }));
                              } else {
                                setExpandedComments(prev => ({ ...prev, [itemId]: false }));
                              }
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expandedComments[itemId] ? 'Hide comments' : `View all ${item.comments_count} comments`}
                          </button>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Explore</h2>
              <p className="text-sm text-muted-foreground">Discover amazing student projects</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects, students, tags..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-[var(--radius-xl)] overflow-hidden">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square cursor-pointer relative group overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex items-center gap-3 text-white text-sm">
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" /> {post.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.comments_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Share Your Project</h2>
              <p className="text-sm text-muted-foreground">Showcase your work to the Eugenia community</p>
            </div>
            {!user ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
                <p className="text-muted-foreground text-sm mb-4">You need to sign in to create a project.</p>
                <Button variant="brand" onClick={() => setAuthOpen(true)}>Sign In</Button>
              </Card>
            ) : (
              <Card className="p-6">
                <form onSubmit={handleCreatePost} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Project Title</label>
                    <Input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="My Awesome Project"
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Description</label>
                    <Input
                      value={newPostDesc}
                      onChange={(e) => setNewPostDesc(e.target.value)}
                      placeholder="Tell us about your project..."
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Tags</label>
                    <Input
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      placeholder="react, ai, design (comma separated)"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Project Image</label>
                    <div className="border-2 border-dashed border-border rounded-[var(--radius-xl)] p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewPostImage(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                        required
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent flex items-center justify-center">
                          <SquarePlus className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">{newPostImage ? newPostImage.name : 'Click to upload'}</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                      </label>
                    </div>
                  </div>
                  <Button type="submit" variant="brand" className="w-full h-12" disabled={uploading}>
                    {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {uploading ? 'Creating...' : 'Share Project'}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fade-up">
            {/* Profile Header */}
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24 ring-4 ring-accent">
                  <AvatarImage src={userProfile?.avatar_url || (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` : '')} />
                  <AvatarFallback className="bg-accent text-primary text-2xl font-bold">{userProfile?.full_name?.[0] || 'ME'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{userProfile?.full_name || user?.user_metadata?.full_name || 'Guest'}</h2>
                  <p className="text-sm text-muted-foreground">@{userProfile?.username || user?.user_metadata?.username || 'guest'}</p>
                  <p className="text-sm mt-1 font-semibold text-primary">{userProfile?.course || 'Student'}</p>
                  {userProfile?.bio && <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{userProfile.bio}</p>}

                  {/* Social Links */}
                  {(userProfile?.github_url || userProfile?.linkedin_url) && (
                    <div className="flex items-center gap-4 mt-4">
                      {userProfile?.github_url && (
                        <a 
                          href={userProfile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 group"
                        >
                          <Github className="w-5 h-5 group-hover:text-foreground" />
                          <span className="text-sm font-medium hidden sm:inline">GitHub</span>
                        </a>
                      )}
                      {userProfile?.linkedin_url && (
                        <a 
                          href={userProfile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-[#0077B5] transition-all duration-300 hover:scale-110 group"
                        >
                          <Linkedin className="w-5 h-5 group-hover:text-[#0077B5]" />
                          <span className="text-sm font-medium hidden sm:inline">LinkedIn</span>
                        </a>
                      )}
                    </div>
                  )}

                  {user && (
                    <Button variant="outline" className="mt-4" onClick={() => setIsEditProfileOpen(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{posts.filter(p => p.user_id === user?.id).length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <button
                  onClick={() => user && setFollowersFollowingDialog({ isOpen: true, type: 'followers' })}
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <p className="text-2xl font-bold text-foreground">{followersCount}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </button>
                <button
                  onClick={() => user && setFollowersFollowingDialog({ isOpen: true, type: 'following' })}
                  className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <p className="text-2xl font-bold text-foreground">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </button>
              </div>
            </Card>

            {/* Profile Highlights Section */}
            <div className="profile-highlights">
              <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
                {/* Add New Highlight - Only visible on own profile */}
                {user && (
                  <button 
                    onClick={() => setShowHighlightModal(true)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-border flex items-center justify-center bg-accent/30 hover:bg-accent/50 hover:border-primary/50 transition-all duration-300">
                      <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">New</span>
                  </button>
                )}

                {/* Profile Highlights from State */}
                {profileHighlights.map((highlight) => (
                  <button 
                    key={highlight.id} 
                    onClick={() => openHighlightViewer(highlight)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className="relative">
                      <div className="w-[68px] h-[68px] rounded-full border border-border p-0.5 bg-card overflow-hidden group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                        <img 
                          src={highlight.cover_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'} 
                          alt={highlight.title}
                          className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      {/* Story count badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary rounded-full flex items-center justify-center border-2 border-card text-[9px] font-bold text-white">
                        {highlight.stories.length}
                      </div>
                    </div>
                    <span className="text-xs text-foreground font-medium max-w-[68px] truncate">{highlight.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">My Projects</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Combine posts and reels */}
                {[
                  ...posts.filter(p => p.user_id === user?.id).map(p => ({ ...p, type: 'post' as const })),
                  ...reels.filter(r => r.user_id === user?.id).map(r => ({ ...r, type: 'reel' as const, images: [r.video_url] }))
                ]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((item) => (
                  <div 
                    key={item.id} 
                    className="aspect-square rounded-[var(--radius-xl)] overflow-hidden relative group cursor-pointer shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1" 
                    onClick={() => {
                      // Convert to PostOrReel format for the dialog
                      if (item.type === 'reel') {
                        const reelItem: PostOrReel = {
                          ...item,
                          images: [item.video_url],
                          tags: [],
                        };
                        setSelectedPost(reelItem);
                      } else {
                        setSelectedPost(item as ProjectPost);
                      }
                    }}
                  >
                    {item.type === 'reel' && item.video_url ? (
                      <video 
                        src={item.video_url} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        muted
                        playsInline
                      />
                    ) : (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    {/* Video indicator for reels */}
                    {item.type === 'reel' && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-white" /> {item.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {posts.filter(p => p.user_id === user?.id).length === 0 && reels.filter(r => r.user_id === user?.id).length === 0 && (
                <Card className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                    <SquarePlus className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">You haven't posted any projects yet.</p>
                  <Button variant="brand" onClick={() => setActiveTab('create')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Project
                  </Button>
                </Card>
              )}
            </div>

            {/* Saved Posts Section */}
            {user && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-foreground mb-4">Saved</h3>
                {loadingSavedPosts ? (
                  <Card className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading saved posts...</p>
                  </Card>
                ) : savedPosts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                      <Bookmark className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-4">You haven't saved any posts yet.</p>
                    <p className="text-sm text-muted-foreground">Save posts and reels you like to view them later.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {savedPosts.map((item) => (
                      <div 
                        key={item.id} 
                        className="aspect-square rounded-[var(--radius-xl)] overflow-hidden relative group cursor-pointer shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1" 
                        onClick={() => {
                          // Convert to PostOrReel format for the dialog
                          if (item.type === 'reel') {
                            const reelItem: PostOrReel = {
                              ...item,
                              images: [item.video_url],
                              tags: [],
                            };
                            setSelectedPost(reelItem);
                          } else {
                            setSelectedPost(item as ProjectPost);
                          }
                        }}
                      >
                        {item.type === 'reel' ? (
                          <video 
                            src={item.video_url} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            muted
                            playsInline
                          />
                        ) : (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        )}
                        {/* Video indicator for reels */}
                        {item.type === 'reel' && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Saved indicator */}
                        <div className="absolute top-2 left-2 z-10">
                          <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Bookmark className="w-4 h-4 text-primary fill-primary" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="font-bold text-white text-sm">{item.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-white/80 text-xs">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-white" /> {item.likes_count}</span>
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.comments_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reels View - Full Screen */}
      {activeTab === 'reels' && (
        <div className="fixed inset-0 z-40 bg-black">
          {/* Reels Container with Snap Scroll */}
          <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
            {reels.length === 0 ? (
              <div className="h-screen w-full snap-start relative flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#ed3d66] to-[#f97316] flex items-center justify-center">
                    <Clapperboard className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Aucun Reel pour le moment</h3>
                  <p className="text-white/60 text-sm mb-4">Soyez le premier à partager un Reel !</p>
                  {user && (
                    <Button 
                      variant="outline" 
                      className="rounded-full border-white/30 text-white hover:bg-white/10"
                      onClick={() => setIsCreateReelOpen(true)}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Créer un Reel
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="rounded-full text-white/60 hover:text-white hover:bg-white/10 mt-2"
                    onClick={() => setActiveTab('home')}
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </div>
            ) : (
              reels.map((reel, index) => (
                <div key={reel.id} className="h-screen w-full snap-start relative flex items-center justify-center bg-black">
                  {/* Video */}
                  <video
                    src={reel.video_url}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay={index === 0}
                    muted
                    loop
                    playsInline
                    onClick={(e) => {
                      const video = e.currentTarget;
                      if (video.muted) {
                        video.muted = false;
                        video.play().catch(() => {
                          video.muted = true;
                        });
                      }
                    }}
                    ref={(video) => {
                      if (video && index === 0) {
                        video.muted = true;
                        video.play().catch(() => {
                          video.muted = true;
                        });
                      }
                    }}
                  />
                  
                  {/* User Info - Bottom Left */}
                  <div className="absolute bottom-24 left-4 right-20 z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar 
                        className="w-10 h-10 ring-2 ring-white/20 cursor-pointer"
                        onClick={() => setViewingUserId(reel.user_id)}
                      >
                        <AvatarImage src={reel.profiles.avatar_url} />
                        <AvatarFallback>{reel.profiles.username[0]}</AvatarFallback>
                      </Avatar>
                      <span 
                        className="text-white font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setViewingUserId(reel.user_id)}
                      >
                        @{reel.profiles.username}
                      </span>
                      {user && reel.user_id !== user.id && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 rounded-full border-white/30 text-white text-xs hover:bg-white/10"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const following = await checkIfFollowing(reel.user_id);
                            if (following) {
                              await handleUnfollow(reel.user_id);
                            } else {
                              await handleFollow(reel.user_id);
                            }
                          }}
                          disabled={loadingFollow}
                        >
                          {loadingFollow ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isFollowing[reel.user_id] ? (
                            'Unfollow'
                          ) : (
                            'Follow'
                          )}
                        </Button>
                      )}
                    </div>
                    {reel.description && (
                      <p className="text-white text-sm leading-relaxed">
                        {reel.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Music className="w-3 h-3 text-white/60" />
                      <span className="text-white/60 text-xs">Original Sound - {reel.profiles.username}</span>
                    </div>
                  </div>

                  {/* Action Buttons - Right Side */}
                  <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6">
                    <button 
                      className="flex flex-col items-center gap-1 group"
                      onClick={() => handleLike(reel.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Heart className={`w-6 h-6 ${reel.liked_by_user ? 'text-[#ed3d66] fill-[#ed3d66]' : 'text-white'}`} />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {reel.likes_count > 0 ? (reel.likes_count > 1000 ? `${(reel.likes_count / 1000).toFixed(1)}K` : reel.likes_count) : ''}
                      </span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {reel.comments_count > 0 ? (reel.comments_count > 1000 ? `${(reel.comments_count / 1000).toFixed(1)}K` : reel.comments_count) : ''}
                      </span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-1 group"
                      onClick={() => handleSave(reel.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Bookmark className={`w-6 h-6 ${reel.saved_by_user ? 'text-primary fill-primary' : 'text-white'}`} />
                      </div>
                      <span className="text-white text-xs font-medium">Save</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Share</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reels Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-20">
            <div className="flex items-center justify-between">
              <h1 className="text-white font-bold text-xl">Reels</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 rounded-full"
                onClick={() => setActiveTab('home')}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <MenuBar
          items={[
            { icon: Home, label: 'Home', href: '#' },
            { icon: Search, label: 'Search', href: '#' },
            { icon: Clapperboard, label: 'Reels', href: '#' },
            { icon: SquarePlus, label: 'Create', href: '#' },
            { icon: UserIcon, label: 'Profile', href: '#' },
          ]}
          activeItem={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          onItemClick={(item) => {
            const tab = item.toLowerCase();
            if (tab === 'create') {
              setShowCreateChoice(true);
            } else {
              setActiveTab(tab as any);
            }
          }}
        />
      </div>

      {/* Create Choice Modal */}
      <Dialog open={showCreateChoice} onOpenChange={setShowCreateChoice}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-[var(--radius-xl)]">
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Create New</h2>
              <p className="text-sm text-muted-foreground mt-1">What would you like to share?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Post Option */}
              <button
                onClick={() => {
                  setShowCreateChoice(false);
                  setActiveTab('create');
                }}
                className="group flex flex-col items-center gap-3 p-6 rounded-[var(--radius-xl)] bg-accent/50 hover:bg-accent border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Image className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Post</p>
                  <p className="text-xs text-muted-foreground">Share a photo</p>
                </div>
              </button>

              {/* Reel Option */}
              <button
                onClick={() => {
                  setShowCreateChoice(false);
                  setIsCreateReelOpen(true);
                }}
                className="group flex flex-col items-center gap-3 p-6 rounded-[var(--radius-xl)] bg-accent/50 hover:bg-accent border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ed3d66] to-[#f97316] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Reel</p>
                  <p className="text-xs text-muted-foreground">Share a video</p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Highlight Creation Modal */}
      <Dialog open={showHighlightModal} onOpenChange={(open) => {
        setShowHighlightModal(open);
        if (open && user) {
          // Fetch user's stories when modal opens
          fetchUserArchivedStories();
        }
        if (!open) {
          setHighlightName('');
          setSelectedArchivedStories([]);
        }
      }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-[var(--radius-xl)] max-h-[85vh]">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">New Highlight</h2>
              <Button 
                variant="brand" 
                size="sm"
                onClick={handleCreateHighlight}
                disabled={!highlightName.trim() || selectedArchivedStories.length === 0}
              >
                Create
              </Button>
            </div>

            {/* Highlight Name Input */}
            <div className="p-4 border-b border-border">
              <label className="text-sm font-medium text-foreground mb-2 block">Highlight Name</label>
              <Input
                value={highlightName}
                onChange={(e) => setHighlightName(e.target.value)}
                placeholder="e.g., Projects, BDD, Design..."
                className="h-11"
              />
            </div>

            {/* Story Selector */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Select Stories</p>
                <span className="text-xs text-muted-foreground">{selectedArchivedStories.length} selected</span>
              </div>
              
              {loadingArchivedStories ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Chargement de vos stories...</span>
                </div>
              ) : userArchivedStories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune story dans votre historique</p>
                  <p className="text-xs text-muted-foreground mt-1">Créez des stories pour pouvoir les ajouter à vos highlights</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {userArchivedStories.map((story) => {
                    const isSelected = selectedArchivedStories.includes(story.id);
                    return (
                      <button
                        key={story.id}
                        onClick={() => toggleArchivedStorySelection(story.id)}
                        className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected 
                            ? 'border-primary ring-2 ring-primary/30' 
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        {story.media_type === 'video' ? (
                          <video 
                            src={story.media_url || story.image} 
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img 
                            src={story.media_url || story.image} 
                            alt="Story" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {/* Video indicator */}
                        {story.media_type === 'video' && (
                          <div className="absolute top-1 right-1">
                            <Video className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        )}
                        {/* Selection overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Date */}
                        <div className="absolute bottom-1 left-1 right-1">
                          <span className="text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full">
                            {new Date(story.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Preview */}
            {selectedArchivedStories.length > 0 && (
              <div className="p-4 border-t border-border bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-border overflow-hidden">
                    {userArchivedStories.find(s => s.id === selectedArchivedStories[0])?.media_type === 'video' ? (
                      <video 
                        src={userArchivedStories.find(s => s.id === selectedArchivedStories[0])?.media_url || userArchivedStories.find(s => s.id === selectedArchivedStories[0])?.image} 
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={userArchivedStories.find(s => s.id === selectedArchivedStories[0])?.media_url || userArchivedStories.find(s => s.id === selectedArchivedStories[0])?.image} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{highlightName || 'Sans titre'}</p>
                    <p className="text-xs text-muted-foreground">{selectedArchivedStories.length} {selectedArchivedStories.length === 1 ? 'story' : 'stories'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[var(--radius-xl)]">
          <div className="grid md:grid-cols-2 h-[85vh]">
            <div className="bg-black flex items-center justify-center">
              {selectedPost && (
                <>
                  {'video_url' in selectedPost && selectedPost.video_url ? (
                    <video
                      src={selectedPost.video_url}
                      controls
                      autoPlay
                      muted={false}
                      loop
                      playsInline
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => {
                        // Allow user to unmute by clicking
                        const video = e.currentTarget;
                        if (video.muted) {
                          video.muted = false;
                        }
                      }}
                    />
                  ) : (
                    <img
                      src={selectedPost.images[0]}
                      alt={selectedPost.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col h-full bg-card">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-accent">
                    <AvatarImage src={selectedPost?.profiles.avatar_url} />
                    <AvatarFallback className="bg-accent text-primary font-medium">{selectedPost?.profiles.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selectedPost?.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPost?.profiles.course}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-xl text-foreground">{selectedPost?.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{selectedPost?.description}</p>
                  {selectedPost?.tags && selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedPost.tags.map((tag) => (
                        <span key={tag} className="tag-badge">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <p className="text-sm font-semibold">Comments</p>
                  {selectedPost && loadingComments[selectedPost.id] ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : selectedPost && postComments[selectedPost.id] && postComments[selectedPost.id].length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {postComments[selectedPost.id].map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={comment.profiles.avatar_url} />
                            <AvatarFallback className="bg-accent text-primary text-xs">
                              {comment.profiles.full_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="bg-accent/50 rounded-lg p-2">
                              <p className="text-sm font-semibold">{comment.profiles.username}</p>
                              <p className="text-sm text-foreground break-words">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-2">
                              {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedPost && handleLike(selectedPost.id)}
                    className={`rounded-full ${selectedPost?.liked_by_user ? 'text-primary' : ''}`}
                  >
                    <Heart className={`h-6 w-6 ${selectedPost?.liked_by_user ? 'fill-primary' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="h-6 w-6" />
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectedPost && handleSave(selectedPost.id)}
                    className={`rounded-full ${selectedPost?.saved_by_user ? 'text-primary' : ''}`}
                  >
                    <Bookmark className={`h-6 w-6 ${selectedPost?.saved_by_user ? 'fill-primary' : ''}`} />
                  </Button>
                </div>
                <p className="text-sm font-semibold mb-3">{selectedPost?.likes_count} likes</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    className="flex-1 rounded-full"
                  />
                  <Button size="icon" onClick={handleComment} disabled={!commentText.trim()} variant="brand">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer - Multi-Story Support */}
      {selectedUserStories && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white z-50 transition-colors"
            onClick={handleCloseStories}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50 backdrop-blur-sm"
            onClick={handlePrevStory}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50 backdrop-blur-sm"
            onClick={handleNextStory}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="w-full max-w-md aspect-[9/16] relative bg-zinc-900 rounded-[var(--radius-xl)] overflow-hidden shadow-2xl">
            {/* Story Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/70 to-transparent">
              {/* Multi-story progress indicators */}
              <div className="flex gap-1 mb-4">
                {selectedUserStories.stories.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 rounded-full overflow-hidden bg-white/30 cursor-pointer"
                    onClick={() => setCurrentStoryIndex(idx)}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        idx < currentStoryIndex 
                          ? 'bg-white w-full' 
                          : idx === currentStoryIndex 
                            ? 'bg-gradient-to-r from-[#ed3d66] to-[#f97316] animate-pulse w-full' 
                            : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="story-ring p-0.5">
                  <Avatar className="w-9 h-9 bg-card">
                    <AvatarImage src={selectedUserStories.profile.avatar_url} />
                    <AvatarFallback className="bg-accent text-primary text-sm font-medium">
                      {selectedUserStories.profile.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <span className="text-white font-semibold text-sm block">{selectedUserStories.profile.username}</span>
                  <span className="text-white/60 text-xs">
                    {new Date(selectedUserStories.stories[currentStoryIndex]?.created_at).toLocaleDateString()}
                    {selectedUserStories.hasMultiple && (
                      <span className="ml-2 text-white/40">
                        • {currentStoryIndex + 1}/{selectedUserStories.stories.length}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Story Content */}
            {selectedUserStories.stories[currentStoryIndex] && (
              <div className="w-full h-full relative">
                {selectedUserStories.stories[currentStoryIndex].media_type === 'video' || 
                 (selectedUserStories.stories[currentStoryIndex].media_url && 
                  !selectedUserStories.stories[currentStoryIndex].image_url) ? (
                  <video
                    ref={(video) => {
                      // Auto-unmute when video is ready (after user interaction with opening the story)
                      if (video) {
                        video.muted = false;
                        // Try to play with sound (may fail due to browser policies)
                        video.play().catch(() => {
                          // If autoplay with sound fails, keep muted
                          video.muted = true;
                        });
                      }
                    }}
                    src={selectedUserStories.stories[currentStoryIndex].media_url || selectedUserStories.stories[currentStoryIndex].image_url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted={false}
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={selectedUserStories.stories[currentStoryIndex].media_url || selectedUserStories.stories[currentStoryIndex].image_url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                )}
                {selectedUserStories.stories[currentStoryIndex].description && (
                  <div className="absolute bottom-20 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-lg font-medium text-white text-center leading-relaxed">
                      {selectedUserStories.stories[currentStoryIndex].description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-6">
                {/* Reply Input */}
                <div className="flex-1 flex items-center gap-2">
                  <Input 
                    placeholder="Send message..." 
                    className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-full"
                  />
                </div>
                
                {/* Add to Highlight Button */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setShowAddToHighlight(!showAddToHighlight)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        showAddToHighlight 
                          ? 'bg-primary text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    
                    {/* Highlight Selection Menu */}
                    {showAddToHighlight && (
                      <div className="absolute bottom-14 right-0 w-48 bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-scale-in">
                        <div className="p-2 border-b border-border">
                          <p className="text-xs font-semibold text-foreground px-2">Add to Highlight</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {profileHighlights.map((highlight) => (
                            <button
                              key={highlight.id}
                              onClick={() => addStoryToHighlight(highlight.id, highlight.title)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                                <img src={highlight.cover_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-sm text-foreground truncate">{highlight.title}</span>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setShowAddToHighlight(false);
                            handleCloseStories();
                            setActiveTab('profile');
                            setTimeout(() => setShowHighlightModal(true), 300);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 border-t border-border hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                            <Plus className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm text-primary font-medium">New Highlight</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Share Button */}
                <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tap zones for navigation */}
            <div className="absolute inset-0 flex z-10">
              <div 
                className="w-1/3 h-full cursor-pointer" 
                onClick={handlePrevStory}
              />
              <div className="w-1/3 h-full" />
              <div 
                className="w-1/3 h-full cursor-pointer" 
                onClick={handleNextStory}
              />
            </div>
          </div>
        </div>
      )}

      {/* Highlight Viewer */}
      {viewingHighlight && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white z-50 transition-colors"
            onClick={() => {
              setViewingHighlight(null);
              setHighlightStoryIndex(0);
            }}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50 backdrop-blur-sm"
            onClick={prevHighlightStory}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50 backdrop-blur-sm"
            onClick={nextHighlightStory}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="w-full max-w-md aspect-[9/16] relative bg-zinc-900 rounded-[var(--radius-xl)] overflow-hidden shadow-2xl">
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex gap-1 mb-4">
                {viewingHighlight.stories.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 rounded-full overflow-hidden bg-white/30 cursor-pointer"
                    onClick={() => setHighlightStoryIndex(idx)}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        idx < highlightStoryIndex 
                          ? 'bg-white w-full' 
                          : idx === highlightStoryIndex 
                            ? 'bg-gradient-to-r from-[#ed3d66] to-[#f97316] w-full' 
                            : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Highlight Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                  <img src={viewingHighlight.cover_image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-white font-semibold text-sm block">{viewingHighlight.title}</span>
                  <span className="text-white/60 text-xs">
                    {highlightStoryIndex + 1} of {viewingHighlight.stories.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Story Content */}
            {viewingHighlight.stories[highlightStoryIndex] && (
              <div className="w-full h-full relative">
                {viewingHighlight.stories[highlightStoryIndex].media_type === 'video' || 
                 (viewingHighlight.stories[highlightStoryIndex].media_url && 
                  !viewingHighlight.stories[highlightStoryIndex].image) ? (
                  <video
                    ref={(video) => {
                      // Auto-unmute when video is ready (after user interaction with opening the highlight)
                      if (video) {
                        video.muted = false;
                        // Try to play with sound (may fail due to browser policies)
                        video.play().catch(() => {
                          // If autoplay with sound fails, keep muted
                          video.muted = true;
                        });
                      }
                    }}
                    src={viewingHighlight.stories[highlightStoryIndex].media_url || viewingHighlight.stories[highlightStoryIndex].image}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    muted={false}
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={viewingHighlight.stories[highlightStoryIndex].media_url || viewingHighlight.stories[highlightStoryIndex].image}
                    alt="Highlight Story"
                    className="w-full h-full object-cover"
                  />
                )}
                {viewingHighlight.stories[highlightStoryIndex].description && (
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-lg font-medium text-white text-center leading-relaxed">
                      {viewingHighlight.stories[highlightStoryIndex].description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tap zones for navigation */}
            <div className="absolute inset-0 flex z-10">
              <div className="w-1/3 h-full cursor-pointer" onClick={prevHighlightStory} />
              <div className="w-1/3 h-full" />
              <div className="w-1/3 h-full cursor-pointer" onClick={nextHighlightStory} />
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {addedToHighlightToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-up">
          <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-full shadow-2xl">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-foreground">Added to {addedToHighlightToast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortfolio;
