export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
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
                Relationships: [
                    {
                        foreignKeyName: "comments_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "comments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            conversation_participants: {
                Row: {
                    conversation_id: string
                    created_at: string | null
                    id: string
                    role: string | null
                    user_id: string
                }
                Insert: {
                    conversation_id: string
                    created_at?: string | null
                    id?: string
                    role?: string | null
                    user_id: string
                }
                Update: {
                    conversation_id?: string
                    created_at?: string | null
                    id?: string
                    role?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "conversation_participants_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "conversation_participants_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            conversations: {
                Row: {
                    created_at: string | null
                    id: string
                    last_message_at: string | null
                    metadata: Json | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    last_message_at?: string | null
                    metadata?: Json | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    last_message_at?: string | null
                    metadata?: Json | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            follows: {
                Row: {
                    created_at: string
                    follower_id: string
                    following_id: string
                    id: string
                }
                Insert: {
                    created_at?: string
                    follower_id: string
                    following_id: string
                    id?: string
                }
                Update: {
                    created_at?: string
                    follower_id?: string
                    following_id?: string
                    id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "follows_follower_id_fkey"
                        columns: ["follower_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "follows_following_id_fkey"
                        columns: ["following_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            highlights: {
                Row: {
                    cover_image: string | null
                    created_at: string | null
                    id: string
                    stories: Json | null
                    title: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    cover_image?: string | null
                    created_at?: string | null
                    id?: string
                    stories?: Json | null
                    title: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    cover_image?: string | null
                    created_at?: string | null
                    id?: string
                    stories?: Json | null
                    title?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "highlights_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            likes: {
                Row: {
                    created_at: string
                    id: string
                    post_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    post_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    post_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "likes_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "likes_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            messages: {
                Row: {
                    content: string
                    conversation_id: string
                    created_at: string | null
                    id: string
                    sender_id: string
                    status: string | null
                }
                Insert: {
                    content: string
                    conversation_id: string
                    created_at?: string | null
                    id?: string
                    sender_id: string
                    status?: string | null
                }
                Update: {
                    content?: string
                    conversation_id?: string
                    created_at?: string | null
                    id?: string
                    sender_id?: string
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "conversations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            posts: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    images: string[] | null
                    tags: string[] | null
                    title: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    tags?: string[] | null
                    title: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    tags?: string[] | null
                    title?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    course: string | null
                    created_at: string
                    full_name: string | null
                    github_url: string | null
                    id: string
                    is_admin: boolean | null
                    language: string | null
                    linkedin_url: string | null
                    role: string | null
                    updated_at: string
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    course?: string | null
                    created_at?: string
                    full_name?: string | null
                    github_url?: string | null
                    id: string
                    is_admin?: boolean | null
                    language?: string | null
                    linkedin_url?: string | null
                    role?: string | null
                    updated_at?: string
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    course?: string | null
                    created_at?: string
                    full_name?: string | null
                    github_url?: string | null
                    id?: string
                    is_admin?: boolean | null
                    language?: string | null
                    linkedin_url?: string | null
                    role?: string | null
                    updated_at?: string
                    username?: string | null
                }
                Relationships: []
            }
            reels: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    title: string
                    user_id: string
                    video_url: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    title: string
                    user_id: string
                    video_url: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    title?: string
                    user_id?: string
                    video_url?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reels_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            saved_posts: {
                Row: {
                    created_at: string
                    id: string
                    post_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    post_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    post_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "saved_posts_post_id_fkey"
                        columns: ["post_id"]
                        isOneToOne: false
                        referencedRelation: "posts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "saved_posts_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            stories: {
                Row: {
                    created_at: string
                    description: string | null
                    expires_at: string
                    id: string
                    media_type: string
                    media_url: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    expires_at: string
                    id?: string
                    media_type: string
                    media_url: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    expires_at?: string
                    id?: string
                    media_type?: string
                    media_url?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "stories_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
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
            get_user_conversations: {
                Args: {
                    current_user_id: string
                }
                Returns: Json
            }
            get_user_messages: {
                Args: {
                    conversation_id_param: string
                    current_user_id: string
                }
                Returns: Json
            }
            mark_messages_as_read: {
                Args: {
                    conversation_id_param: string
                    user_id_param: string
                }
                Returns: undefined
            }
            get_other_participant: {
                Args: {
                    conversation_id_param: string
                    current_user_id: string
                }
                Returns: string
            }
            add_conversation_participant: {
                Args: {
                    conversation_id_param: string
                    user_id_param: string
                }
                Returns: undefined
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
