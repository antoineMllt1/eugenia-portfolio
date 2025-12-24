// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Create Supabase Client (Service Role for Admin actions)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Get the user from the Request Authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing Authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Verify the JWT is valid and get the user
        // We reuse the admin client but verify the token explicitly or use a context-scoped client
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. MIDDLEWARE: Check if user is Admin
        // We check the public.profiles table for the 'role' field
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile || profile.role !== 'admin') {
            // Return 403 if not admin
            return new Response(
                JSON.stringify({ error: 'Forbidden: Admin access required' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 4. Fetch All Users data (combining auth.users and public.profiles)
        // Fetch all profiles first (easier access)
        const { data: allProfiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, role, created_at')
            .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        // Fetch emails from auth.admin
        // Note: listUsers defaults to page 1, distinct users. Pagination might be needed for large sets.
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000 // Reasonable limit for now
        })

        if (authError) throw authError

        // Combine data
        const combinedUsers = allProfiles.map(p => {
            const authUser = authUsers.find(u => u.id === p.id)
            return {
                id: p.id,
                full_name: p.full_name || 'N/A',
                email: authUser?.email || 'N/A',
                role: p.role,
                created_at: p.created_at || authUser?.created_at
            }
        })

        // Return the list
        return new Response(
            JSON.stringify(combinedUsers),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
