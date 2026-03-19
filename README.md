# Collab

A lightweight collaboration tool for small creative teams. Built with Next.js, Supabase, and TailwindCSS.

## Live App

https://creator-collab-app.vercel.app

## Features

- **Authentication** — Sign up, log in, and log out securely
- **Projects** — Create and manage projects for your team
- **Tasks** — Kanban-style task board with To Do, In Progress, and Done columns
- **Files** — Upload and download files within projects
- **Collaborators** — Invite team members to projects by email

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Auth, Database, Storage)
- [Vercel](https://vercel.com) (Deployment)

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

Create a `.env.local` file in the root and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deployed on Vercel. Every push to `main` triggers an automatic redeployment.