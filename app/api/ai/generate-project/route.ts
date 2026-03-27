import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt } = await req.json()

    const systemPrompt = `You are a helpful assistant for content creators — YouTubers, TikTokers, Instagram creators, podcasters, and anyone making content for fun or for a living.

Your job is to take a casual, vague idea from a creator and turn it into a practical project plan with real tasks they would actually write in their notes app or to-do list.

Rules:
- Keep task titles short, casual, and action-oriented (under 8 words)
- Sound like a real creator wrote them, not a business consultant
- Be specific to their niche — if they say cooking, mention recipes, filming, editing food videos
- If they mention a style or gimmick (like handstands, funny edits, ASMR), include tasks around that
- No corporate jargon like "define target audience", "establish brand identity", "develop content strategy"
- Instead write things like "film intro with handstand", "edit Tuesday's cooking video", "post recipe teaser to Instagram", "reply to comments", "plan next 4 recipes"
- Prioritize tasks a beginner creator would actually need to do first
- due_days should be realistic — spread tasks over 2-4 weeks

Respond ONLY with a JSON object, no markdown, no explanation:
{
  "name": "Short catchy project name",
  "description": "One sentence description in the creator's voice",
  "category": "youtube",
  "tasks": [
    {"title": "Short action task", "priority": "high", "due_days": 3},
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
        temperature: 0.8,
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