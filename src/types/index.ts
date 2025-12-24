export interface StudentProfile {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
    course?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    role?: string | null;
    is_admin?: boolean | null;
    language?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface ProjectPost {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    images: string[];
    tags: string[];
    created_at: string;
    profiles: StudentProfile;
    likes_count?: number;
    comments_count?: number;
    liked_by_user?: boolean;
    saved_by_user?: boolean;
}

export interface Reel {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    video_url: string;
    created_at: string;
    profiles: StudentProfile;
    likes_count?: number;
    comments_count?: number;
    liked_by_user?: boolean;
    saved_by_user?: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    text: string;
    created_at: string;
    profiles: StudentProfile;
}

export interface StoryItem {
    id: string;
    user_id: string;
    media_url: string;
    media_type: 'video' | 'image';
    description: string | null;
    created_at: string;
    expires_at: string;
    profiles: StudentProfile;
}

export interface HighlightStory {
    id: string;
    image: string;
    media_url: string;
    media_type: 'video' | 'image';
    description: string;
}

export interface Highlight {
    id: string;
    user_id: string;
    title: string;
    cover_image: string | null;
    stories: HighlightStory[];
    created_at?: string;
    updated_at?: string;
}

export interface GroupedUserStories {
    userId: string;
    profile: StudentProfile;
    stories: StoryItem[];
    hasUnread: boolean;
    hasMultiple: boolean;
}

export interface SavedPostItem {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
    posts: ProjectPost;
}

export type PostOrReel = (ProjectPost & { post_type: 'post' }) | (Reel & { post_type: 'reel'; images: string[]; tags: string[] });

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string | null;
    status: string | null;
}
