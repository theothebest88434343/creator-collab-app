import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt } = await req.json()

    const systemPrompt = `You are a project management assistant for creative and content teams (YouTubers, podcasters, social media creators, designers, marketers).

Given a user's idea or goal, generate a complete project plan including:
- A clear project name
- A concise description
- A category (one of: youtube, podcast, social_media, design, marketing, other)
- 6-8 actionable starter tasks with priorities and due dates

Respond ONLY with a JSON object, no markdown, no explanation:
{
  "name": "Project name",
  "description": "Brief project description",
  "category": "youtube",
  "tasks": [
    {"title": "Task title", "priority": "high", "due_days": 7},
    ...
  ]
}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 })
    }

    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const project = JSON.parse(clean)

    return NextResponse.json({ project })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}