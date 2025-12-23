// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { userId } = await req.json()

        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: req.headers.get('Authorization')! } },
        })

        const { data: { user }, error: authError } = await userClient.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        const adminClient = createClient(supabaseUrl, supabaseServiceKey)
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role, is_admin')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.is_admin === true || profile?.role === 'admin'
        if (!isAdmin) throw new Error('Forbidden: Admin access required')

        // Suppression de l'utilisateur (Auth + Database via cascade si configuré, 
        // ou manuellement ici si nécessaire. Auth admin delete s'occupe de l'auth)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
