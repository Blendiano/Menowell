---
trigger: always_on
---

# Design System

Reference implementation in `Tokens/tokens.css`. All values reference CSS custom properties from that file.

---

## Brand Voice

**Tone:** Calm, Supportive, Trustworthy, Empowering

Write as a knowledgeable friend — warm, clear, never alarmist. Use "you" and "your". Frame positively. Avoid jargon. Never use clinical coldness or fear-based language.

---

## Color System

All color tokens in `Tokens/tokens.css` under `--sys-color-*`. No hardcoded hex values.

| Token | Usage |
|---|---|
| `--sys-color-primary` | Primary buttons, active links, key interactive elements |
| `--sys-color-on-primary` | Text / icons on primary backgrounds |
| `--sys-color-primary-container` | Badges, highlighted cards, soft emphasis backgrounds |
| `--sys-color-on-primary-container` | Text on primary-container backgrounds |
| `--sys-color-secondary` | Secondary buttons, less prominent interactive elements |
| `--sys-color-on-secondary` | Text on secondary backgrounds |
| `--sys-color-secondary-container` | Secondary emphasis backgrounds |
| `--sys-color-on-secondary-container` | Text on secondary-container backgrounds |
| `--sys-color-tertiary` | Accent elements, special highlights |
| `--sys-color-on-tertiary` | Text on tertiary backgrounds |
| `--sys-color-error` | Error messages, destructive actions, validation failures |
| `--sys-color-on-error` | Text on error backgrounds |
| `--sys-color-error-container` | Error notification backgrounds |
| `--sys-color-on-error-container` | Text on error-container |
| `--sys-color-surface` | Page background, card backgrounds |
| `--sys-color-on-surface` | Primary body text |
| `--sys-color-surface-variant` | Secondary surface (sidebars, navigation) |
| `--sys-color-on-surface-variant` | Secondary text, captions, labels |
| `--sys-color-surface-container` | Elevated surfaces (cards, dialogs) |
| `--sys-color-surface-container-lowest` | Highest-level elevation, modals |
| `--sys-color-surface-container-highest` | Lowest-level surface emphasis |
| `--sys-color-inverse-surface` | Dark surface for light-on-dark areas |
| `--sys-color-inverse-on-surface` | Text on inverse surface |
| `--sys-color-outline` | Borders, dividers, stroke lines |
| `--sys-color-outline-variant` | Subtle borders (disabled state borders) |
| `--sys-color-background` | Root page background |
| `--sys-color-on-background` | Body text on page background |
| `--sys-color-scrim` | Modal / dialog overlay backdrop |
| `--sys-color-shadow` | Box-shadow color |

**Dark mode:** Wrapped in `[data-theme="dark"]` selector with inverted luminance values (to be added to `tokens.css` when dark mode is implemented).

**Contrast requirements:** All text-on-background pairs must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text). Use `on-` variant tokens to ensure contrast.

---

## Typography

**Font family:** `"Plus Jakarta Sans"` (defined per size in tokens)

**Type scale (from `--sys-typography-*` tokens):**

| Token Level | Size | Line Height | Usage |
|---|---|---|---|
| `display-2xl` | 72px | 88px | Hero headings, marketing pages |
| `display-xl` | 60px | 72px | Page title (dashboard, features) |
| `display-lg` | 48px | 60px | Section headings |
| `display-md` | 36px | 44px | Sub-section headings |
| `display-sm` | 30px | 36px | Card titles, modal headings |
| `display-xs` | 24px | 32px | Group headings |
| `text-xl` | 20px | 30px | Intro paragraphs, lead text |
| `text-lg` | 18px | 28px | Body text (large screens emphasis) |
| `text-md` | 16px | 24px | Primary body text (default) |
| `text-sm` | 14px | 20px | Secondary body text, captions |
| `text-xs` | 12px | 18px | Labels, helper text, metadata |

**Weights per level:** `regular` (400), `medium` (500), `semibold` (600), `bold` (700)

**Heading hierarchy (default weights):**

| HTML Element | Token Level | Weight |
|---|---|---|
| `<h1>` | `display-xl` | bold (700) or semibold (600) |
| `<h2>` | `display-md` | bold (700) or semibold (600) |
| `<h3>` | `display-sm` | semibold (600) |
| `<h4>` | `display-xs` | semibold (600) |
| `<p>` body | `text-md` | regular (400) |
| `<small>` / caption | `text-sm` | regular (400) |
| `<label>` | `text-sm` | medium (500) |

