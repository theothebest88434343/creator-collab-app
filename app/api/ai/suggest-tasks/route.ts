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

Suggest 6 tasks to get this project started. For each task provide a title, priority (low/medium/high), and suggested due date (as days from today.

Respond ONLY with a JSON array, no markdown, no explanation:
[{"title": "...", "priority": "high", "due_days": 7}]`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    )

    const data = await response.json()

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini response:', JSON.stringify(data))
      return NextResponse.json({ error: 'No response from AI. Check your API key.' }, { status: 500 })
    }

    const text = data.candidates[0].content.parts[0].text.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const tasks = JSON.parse(clean)

    return NextResponse.json({ tasks })
  } catch (err: any) {
    console.error('AI suggest error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}