<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Chat SDK</h1>
</a>

<p align="center">
    Chat SDK is a free, open-source template built with Next.js and the AI SDK that helps you quickly build powerful chatbot applications.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering
    and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with
    LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports xAI (default), OpenAI, Fireworks, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility
    and flexibility
- Data Persistence
  - Supabase Postgres for saving chat history and user data
  - Supabase Storage for efficient file storage (attachments bucket)
- Authentication
  - Supabase Auth with magic-link sign-in

## Model Providers

This template uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
to access multiple AI models through a unified interface. The default
configuration includes [xAI](https://x.ai) models (`grok-2-vision-1212`,
`grok-3-mini`) routed through the gateway.

### AI Gateway Authentication

**For Vercel deployments**: Authentication is handled automatically via OIDC
tokens.

**For non-Vercel deployments**: You need to provide an AI Gateway API key by
setting the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can also switch to
direct LLM providers like [OpenAI](https://openai.com),
[Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and
[many more](https://ai-sdk.dev/providers/ai-sdk-providers) with just a few lines
of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel:

- Create a Supabase project and set up an `attachments` bucket (public for now)
- Add the environment variables listed below to Vercel Project Settings
- Deploy via Vercel as usual

## Running locally

You will need the following environment variables. It's recommended you use
[Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
for this, but a `.env.local` file is all that is necessary for local dev.

```
# Supabase Database (Postgres)
POSTGRES_URL=postgresql://<user>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://<user>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require

# Supabase Project
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SECRET_KEY=<your-service-role-key>
SUPABASE_STORAGE_BUCKET=attachments

# Client-side Supabase (Auth)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=https://axis-kappa-bice.vercel.app
```

> Note: You should not commit your `.env` file or it will expose secrets that
> will allow others to control access to your various AI and authentication
> provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel`
   directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on
[localhost:3000](http://localhost:3000).
