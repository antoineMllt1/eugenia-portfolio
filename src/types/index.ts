export interface StudentProfile {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio?: string | null;
    course?: string | null;
    github_url?: string | null;
    linkedin_url?: string | null;
    role?: string | null;
    is_admin?: boolean | null;
    language?: string | null;
}

export type UserProfile = StudentProfile;

export interface ProjectPost {
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

export interface Reel {
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
    profiles: StudentProfile;
    title: string;
    description: string;
    image_url: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    progress?: number;
    achievement?: string;
    created_at: string;
}

export interface HighlightStory {
    id: string;
    image: string;
    media_url?: string;
    media_type?: 'image' | 'video';
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
    user_id: string;
    profile: StudentProfile;
    stories: StoryItem[];
    hasMultiple: boolean;
}

export interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string | null;
    sender: StudentProfile;
}

export type SavedPostItem = (ProjectPost & { type: 'post' }) | (Reel & { type: 'reel'; images: string[] });

export type PostOrReel = ProjectPost | (Reel & { images: string[]; tags?: string[] });
