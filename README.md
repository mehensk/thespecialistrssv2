# The Specialist Realty

A luxury real estate website built with Next.js 16, TypeScript, and Tailwind CSS.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Geist Sans** - Primary font (body & navigation)
- **Sora** - Brand font (logo)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with fonts and navbar
│   ├── page.tsx         # Homepage
│   ├── globals.css      # Global styles and CSS variables
│   └── lib/
│       └── fonts.ts     # Font configurations
└── components/
    └── ui/
        └── navbar.tsx   # Navigation component
```

## Theme

- **Background**: White (#FFFFFF)
- **Primary Text**: Luxury Charcoal (#111111)
- **CTA Button**: Dark Slate (#1F2937)
- **CTA Hover**: Slightly Darker Slate (#1A232E)
- **Border**: Ultra-light Gray (#E5E7EB)

## Build

```bash
npm run build
npm start
```
