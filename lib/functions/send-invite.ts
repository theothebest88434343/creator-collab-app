import { createClient } from '@/lib/supabase/client'

type InviteEmailBody = {
  to: string
  subject: string
  text: string
}

export async function sendInvite(body: InviteEmailBody) {
  const supabase = createClient()

  try {
    const { to, subject, text } = body

    // Supabase built-in email
    const { error } = await supabase.functions.invoke('email', {
      body: { to, subject, text },
    })

    if (error) throw error

    return { success: true }
  } catch (err: any) {
    console.error('Error sending invite email:', err.message)
    return { error: err.message }
  }
}