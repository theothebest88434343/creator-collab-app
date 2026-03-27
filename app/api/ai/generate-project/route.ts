import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, postingFrequency, teamSize } = await req.json()

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
Posting frequency: ${postingFrequency || 'not specified'}
Team size: ${teamSize || 'solo'}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
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
    const project = JSON.parse(clean)

    return NextResponse.json({ project })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}