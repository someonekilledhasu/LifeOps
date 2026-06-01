# LifeOps

**The AI that handles the annoying decisions you make every day.**

LifeOps is an open everyday life admin workspace. It gives visitors one calm place for food decisions, spending analysis, difficult message drafting, and an Adulting Score that turns small actions into useful patterns.

## Features

- Zero-friction guest workspace with no login wall
- Food decider with budget, diet, cuisine, mood, time, plan, health preference, AI suggestions, fallback suggestions, and history
- Money analyzer with CSV import, merchant categorization, manual expense CRUD, search, date filters, category filters, CSV export, analytics charts, and practical insights
- Message generator with situation, tone, recipient, context, editable variants, copy, regenerate, save, text download, and history
- Adulting Score engine with budget awareness, tracking consistency, spending spread, food variety, and activity breakdowns
- Settings for profile, monthly budget, currency, food preferences, and dark mode
- OpenAI or Gemini integration with server-only secrets and deterministic fallbacks
- Responsive baby-pink and coquette night themes with loading states, empty states, confirmation prompts, and toast feedback

## Tech Stack

- Next.js 15 App Router and TypeScript
- Tailwind CSS with reusable shadcn-style UI primitives
- Prisma ORM and PostgreSQL-ready schema
- OpenAI or Gemini REST APIs
- Zod and React Hook Form
- Recharts, Lucide React, Framer Motion, Sonner, and next-themes

## Screenshots

The app includes a polished marketing page and a complete guest workspace. Run the project and choose **Open workspace** on the home page to inspect:

- Dashboard score, activity cards, weekly spend graph, and AI insights
- Food decider form and suggestion cards
- Money analytics, CSV upload, filters, CRUD dialog, and charts
- Message drafting workspace and saved history
- Profile and preference settings

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifeops?schema=public"
OPENAI_API_KEY=""
GEMINI_API_KEY=""
```

Use either `OPENAI_API_KEY` or `GEMINI_API_KEY`. The app keeps working with curated fallback output when neither provider is configured or a provider request fails. Secrets are only read inside server modules.

### 3. Create the database schema

```bash
npm run db:generate
npm run db:push
```

For migration-based development:

```bash
npm run db:migrate -- --name init
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the guest workspace directly.

## CSV Import

Use `sample-statement.csv` to try the importer. It accepts CSV files up to 2 MB and recognizes common statement columns:

- Date: `date`, `transaction date`, `txn date`, or `value date`
- Merchant: `merchant`, `description`, `narration`, `details`, `payee`, or `name`
- Amount: `amount`, `debit`, `withdrawal`, or `value`

Imports are capped at 500 transactions per file.

## Production Deployment

1. Create a PostgreSQL database with Neon, Supabase, Railway, Render, or another provider.
2. Add the environment variables from `.env.example` to the Vercel project.
3. Run `npx prisma db push` if you are extending the guest workspace with persistence.
4. Deploy the repository to Vercel.

The build command is:

```bash
npm run build
```

It generates the Prisma client before running the Next.js production build.

## Folder Structure

```text
prisma/
  schema.prisma              Database models and relations
src/
  app/
    (workspace)/             Open product pages
    api/                     Product route handlers
  components/                Product views and reusable UI
  lib/                       Workspace, Prisma, AI, analytics, score, and validation
```

## API Routes

| Route | Methods | Purpose |
| --- | --- | --- |
| `/api/food/suggestions` | `POST` | Generate and save food suggestions |
| `/api/expenses` | `GET`, `POST` | List and create expenses |
| `/api/expenses/[id]` | `PATCH`, `DELETE` | Update or delete an expense |
| `/api/expenses/upload` | `POST` | Parse and import a CSV statement |
| `/api/insights/spending` | `GET` | Return spending analytics |
| `/api/reports/expenses` | `GET` | Export an expense report |
| `/api/messages/generate` | `POST` | Generate message variants |
| `/api/messages` | `GET`, `POST` | List and save messages |
| `/api/score` | `GET` | Calculate and snapshot the Adulting Score |
| `/api/settings` | `GET`, `PUT` | Read and update settings |

Product APIs validate external input where applicable and return structured error responses.

## Future Improvements

- Optional accounts and database persistence for personal workspaces
- Background AI enrichment for large CSV imports
- Configurable budgets per category
- Multi-currency conversion
- Notification preferences and weekly review emails
- Automated browser coverage for the primary user journeys

## License

MIT
