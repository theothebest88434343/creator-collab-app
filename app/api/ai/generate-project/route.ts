import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = checkRateLimit(user.id)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait an hour before trying again.' }, { status: 429 })
    }

    const body = await req.json()
    const { prompt, postingFrequency, teamSize, category } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'prompt is required.' }, { status: 400 })
    }
    if (prompt.length > 1000) {
      return NextResponse.json({ error: 'prompt is too long (max 1000 characters).' }, { status: 400 })
    }

    const systemPrompt = `You are a helpful assistant for content creators — YouTubers, TikTokers, Instagram creators, podcasters, and anyone making content for fun or for a living.

Your job is to take a casual idea from a creator and turn it into a practical project plan with real tasks they would actually write in their notes app.

Rules:
- Keep task titles short, casual, and action-oriented (under 8 words)
- Sound like a real creator wrote them, not a business consultant
- Be specific to their niche and posting frequency
- If they mention a style or gimmick, include tasks around that
- No corporate jargon whatsoever
- Spread tasks realistically based on posting frequency
- due_days should be realistic — spread over 2-4 weeks

Here are two examples of good outputs:

Input: "cooking videos on YouTube, posting once a week, solo"
Output:
{
  "name": "Weekly Cooking YouTube",
  "description": "Solo cooking channel dropping one video every week",
  "category": "youtube",
  "tasks": [
    {"title": "Pick this week's recipe", "priority": "high", "due_days": 1},
    {"title": "Buy ingredients", "priority": "high", "due_days": 2},
    {"title": "Film the cooking process", "priority": "high", "due_days": 3},
    {"title": "Edit the video", "priority": "high", "due_days": 5},
    {"title": "Design thumbnail", "priority": "medium", "due_days": 6},
    {"title": "Write video description and tags", "priority": "medium", "due_days": 6},
    {"title": "Schedule upload for Sunday", "priority": "high", "due_days": 7},
    {"title": "Post behind the scenes to Instagram", "priority": "low", "due_days": 7}
  ]
}

Input: "travel vlogs in Japan, posting twice a week, team of 2"
Output:
{
  "name": "Japan Travel Vlogs",
  "description": "Two friends documenting their Japan trip twice a week",
  "category": "youtube",
  "tasks": [
    {"title": "Plan this week's filming spots", "priority": "high", "due_days": 1},
    {"title": "Film day 1 vlog footage", "priority": "high", "due_days": 2},
    {"title": "Edit Tuesday's vlog", "priority": "high", "due_days": 3},
    {"title": "Add subtitles and music", "priority": "medium", "due_days": 4},
    {"title": "Upload Tuesday's vlog", "priority": "high", "due_days": 4},
    {"title": "Film day 2 vlog footage", "priority": "high", "due_days": 5},
    {"title": "Edit Friday's vlog", "priority": "high", "due_days": 6},
    {"title": "Upload Friday's vlog", "priority": "high", "due_days": 7}
  ]
}

Respond ONLY with a JSON object, no markdown, no explanation.`

    const userMessage = `My idea: ${prompt}
Content type: ${category || 'not specified'}
Posting frequency: ${postingFrequency || 'not specified'}
Team size: ${teamSize || 'solo'}`

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
          { role: 'user', content: userMessage }
        ],
        temperature: 0.9,
        max_tokens: 1500,
      }),
    })

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 })
    }

    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()

    let project
    try {
      project = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'AI returned an invalid response. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
