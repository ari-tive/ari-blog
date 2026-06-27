# Design — aritive portfolio

A reference for the visual language, structure, and conventions of the
**aritive** personal portfolio. New work should match what's described here, not
contradict it.

---

## 1. Product at a glance

A single-creator portfolio for **aritive**, a web developer. The site has four
jobs:

1. **Introduce** the person (hero + about).
2. **Show** personal and commissioned work (Projects page, data-driven from Firestore).
3. **Capture leads** (contact form → Discord webhook, plus copy-to-clipboard contact links).
4. **Stay legal** (Privacy, Terms, Third-Party Assets pages) and let the owner manage content (`/admin`, auth-gated).

It is a **client-only SPA** — no server of our own. Firestore is the data store,
Firebase Auth gates the admin, and a Discord webhook receives contact messages.

### Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build / dev | Vite 6 |
| Routing | react-router-dom 7 (`BrowserRouter`) |
| Styling | Tailwind CSS 3 + `tailwindcss-animate`, CSS custom-property tokens |
| UI primitives | shadcn/ui (Radix-powered), `lucide-react` icons |
| Backend | Firebase — Firestore (projects) + Auth (admin) |
| Contact delivery | Discord webhook (`VITE_DISCORD_WEBHOOK_URL`) |

---

## 2. Design language

The whole site is built around one idea: **a dark, cinematic canvas where the
only ornament is glass.** No gradients-as-decoration, no colored accents, no
light mode. Visual interest comes from three things only:

- **A background video** in the hero (depth without UI).
- **Liquid-glass surfaces** everywhere else (navbar, buttons, cards, form, modal).
- **Cursor proximity glow** — every glass outline brightens as the cursor
  approaches. This is the signature interaction; do not remove or replace it.

The feeling we're after: minimal, premium, calm, and quietly responsive to the
cursor. Restraint is the aesthetic.

### Principles

- **One palette, forever.** Fixed dark navy. There is no theming system and no
  light mode — and that's intentional. Don't add one.
- **One glass class.** `.liquid-glass` is the *only* glass surface. Never create
  `.glass-2`, `.glass-card`, etc. Compose with Tailwind utilities around it.
- **Type does the heavy lifting.** The Instrument Serif display face carries
  personality; everything else is plain Inter and stays quiet.
- **Motion is gentle and one-shot.** A single `fade-rise` reveal, a few
  `hover:scale` nudges, the proximity glow. No looping animations, no parallax.
- **Hide the scrollbar.** Scrolling works; the chrome is invisible.

---

## 3. Design tokens

All tokens live in `src/index.css` as HSL triplets and are surfaced to Tailwind
via `hsl(var(--token))` in `tailwind.config.ts`.

### Color (single fixed dark palette)

| Token | HSL | Swatch | Used for |
|---|---|---|---|
| `--background` | `201 100% 13%` | deep navy | page canvas |
| `--foreground` | `0 0% 100%` | white | primary text, borders, glass outlines |
| `--muted-foreground` | `240 4% 66%` | cool gray | secondary text, labels, "View Project →" |
| `--primary` / `-foreground` | `0 0% 100%` / `0 0% 4%` | white / near-black | default button |
| `--secondary`, `--muted`, `--accent` | `0 0% 10%` | near-black | subtle fills (rarely used) |
| `--border`, `--input` | `0 0% 18%` | dark gray | hairline borders, inputs |

> The palette is **achromatic** (only the navy background has hue). The only
> "color" on the entire site is the hero video and any project images.

### Typography

Two families, imported in `index.css`:

- **Display** — `Instrument Serif` (`--font-display`): headings, the "aritive"
  wordmark, project titles, legal H1/H2. Applied via
  `style={{ fontFamily: "'Instrument Serif', serif" }}`.
- **Body** — `Inter` (`--font-body`): everything else, 400/500 only.

There is no formal type scale; sizes are set per-element with Tailwind. Rough
conventions:

| Role | Classes |
|---|---|
| Hero H1 | `text-5xl sm:text-7xl md:text-8xl`, `tracking-[-2.46px]`, `leading-[0.95]` |
| Section H2 | `text-4xl sm:text-5xl md:text-6xl`, `tracking-tight`, `leading-tight` |
| Page H1 (Projects/Legal) | `text-5xl sm:text-6xl`, `tracking-tight` |
| Body | `text-base sm:text-lg`, `leading-relaxed` |
| Labels / small | `text-sm` |

### Spacing & layout

- Max content width: `max-w-7xl` (~1280px). Legal pages use `max-w-3xl` for
  readability.
- Section rhythm: `px-8 py-32` for content sections; legal/projects pages use
  `pt-40` to clear the floating navbar.
- Hero is `min-h-[100svh]` with `pt-32 pb-40`.
- Grid: Projects uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with `gap-6`.

