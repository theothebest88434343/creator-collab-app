import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await req.json()
    const { projectId, email } = body

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const inviterName = user.user_metadata?.full_name || 'Someone'
    const inviterId = user.id

    const { data: isMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', inviterId)
      .single()

    if (memberError || !isMember) {
      return NextResponse.json({ error: 'Not allowed to invite' }, { status: 403 })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    const { data: invite, error: inviteError } = await supabase
      .from('project_invites')
      .insert({ project_id: projectId, email, invited_by: inviterId, accepted: false })
      .select('token')
      .single()

    if (inviteError) {
      return NextResponse.json({ error: 'Could not create invite.' }, { status: 400 })
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `You've been invited to ${project?.name}`,
        text: `${inviterName} has invited you to join ${project?.name}. Click here to accept: ${inviteLink}`,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      return NextResponse.json({ error: errorData.message || 'Failed to send invite email.' }, { status: 500 })
    }

    // Notify invitee if they have an account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      await supabase.from('notifications').insert({
        user_id: existingUser.id,
        type: 'project_added',
        message: `${inviterName} added you to ${project?.name}`,
        project_id: projectId,
      })
    }

    // Log activity
    await supabase.from('activity').insert({
      project_id: projectId,
      user_id: inviterId,
      type: 'member_added',
      message: `${inviterName} invited ${email} to the project`,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}