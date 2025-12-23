// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw new Error('Missing environment variables')
        }

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } },
        })

        const { data: { user }, error: authError } = await userClient.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role, is_admin')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.is_admin === true || profile?.role === 'admin'
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
        if (listError) throw listError

        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('id, full_name, username, role, is_admin')

        if (profilesError) throw profilesError

        const usersList = users.users.map((u: any) => {
            const p = profiles.find((profile: any) => profile.id === u.id)
            return {
                id: u.id,
                email: u.email,
                created_at: u.created_at,
                full_name: p?.full_name || '',
                username: p?.username || '',
                role: p?.role || 'user',
                is_admin: p?.is_admin || false
            }
        })

        return new Response(JSON.stringify(usersList), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