---

## 4. The glass system

This is the heart of the design. Two pieces, both global.

### `.liquid-glass` (in `index.css`)

The reusable frosted surface. Composed of:

- A near-transparent white fill (`rgba(255,255,255,0.01)`) + `backdrop-filter: blur(4px)`.
- A `1.4px` **two-layer border** drawn with `padding` + `mask-composite` trickery:
  - `::before` — a vertical white gradient (brighter top/bottom, faint middle).
  - `::after` — a uniform bright border that only appears near the cursor.
- An inset highlight + an outer halo `box-shadow` whose size/opacity scale with
  `--glow`.
- `transition: box-shadow/opacity 0.25s ease-out`.

**Rule:** reuse `.liquid-glass`; never fork it. Tailwind utilities go *around*
it (size, radius, padding, layout), not inside it.

### Proximity glow (`useProximityGlow` in `src/hooks/`)

Mounted once at the top of `App`. A single `pointermove` listener computes, for
every `.liquid-glass` element, the distance from the cursor to its nearest edge
and writes a `--glow` custom property in `[0, 1]` (0 = far, 1 = touching).
Throttled to one update per animation frame. `RADIUS = 180px`.

- It's **global and selector-based**, so anything you give `.liquid-glass`
  automatically glows — no per-component wiring.
- It must stay mounted once, high in the tree.

---

## 5. Motion & interaction

| Effect | Where | How |
|---|---|---|
| `fade-rise` | load + scroll reveals | `@keyframes fade-rise` (opacity 0→1, translateY 24px→0, 0.8s). Variants: `.animate-fade-rise`, `-delay` (+0.2s), `-delay-2` (+0.4s). |
| Scroll-triggered reveal | About, Contact, legal pages | `useInView` (IntersectionObserver, fires once) gates the class. |
| Staggered card entrance | Projects grid | per-card `animationDelay: index * 0.1s`. |
| Proximity glow | every glass surface | see §4. |
| Click sparks | whole app | `ClickSpark` canvas wrapper at the app root (`z-9999`, pointer-events-none), draws radial line bursts on click. |
| Hover scale | buttons, cards, tabs, contact links | `hover:scale-[1.02]` / `[1.03]`. |
| Hamburger→✕ morph | navbar toggle | absolutely-positioned bars rotated via Tailwind transitions. |
| Modal open/close | project detail | Radix Dialog with `zoom-in-95` / `fade-in-0` (tailwindcss-animate). |

**Smooth scrolling:** in-page anchor navigation (Home, Contact from navbar &
footer) uses `scrollIntoView({ behavior: 'smooth' })`, with a retry loop when
navigating from another route so the target section has time to mount.
Route changes always `window.scrollTo(0,0)` via `ScrollToTop`.

---

## 6. Layout & navigation

### Floating draggable navbar

Not a top bar. The navbar is a **single floating glass card** (`.liquid-glass`,
`fixed`, `z-50`) that:

- Rests at top-left (`24,24`), **draggable anywhere** (pointer events, clamped
  to viewport). Position resets on refresh (never persisted).
- Collapsed = a 48×48 hamburger square. Click → the card expands (`w-12`→`w-56`
  via `transition-[width]`, content revealed via a `grid-rows-[0fr]→[1fr]` trick)
  to show the "aritive" wordmark + nav links.
- Tracks the active home-page section (home / contact) via scroll position.
- Is **auth-aware**: while auth resolves, a placeholder holds space; shows
  `Admin` + `Sign Out` when logged in, `Login` otherwise.

This is intentionally unconventional — treat it as a fixed design decision.

### Page shells

Every page is `min-h-screen bg-background text-foreground` with `<Navbar />`,
a `<main>`, and `<Footer />`. Sections inside `<main>` carry `relative z-10` so
they stack above the hero video and below the click-spark canvas.

### Footer

A standard bottom bar (`border-t`) with three columns — Quick Links, Contact
(mirrors `CONTACT_LINKS`), Legal — plus the wordmark and a copyright line.
Navigation helpers are duplicated from the navbar (home/contact smooth-scroll)
so footer and navbar never drift.

---

## 7. Routing (`src/App.tsx`)

```
/                      Home      (Hero, About, ContactSection)
/projects              Projects  (tabs + grid + detail dialog)
/privacy               Privacy   (LegalPage)
/terms                 Terms     (LegalPage)
/third-party-assets    3rd-party (LegalPage)
/login                 Login
/admin                 Admin     ← wrapped in <ProtectedRoute>
```

Providers/wrappers around `<BrowserRouter>`: `AuthProvider` → `ClickSpark`.
`ScrollToTop` sits inside the router.

---

## 8. Components inventory

