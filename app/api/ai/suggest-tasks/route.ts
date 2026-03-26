import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectName, projectDescription, existingTasks } = await req.json()

    const prompt = existingTasks?.length
      ? `You are a project management assistant. Given this project:
Name: ${projectName}
Description: ${projectDescription || 'No description'}

And these existing tasks:
${existingTasks.map((t: string) => `- ${t}`).join('\n')}

Suggest 5 additional tasks that would help complete this project. For each task provide a title, priority (low/medium/high), and suggested due date (as days from today, e.g. 7 for one week).

Respond ONLY with a JSON array, no markdown, no explanation:
[{"title": "...", "priority": "high", "due_days": 7}]`
      : `You are a project management assistant. Given this project:
Name: ${projectName}
Description: ${projectDescription || 'No description'}

Suggest 6 tasks to get this project started. For each task provide a title, priority (low/medium/high), and suggested due date (as days from today).

Respond ONLY with a JSON array, no markdown, no explanation:
[{"title": "...", "priority": "high", "due_days": 7}]`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
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