import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    // Get request body
    const { targetUserId, senderName, senderUsername, conversationId } = await req.json()

    if (!targetUserId || !senderName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role to access auth.users
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get target user email from auth.users
    const { data: targetUser, error: userError } = await supabase.auth.admin.getUserById(targetUserId)
    
    if (userError || !targetUser?.user?.email) {
      console.error('Error fetching target user:', userError)
      return new Response(
        JSON.stringify({ error: 'Target user not found', skipped: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const to = targetUser.user.email

    // If Resend API key is not configured, return success but log warning
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email notification skipped.')
      return new Response(
        JSON.stringify({ message: 'Email service not configured', skipped: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Eugenia Portfolio <noreply@eugenia-portfolio.com>', // Change this to your verified domain
        to: [to],
        subject: `${senderName} vous a envoyé un message`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background: #f9fafb;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background: #667eea;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  margin-top: 20px;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  color: #6b7280;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Nouveau message sur Eugenia Portfolio</h1>
              </div>
              <div class="content">
                <p>Bonjour,</p>
                <p><strong>${senderName}</strong>${senderUsername ? ` (@${senderUsername})` : ''} vous a envoyé un message sur Eugenia Portfolio.</p>
                <p>Connectez-vous pour voir et répondre à ce message.</p>
                <div style="text-align: center;">
                  <a href="${Deno.env.get('APP_URL') || 'https://your-app-url.com'}/messages?conversation=${conversationId}" class="button">
                    Voir le message
                  </a>
                </div>
              </div>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement par Eugenia Portfolio.</p>
                <p>Si vous ne souhaitez plus recevoir ces notifications, vous pouvez modifier vos paramètres dans votre profil.</p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Resend API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const emailData = await emailResponse.json()
    
    return new Response(
      JSON.stringify({ message: 'Email sent successfully', emailId: emailData.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-conversation-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
