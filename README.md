# Vernacular Grievance Redressal Chatbot

An AI-assisted regional-language grievance classification and auto-ticket-drafting system for citizen portal integration (MeitY Problem Statement).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL with `@supabase/supabase-js`)

## Database Schema Overview

The database consists of 4 core tables:
1. `categories`: Pre-defined government departments (Water Supply, Electricity, Sanitation, Roads/PWD, Police, Revenue).
2. `grievances`: Raw citizen complaints submitted in vernacular regional languages.
3. `tickets`: Auto-drafted tickets containing structured summaries, department classification, confidence score, and matched keywords.
4. `confirmations`: Citizen confirmation and field edit audit trail.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and add your Supabase project credentials:

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

### 3. Database Migrations & Seeding

Apply the initial schema migration and seed data in your Supabase SQL Editor or CLI:

1. Run `supabase/migrations/0001_init.sql` to create tables.
2. Run `supabase/seed.sql` to seed initial department categories.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.