### Feature components (`src/components/`)
- **Navbar** — floating draggable glass menu (see §6).
- **Hero** — full-bleed background `<video>` + headline + CTA. Autoplay guarded
  with an explicit `play()` + first-interaction fallback.
- **About** — two-column: bio text + profile photo in a glass frame.
- **ContactSection** — left: contact info as glass cards (Discord copies to
  clipboard); right: contact form in a glass container. 5-hour submission
  cooldown via localStorage; posts to Discord webhook.
- **ProjectTabs** — pill tabs (Personal / Commissioned) with count badges.
- **ProjectCard** — glass tile: thumbnail (image or color block), title,
  description, up to 2 tags, "View Project →". Opens the detail dialog.
- **ProjectDetailDialog** — glass modal: image slider (prev/next + dots),
  full description, all tags, optional external link button.
- **ProjectForm** — admin create/edit form (used on `/admin`).
- **LegalPage** + **LegalHeading** — shared prose shell for the three legal pages.
- **ProtectedRoute** — redirects to `/login` when no authed user.
- **Footer** — see §6.
- **ClickSpark** — full-screen canvas click effect.

### UI primitives (`src/components/ui/`)
shadcn-style, Radix-based: `button`, `dialog`, `input`, `textarea`, `sheet`.
- **Button** uses `cva` with variants `{ default, outline, ghost, glass, link }`
  and sizes `{ default, sm, lg, pill, icon }`. The **`glass` + `pill`**
  combination is the signature CTA (hero, contact, dialog).

### Hooks (`src/hooks/`)
`useInView`, `useProximityGlow`, `useProjects` (per-category Firestore fetch),
`useAllProjects` (all categories).

### Lib (`src/lib/`)
`firebase.ts` (app + `db` + `auth`), `contactLinks.tsx` (single source of truth
for contact details + `DiscordIcon`), `utils.ts` (`cn` = clsx + tailwind-merge).

### Context (`src/context/`)
`AuthContext` — exposes `{ user, loading }` from Firebase Auth.

---

## 9. Data model

**Firestore collection `projects`** (`useProjects.ts`):

```ts
interface Project {
  id: string                  // Firestore doc id
  title: string
  description: string
  category: 'personal' | 'commissioned'
  tags: string[]
  link: string
  thumbnailColor: string      // hex fallback when no image
  thumbnail?: string          // optional thumbnail URL (overrides color)
  images?: string[]           // optional gallery for the detail modal
}
```

Fetch fails gracefully to `[]` (shows the empty state) — important because the
Firebase config may be a placeholder during early development.

**Contact submissions** don't persist anywhere on our side; they're POSTed as a
formatted message to the Discord webhook and rate-limited client-side.

---

## 10. Conventions to preserve

When extending the site, keep these in mind:

1. **Don't add theming / light mode.** The palette is fixed by design.
2. **Use `.liquid-glass` for every glass surface** — don't invent variants. The
   proximity glow relies on that single class name.
3. **Keep `useProximityGlow` mounted once** at the app root.
4. **Display type via inline `style`**, not a Tailwind class — that's the
   established pattern (`const displayFont = { fontFamily: ... }`).
5. **New sections get `relative z-10`** so they layer correctly above the hero
   video and below the spark canvas.
6. **Contact details must come from `CONTACT_LINKS`** so the contact section and
   footer never diverge.
7. **No visible scrollbar** — already hidden globally; don't re-enable it.
8. **Secrets via Vite env** (`VITE_DISCORD_WEBHOOK_URL`); Firebase keys are
   currently hard-coded in `firebase.ts` — fine for this project, but prefer env
   for anything new.
9. **Fail gracefully.** Firestore errors → empty state, not a crash. Autoplay
   blocked → resume on first interaction.
10. **One-shot, gentle motion only.** Match the existing `fade-rise` /
    `hover:scale` vocabulary rather than introducing new animation systems.

---

## 11. File map

```
index.html                     entry, title, favicon
src/
  main.tsx                     root render, scroll-restoration = manual
  App.tsx                      providers, routes, ClickSpark, proximity glow
  index.css                    tokens, .liquid-glass, fade-rise, scrollbar hide
  context/AuthContext.tsx      Firebase auth state
  hooks/                       useInView, useProximityGlow, useProjects,
                               useAllProjects
  lib/                         firebase.ts, contactLinks.tsx, utils.ts (cn)
  components/                  Navbar, Hero, About, ContactSection, Footer,
                               ProjectTabs, ProjectCard, ProjectDetailDialog,
                               ProjectForm, LegalPage, ProtectedRoute,
                               ClickSpark
  components/ui/               shadcn primitives (button, dialog, input,
                               textarea, sheet)
  pages/                       Home, Projects, Login, Admin, Privacy, Terms,
                               ThirdPartyAssets
tailwind.config.ts             token → utility mapping
components.json                shadcn config (neutral base, cssVariables)
```