---

## Spacing Scale

No explicit spacing tokens in current CSS export. Use this convention as an 8px-base system, to be replaced by future `--sys-spacing-*` tokens:

| Token (future) | Value | Usage |
|---|---|---|
| `--sys-spacing-xs` | 4px | Tight spacing, icon gaps |
| `--sys-spacing-sm` | 8px | Related element gaps, input padding |
| `--sys-spacing-md` | 16px | Standard spacing between elements |
| `--sys-spacing-lg` | 24px | Section spacing, card padding |
| `--sys-spacing-xl` | 32px | Large section spacing |
| `--sys-spacing-2xl` | 48px | Page section gaps |
| `--sys-spacing-3xl` | 64px | Major page margins |

Apply with `gap`, `padding`, and `margin` in CSS Modules.

---

## Border Radius

| Token (future) | Value | Usage |
|---|---|---|
| `--sys-radius-sm` | 4px | Inputs, subtle containers |
| `--sys-radius-md` | 8px | Cards, dialogs |
| `--sys-radius-lg` | 12px | Modals, prominent surfaces |
| `--sys-radius-full` | 9999px | Badges, avatars, pills |

---

## Shadows / Elevation

| Token (future) | Value | Usage |
|---|---|---|
| `--sys-elevation-1` | `0 1px 3px var(--sys-color-shadow)` | Cards, subtle depth |
| `--sys-elevation-2` | `0 4px 8px var(--sys-color-shadow)` | Dropdowns, tooltips |
| `--sys-elevation-3` | `0 8px 24px var(--sys-color-shadow)` | Modals, dialogs |

---

## Grid & Breakpoints

| Breakpoint | Min Width | Columns | Gutter | Offset / Margin |
|---|---|---|---|---|
| Mobile | 0px | 4 | 16px | 16px |
| Tablet | 768px | 8 | 32px | 32px |
| Desktop | 1024px | 12 | 32px | 150px (auto) |
| Desktop Large | 1440px | 12 | 32px | Centered (80px sections) |

**Layout rules:**
- Mobile-first — all styles target mobile by default; `min-width` media queries enhance upward
- Content max-width: 1200px centered for desktop
- Full-bleed sections extend edge-to-edge on mobile; padded on desktop

---

## Required Reusable Components

Each component lives in `components/ui/` and must handle Loading, Empty, Error, and Success states where applicable.

### Button
- **Variants:** `primary`, `secondary`, `tertiary`, `danger`, `ghost`
- **Sizes:** `sm`, `md`, `lg`
- **States:** default, hover, active, focused, disabled, loading (spinner)
- **Props:** `variant`, `size`, `disabled`, `loading`, `icon`, `iconPosition`, `fullWidth`, `type`
- Uses `--sys-color-primary` / `--sys-color-secondary` / `--sys-color-error` per variant

### Input
- **Variants:** `outlined`, `filled`
- **States:** default, focused, error, disabled, read-only
- **Props:** `label`, `error`, `helperText`, `placeholder`, `disabled`, `required`, `icon`
- Error state: red border via `--sys-color-error`, red helper text
- Label: `text-sm` medium weight

### Textarea
- Same as Input + `rows` prop
- Min-height: 80px; resizable vertically only

### Select
- **States:** default, focused, error, disabled
- **Props:** `label`, `options`, `placeholder`, `error`, `disabled`
- Custom chevron icon; avoid native `<select>` styling inconsistencies

### Card
- **Variants:** `default` (elevated), `outlined` (bordered), `flat` (no border/no shadow)
- **Props:** `padding` (sm/md/lg), `onClick`, `as` (polymorphic — `article`, `div`, `section`)
- Background: `--sys-color-surface-container` or `--sys-color-surface`
- Border-radius: `--sys-radius-md`

### Modal
- Overlay: `--sys-color-scrim` at 40% opacity
- Content: `--sys-color-surface-container-lowest`
- Close button top-right
- Traps focus, closes on Escape and backdrop click
- **Props:** `open`, `onClose`, `title`, `size` (sm/md/lg/fullscreen)

### Dialog (Alert Dialog)
- For confirmations, destructive actions
- Always has two buttons (confirm + cancel)
- No close X — user must choose an action
- Destructive confirm uses `danger` variant

