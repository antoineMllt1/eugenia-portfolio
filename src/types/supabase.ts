export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            Admin: {
                Row: {
                    created_at: string
                    email: string
                    id: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    id?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    id?: string
                }
                Relationships: []
            }
            comments: {
                Row: {
                    created_at: string
                    id: string
                    post_id: string
                    text: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    post_id: string
                    text: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    post_id?: string
                    text?: string
                    user_id?: string
                }
                Relationships: []
            }
            conversations: {
                Row: {
                    id: string
                    created_at: string | null
                    updated_at: string | null
                    last_message: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    updated_at?: string | null
                    last_message?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    updated_at?: string | null
                    last_message?: string | null
                }
                Relationships: []
            }
            conversation_participants: {
                Row: {
                    id: string
                    conversation_id: string
                    user_id: string
                    role: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    user_id: string
                    role?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    user_id?: string
                    role?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    created_at: string | null
                    seen_at: string | null
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    created_at?: string | null
                    seen_at?: string | null
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string | null
                    seen_at?: string | null
                }
                Relationships: []
            }
            follows: {
                Row: {
                    id: string
                    follower_id: string
                    following_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    follower_id: string
                    following_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    follower_id?: string
                    following_id?: string
                    created_at?: string | null
                }
                Relationships: []
            }
            highlights: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    cover_image: string | null
                    stories: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    cover_image?: string | null
                    stories?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    cover_image?: string | null
                    stories?: Json
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            likes: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    created_at?: string | null
                }
                Relationships: []
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string
                    images: string[]
                    tags: string[]
                    created_at: string
                    post_type: string | null
                    video_url: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description: string
                    images: string[]
                    tags: string[]
                    created_at?: string
                    post_type?: string | null
                    video_url?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string
                    images?: string[]
                    tags?: string[]
                    created_at?: string
                    post_type?: string | null
                    video_url?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    course: string | null
                    role: string | null
                    is_admin: boolean | null
                    updated_at: string | null
                    github_url: string | null
                    linkedin_url: string | null
                    language: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    course?: string | null
                    role?: string | null
                    is_admin?: boolean | null
                    updated_at?: string | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    language?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    course?: string | null
                    role?: string | null
                    is_admin?: boolean | null
                    updated_at?: string | null
                    github_url?: string | null
                    linkedin_url?: string | null
                    language?: string | null
                }
                Relationships: []
            }
            saved_posts: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    created_at?: string | null
                }
                Relationships: []
            }
            stories: {
                Row: {
                    id: string
                    user_id: string
                    image_url: string | null
                    media_url: string | null
                    media_type: string | null
                    title: string | null
                    description: string | null
                    created_at: string
                    expires_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    image_url?: string | null
                    media_url?: string | null
                    media_type?: string | null
                    title?: string | null
                    description?: string | null
                    created_at?: string
                    expires_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    image_url?: string | null
                    media_url?: string | null
                    media_type?: string | null
                    title?: string | null
                    description?: string | null
                    created_at?: string
                    expires_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_other_participant: {
                Args: {
                    conversation_id_param: string
                    current_user_id: string
                }
                Returns: string
            }
            get_user_conversations: {
                Args: {
                    current_user_id: string
                }
                Returns: Json
            }
            check_existing_conversation: {
                Args: {
                    user1_id: string
                    user2_id: string
                }
                Returns: string
            }
            create_conversation_with_participants: {
                Args: {
                    participant1_id: string
                    participant2_id: string
                }
                Returns: string
            }
            add_conversation_participant: {
                Args: {
                    conversation_id_param: string
                    user_id_param: string
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
