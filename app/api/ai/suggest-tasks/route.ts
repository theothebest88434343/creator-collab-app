import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectName, projectDescription, existingTasks, focus } = await req.json()

    const systemPrompt = `You are a helpful assistant for content creators — YouTubers, TikTokers, Instagram creators, podcasters, and anyone making content for fun or for a living.

Your job is to suggest practical, human and action-oriented tasks that a real creator would actually write in their to-do list.

Rules:
- Keep task titles short, casual, and action-oriented (under 8 words)
- Sound like a real creator wrote them, not a business consultant
- Be specific to their niche — if they do cooking, mention recipes, filming, editing food videos
- No corporate jargon like "define target audience" or "develop brand identity"
- Instead write things like "film intro video", "edit Tuesday's video", "reply to comments", "plan next 4 recipes"
- due_days should be realistic — spread tasks over 2-4 weeks

Here is an example of good output:
Input: cooking videos on YouTube, posting once a week, solo
Output: [
  {"title": "Pick this week's recipe", "priority": "high", "due_days": 1},
  {"title": "Buy ingredients", "priority": "high", "due_days": 2},
  {"title": "Film the cooking process", "priority": "high", "due_days": 3},
  {"title": "Edit the video", "priority": "high", "due_days": 5},
  {"title": "Design thumbnail", "priority": "medium", "due_days": 6}
]

Respond ONLY with a JSON array, no markdown, no explanation:
[{"title": "...", "priority": "high", "due_days": 7}]`

    const userMessage = existingTasks?.length
  ? `Project: ${projectName}
Description: ${projectDescription || 'No description'}
${focus ? `Focus area: ${focus}` : ''}

Existing tasks:
${existingTasks.map((t: string) => `- ${t}`).join('\n')}

Suggest 5 additional tasks that would help move this project forward. Don't repeat existing tasks.`
  : `Project: ${projectName}
Description: ${projectDescription || 'No description'}
${focus ? `Focus area: ${focus}` : ''}

Suggest 6 tasks to get this project started.`

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
        max_tokens: 1000,
      }),
    })

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      console.error('Groq response:', JSON.stringify(data))
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 })
    }

    const text = data.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const tasks = JSON.parse(clean)

    return NextResponse.json({ tasks })
  } catch (err: any) {
    console.error('AI suggest error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}