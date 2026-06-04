# Component Builder Skill

Use this skill when generating reusable UI components.

---

## File Conventions

```
components/ui/                           # Shared, reusable design system components
├── button.tsx
├── button.module.css
├── button.test.tsx
├── card.tsx
├── card.module.css
├── card.test.tsx
└── ...

features/symptoms/components/            # Feature-specific components
├── symptom-chart.tsx
├── symptom-chart.module.css
├── symptom-chart.test.tsx
└── ...
```

- File name: `kebab-case.tsx` — matches component name (`SymptomChart` → `symptom-chart.tsx`)
- Styles: co-located `*.module.css` next to component
- Tests: co-located `*.test.tsx` next to component
- Types: co-located in component file for simple props, extracted to `types.ts` for complex ones

---

## Standard Component Template

```typescript
import styles from "./my-component.module.css"

type TMyComponentProps = {
  title: string
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
}

export function MyComponent({ title, children, variant = "primary", className }: TMyComponentProps) {
  return (
    <section className={`${styles.root} ${styles[variant]} ${className ?? ""}`}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>{children}</div>
    </section>
  )
}
```

**Rules:**
- No `React.FC` — use plain function signatures with explicit return types
- Props typed as `type` (not `interface`) — PascalCase with `T` prefix
- `children` typed as `React.ReactNode` (not `JSX.Element`)
- Optional props with defaults listed last
- `className` prop for composition

---

## Required States (per Definition of Done)

Every non-trivial component handles four states. Use skeleton for layout-heavy content, inline UI for small elements.

```typescript
type TComponentState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; error: string }
  | { status: "success"; data: T }
```

### Loading
- Layout-heavy: skeleton screens matching component shape
- Small elements (buttons, badges): spinner or pulse animation
- Never show raw "Loading..." text
- Skeleton color: `background: var(--sys-color-surface-container-highest)` with shimmer animation

### Empty
- Illustration or icon (preferred but optional)
- Supportive message explaining the empty state — never blaming
- Suggested action button or link
- See `design-system.md` for tone guidance

### Error
- Card or inline banner with error message
- Retry button where appropriate (network errors)
- Never show raw error objects or stack traces to users
- Log the real error via `lib/logger.ts` (no health data or PII)

### Success
- Render the data with appropriate layout
- Loading → Empty → Error transitions are always possible

---

## Styling Pattern

Use CSS Modules with design tokens from `Tokens/tokens.css`:

```css
/* my-component.module.css */
.root {
  background: var(--sys-color-surface);
  border: 1px solid var(--sys-color-outline-variant);
  border-radius: var(--sys-radius-md, 8px);
  padding: var(--sys-spacing-md, 16px);
}

.title {
  font-family: "Plus Jakarta Sans";
  font-size: var(--sys-typography-display-xs-font-size);
  font-weight: 600;
  color: var(--sys-color-on-surface);
}

/* Responsive — mobile-first */
@media (min-width: 768px) {
  .root { padding: var(--sys-spacing-lg, 24px); }
}
```

**Rules:**
- Use `--sys-*` tokens for all colors, typography, and spacing — never hardcode
- Fallback values (`var(--sys-spacing-md, 16px)`) for tokens that don't exist yet
- Class names: semantic and lowercase (`.root`, `.title`, `.content`, `.actions`)

---

## Dark Mode

Components automatically adapt via CSS Custom Properties — no component-level changes needed:

```css
/* tokens.css already handles this via [data-theme="dark"] selector */
:root { --sys-color-surface: #f7fafd; }
[data-theme="dark"] { --sys-color-surface: #1a2332; }
```

**Component responsibility:**
- Never hardcode colors — always use `--sys-*` tokens
- Test both themes during development
- No `prefers-color-scheme` in component CSS (handled at theme level)

---

## Mobile-First Responsive

```css
/* Default: mobile styles */
.root { grid-template-columns: 1fr; }

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .root { grid-template-columns: 1fr 1fr; }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .root { grid-template-columns: 1fr 1fr 1fr; }
}
```

**Rules:**
- Mobile-first: all base styles target mobile, media queries add complexity
- No `max-width` breakpoints in component CSS (use `min-width` only)
- Touch targets: minimum 44×44px on all interactive elements

---

## Accessibility Patterns

Every component must pass these checks:

| Pattern | Implementation |
|---|---|
| Keyboard navigation | All interactive elements reachable via Tab; `onKeyDown` handlers for Enter/Space |
| Focus indicators | Visible `:focus-visible` outline; never set `outline: none` without replacement |
| ARIA labels | `aria-label` when no visible label; `aria-describedby` for descriptions |
| Semantic HTML | `<button>` not `<div onClick>`; `<nav>` for nav; `<section>` with `<h*>` |
| Live regions | `aria-live="polite"` for dynamic content updates; `aria-live="assertive"` for errors |
| Color independence | Never convey info through color alone — add text, icon, or pattern |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` — disable all animations |

---

## Composition Patterns

### Compound Component (for complex widgets like Tabs, Dropdown)
```typescript
<Tabs value={selected} onChange={setSelected}>
  <Tabs.Tab label="Symptoms" value="symptoms" />
  <Tabs.Tab label="Insights" value="insights" />
</Tabs>
```

### Polymorphic Component (when element type varies)
```typescript
type TCardProps = {
  as?: "div" | "article" | "section"
} & React.ComponentPropsWithoutRef<"div">
```

### Slot Pattern (for flexible layouts)
```typescript
type TCardProps = {
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
}
```

---

## Testing Pattern

```typescript
// my-component.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MyComponent } from "./my-component"

describe("MyComponent", () => {
  it("renders the title", () => {
    render(<MyComponent title="Hello">Content</MyComponent>)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("shows loading state", () => {
    render(<MyComponent title="Hello" loading>Content</MyComponent>)
    expect(screen.getByRole("status")).toBeInTheDocument() // skeleton or spinner
  })

  it("shows error state", () => {
    render(<MyComponent title="Hello" error="Something went wrong">Content</MyComponent>)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup()
    render(<MyComponent title="Hello" onClick={vi.fn()}>Content</MyComponent>)
    await user.tab()
    expect(screen.getByText("Hello")).toHaveFocus()
  })
})
```

---

## Usage Example Format

Every component must include a usage example in its output:

```typescript
// Usage example (in comment or story file)
// <Button variant="primary" size="md" onClick={handleClick}>
//   Track Symptom
// </Button>
```

---

## Cross-References

- `design-system.md` — component variants, sizes, props, tokens
- `code-style.md` — naming conventions, file organization, exports, TypeScript rules
- `architecture.md` — component hierarchy, feature boundaries
- `AGENTS.md` — Definition of Done, quality bar
- `workflows/new-component.md` — 10-step component creation workflow
