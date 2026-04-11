# Collab.

AI-powered project management for content creators and small teams. Built with Next.js, Supabase, Groq AI, and TailwindCSS.

## Live App
https://creator-collab-app.vercel.app

---

## What is Collab?

Collab helps content creators (YouTubers, podcasters, short-form creators) and small teams manage projects, track tasks, and stay in sync — with AI that actually understands your workflow.

Instead of generic business tools, Collab is built for creators. Type something like "cooking videos with a fun twist" and AI generates a full project plan with real tasks like "film this week's recipe", "edit Monday's video", and "design thumbnail" — not corporate jargon.

---

## Features

- **AI Project Generator** — describe your idea casually and AI creates a full project with tasks, priorities, and due dates tailored to your niche
- **AI Task Suggestions** — get smart task suggestions inside any existing project
- **Kanban Board** — drag and drop tasks between To Do, In Progress, and Done
- **Real-time Comments** — comment on tasks with your team in real time using Supabase Realtime
- **Team Collaboration** — invite members by email, assign tasks, see who's currently viewing a project
- **Notifications** — get notified when assigned a task, added to a project, or when task statuses change
- **File Management** — upload, preview, and share files directly inside projects
- **Dashboard** — see all your tasks, overdue items, unassigned work, and activity feed across all projects
- **Global Search** — search tasks and projects instantly with Cmd+K
- **Mobile Responsive** — works on all screen sizes with a collapsible sidebar
- **Onboarding Flow** — guided setup for new users

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI:** Groq API (Llama 3.3 70B)
- **Email:** Resend
- **Deployment:** Vercel

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/theothebest88434343/creator-collab-app.git
cd creator-collab-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=your_groq_key
RESEND_API_KEY=your_resend_key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeployment.

---

## Built by

Theo Steinstrasser