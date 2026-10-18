# Turndown

Turndown is the front desk for independent hotels and B&Bs. Guests ask a widget on your site. Answers come only from that property's house book. When the book doesn't cover it — or the guest needs a late checkout, towels, or a repair — the desk opens a request for staff.

The logged-in app is the product: house setup, house book, inbox, requests, and a questions dashboard. The marketing page is short on purpose.

## Features

- Clerk sign-in and sign-up, with a split-screen layout. In development, Clerk keyless mode can provision temporary keys. If no keys are set, a labeled demo desk opens The Linden House without pretending to be a real account.
- House setup: name, rooms, amenities, check-in and check-out, policies, and local recommendations.
- House book editor for notes the profile doesn't cover. Profile notes are rewritten from setup. Custom notes are yours.
- Public guest widget at `/w/[slug]`, embeddable in an iframe. Scoped to one property, rate limited, and refused when the answer isn't in that house book.
- Requests for late checkout, towels, maintenance, and anything else, with a status you can move.
- Inbox for the conversation, including a staff reply that is stored and not sent through the model.
- Questions dashboard: top questions, resolution rate, and requests by type, counted from stored rows.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, lucide, framer-motion, Clerk, Drizzle ORM, Postgres, Zod, and Claude via `ANTHROPIC_API_KEY`.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `DATABASE_URL`, the app serves **The Linden House B&B** from memory and labels it Demo data. Changes last for the life of the server process.

With Clerk keys, sign in at `/sign-in`. Without them, the sign-in page offers the demo desk. In development you can also run `npx clerk@latest init` to write temporary Clerk keys.

### Database

```bash
# set DATABASE_URL first
npm run db:migrate
SEED_OWNER_ID=your_clerk_user_id npm run db:seed
```

`db:seed` inserts The Linden House. Set `SEED_OWNER_ID` to your Clerk user id if you want that house on your account. Otherwise it is owned by `demo`, and a signed-in user can load a copy from the empty desk.

## Environment

Names live in `.env.example`. Nothing is required for a local demo.

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon or Supabase). Omit it to use the in-memory demo. |
| `ANTHROPIC_API_KEY` | Server-side Claude calls. Omit it and the widget returns a labeled sample answer matched from the house book. |
| `AI_MODEL` | Model id. Defaults to `claude-sonnet-4-5`. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate limit. Omit them and the limit is an in-memory token bucket. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk. Omit them for keyless dev or the demo desk. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional. The app already points Clerk at `/sign-in` and `/sign-up`. |
| `NEXT_PUBLIC_APP_URL` | Public origin used in embed snippets and metadata. |
| `SEED_OWNER_ID` | Clerk user id for `npm run db:seed`. |
| `DEMO_SCREENSHOT` | Set to `1` only while capturing portfolio screenshots. Enables `/demo`, which rewrites to the desk with no session. Do not set this in production. |

## Scripts

- `npm run dev` / `build` / `start`
- `npm run lint`
- `npm run typecheck`
- `npm test` — house-book answering (no model call)
- `npm run db:generate` / `db:migrate` / `db:seed`
- `npm run screenshot` — Playwright shots of `/demo` and `/`. The server must already be running with `DEMO_SCREENSHOT=1`.

## What is real

- Auth is Clerk when keys are present.
- Guest answers call Claude on the server when `ANTHROPIC_API_KEY` is set. Output is validated. A reply is kept only when it cites an entry from that property's house book. Otherwise the guest is told the desk will follow up, and a request is opened.
- Without an API key, replies are labeled sample answers and are chosen from the same house book. They do not invent a pool, a password, or a town recommendation.
- Rate limits use Upstash when configured, otherwise an in-memory token bucket.
- Charts are counted from conversations and tickets in the store.

The old unauthenticated `/api/concierge` route is gone.