### Alert
- **Variants:** `info`, `success`, `warning`, `error`
- **Props:** `title`, `message`, `dismissible`, `action` (optional link/button)
- Icon per variant (info icon, checkmark, warning triangle, error circle)
- Background uses container variants of each color

### Badge
- **Variants:** `primary`, `secondary`, `error`, `success`, `warning`, `neutral`
- **Sizes:** `sm`, `md`
- Border-radius: full (pill shape)
- For counts, status indicators, labels

### Avatar
- **Sizes:** `sm` (32px), `md` (40px), `lg` (56px), `xl` (80px)
- **Props:** `src`, `alt`, `fallback` (initials), `status` (online/offline/away)
- Border-radius: full (circle)
- Fallback uses `--sys-color-primary-container` background

### Tabs
- **Variants:** `underline`, `pills`, `segmented`
- **Props:** `tabs` (array of `{ label, value, icon? }`), `value`, `onChange`
- Active tab uses `--sys-color-primary` underline or fill

### Dropdown (Menu)
- **Props:** `trigger` (button/label), `items`, `placement` (bottom-left/bottom-right/top)
- Opens on click; closes on click-outside and Escape
- Uses `--sys-elevation-2` shadow

### Toast (Notification)
- **Variants:** `success`, `error`, `info`, `warning`
- **Props:** `message`, `duration` (default 4000ms), `action`, `onDismiss`
- Auto-dismisses after duration; slides in from top-right on desktop, bottom on mobile
- Stack multiple toasts vertically

---

## Form Patterns

- Every form field has a visible `<label>` with `htmlFor`
- Required fields marked with `*`
- Error messages appear below the field, not as tooltips
- Submit button is disabled while the form is submitting
- Forms are single-column on mobile, multi-column (2-up) on tablet/desktop
- Group related fields with `<fieldset>` and `<legend>`

---

## Navigation Patterns

| Breakpoint | Navigation Style |
|---|---|
| Mobile | Bottom tab bar (5 items max) with icons + labels |
| Tablet | Collapsible sidebar with icons + labels |
| Desktop | Persistent sidebar (240px wide) with full labels |

Active nav item uses `--sys-color-primary` or `--sys-color-primary-container`.

---

## Empty States

Every screen without data must display:
1. An illustration or icon (optional but preferred)
2. A helpful message explaining the empty state
3. A suggested action (usually a button or link)

**Tone:** Supportive, never blaming. "Track your first symptom" not "No symptoms logged yet."

---

## Loading States

- Use skeleton screens for content-heavy pages (dashboard, lists)
- Use spinner buttons for form submissions
- Use shimmer animation for card layouts
- Never show raw text "Loading..."
- Skeleton color: `--sys-color-surface-container-highest` with pulse animation

---

## Dashboard Layout

Dashboard sections in priority order:

1. **Today's symptoms** — quick-add + today's log status
2. **Current menopause stage** — stage badge + brief description
3. **Latest AI insight** — personalized wellness tip based on recent logs
4. **Recommended content** — educational articles based on stage

---

## Accessibility

| Requirement | Specification |
|---|---|
| Color contrast | WCAG 2.1 AA minimum (4.5:1 normal text, 3:1 large text) |
| Focus indicators | Visible `:focus-visible` outline — 2px solid `--sys-color-primary` with 2px offset |
| Touch targets | Minimum 44×44px for all interactive elements |
| Keyboard navigation | All interactive elements reachable via Tab; logical order |
| Screen readers | Semantic HTML, ARIA labels where native semantics are insufficient |
| Dark mode | Full `[data-theme="dark"]` token set — all color tokens have inverted variants |
| High contrast mode | Test with Windows High Contrast mode; ensure all info is not conveyed through color alone |
| Large text | Layout must not break at 200% browser zoom |
| Reduced motion | Respect `prefers-reduced-motion: reduce` — disable animations, transitions |

---

## Content & Readability

- Body text max-width: 65ch (for paragraphs)
- Headings can be full width
- Link styling: underline on hover, `--sys-color-primary` color
- Bullet lists use `--sys-color-primary` for bullet markers
- Medical/health content must carry the disclaimer: "This information is educational and not medical advice."

---

## Motion & Animation

- Transitions: 200ms ease-out for micro-interactions (hover, focus, color changes)
- Page transitions: 300ms ease-in-out
- Loading shimmer: 1.5s infinite pulse
- Modal enter: 200ms fade + 300ms scale
- Respect `prefers-reduced-motion: reduce` — disable all non-essential motion
