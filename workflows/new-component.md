# New Component Workflow

Use this workflow when creating a new UI component. Reference `component-builder/Skills.md` for code templates and `design-system.md` for variants and tokens.

---

## 1. Identify Component Purpose

Answer:
- What does this component render?
- Where will it be used (one page or many)?
- Is it presentational (UI) or behavioral (data-fetching)?

**Decision output:** Determines where the component lives (step 2).

---

## 2. Check for Existing Reusable Component

Before building, check if the component already exists in:
- `components/ui/` — design system components (Button, Input, Card, Modal, etc.)
- `components/layout/` — layout components (Header, Sidebar, Footer)

If it exists with the right variant, reuse it. If a variant or prop is missing, extend the existing component rather than creating a new one.

**Done when:** You've confirmed the component doesn't exist and can't be reasonably extended.

---

## 3. Choose Location

| Component type | Location |
|---|---|
| Design system primitive (Button, Input, Modal) | `components/ui/<name>.tsx` |
| Layout (Header, Sidebar, Nav) | `components/layout/<name>.tsx` |
| Feature-specific, shared across pages | `features/<feature>/components/<name>.tsx` |
| Feature-specific, single page only | `features/<feature>/components/<name>.tsx` (same location) |

**Done when:** File path is decided.

---

## 4. Create the Component File

```
components/ui/
├── button.tsx          # kebab-case file
├── button.module.css   # co-located CSS Module
└── button.test.tsx     # co-located test
```

```
features/symptoms/components/
├── symptom-chart.tsx
├── symptom-chart.module.css
└── symptom-chart.test.tsx
```

**Done when:** Empty files exist with correct naming.

---

## 5. Define Props (Type First)

```typescript
type TButtonProps = {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}
```

**Rules:**
- Use `type` (not `interface`) for props — prefix with `T`
- No `React.FC` — plain function signature with inferred return type
- `children` as `React.ReactNode` (not `JSX.Element`)
- `className?: string` for composition
- Optional props with defaults listed last

See `component-builder/Skills.md` for the full template.

**Done when:** Props type is defined and exported.

---

## 6. Implement with Styling (CSS Modules + Tokens)

```typescript
import styles from "./button.module.css"

export function Button({ variant = "primary", size = "md", children, className, onClick }: TButtonProps) {
  return (
    <button className={`${styles.root} ${styles[variant]} ${styles[size]} ${className ?? ""}`} onClick={onClick}>
      {children}
    </button>
  )
}
```

```css
/* button.module.css */
.root {
  font-family: "Plus Jakarta Sans";
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--sys-spacing-sm, 8px);
  transition: background 200ms ease-out;
}

.primary {
  background: var(--sys-color-primary);
  color: var(--sys-color-on-primary);
}

.md {
  padding: var(--sys-spacing-sm, 8px) var(--sys-spacing-md, 16px);
  border-radius: var(--sys-radius-md, 8px);
}
```

**Rules:**
- Use `--sys-*` tokens for all colors, spacing, typography — never hardcode
- Provide fallback values: `var(--sys-spacing-md, 16px)`
- Semantic class names: `.root`, `.title`, `.content`, `.actions`
- `200ms ease-out` for micro-interactions (hover, focus)

**Done when:** Component renders with correct styles using design tokens.

---

## 7. Implement All States

Per Definition of Done, every component handles Loading, Empty, Error, and Success:

```typescript
type TComponentState<T> =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; error: string }
  | { status: "success"; data: T }
```

### Loading
- Layout-heavy: skeleton matching component shape (use `--sys-color-surface-container-highest` background with shimmer)
- Small elements: spinner or pulse animation
- Never show raw "Loading..." text

### Empty
- Supportive message — never blaming ("Track your first symptom" not "No symptoms logged")
- Suggested action button or link

### Error
- Inline banner or card with message
- Retry button for network errors
- Never expose raw error objects or stack traces

### Success
- Render data with appropriate layout
- Transition from loading → empty/error/success is always possible

**Done when:** All four states are implemented with appropriate UI patterns.

See `component-builder/Skills.md` for state type union pattern and CSS examples.

---

## 8. Implement Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard | All interactive elements Tab-reachable; `onKeyDown` for Enter/Space |
| Focus | Visible `:focus-visible` outline — 2px solid `--sys-color-primary` with 2px offset |
| Labels | `<label htmlFor="...">` for form elements; `aria-label` when no visible label |
| Semantics | `<button>` not `<div onClick>`; `<nav>` for nav; `<section>` with `<h*>` |
| Live regions | `aria-live="polite"` for dynamic updates; `aria-live="assertive"` for errors |
| Color | Never convey info through color alone — add text, icon, or pattern |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` — disable animations |

**Done when:** Component passes keyboard navigation, screen reader, and contrast checks.

---

## 9. Add Dark Mode Support

Dark mode is **automatic** — no component-level changes needed if you follow these rules:
- Use `--sys-*` tokens for all colors (never hardcoded hex values)
- The `[data-theme="dark"]` selector in `tokens.css` swaps token values

**Check:** Toggle the theme and verify all colors adapt. If any color doesn't use a token, fix it.

**Done when:** Component renders correctly in both light and dark themes.

---

## 10. Implement Mobile-First Responsive

```css
/* Base: mobile styles (default) */
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
- Mobile-first: base styles target mobile, `min-width` queries add complexity
- Touch targets: minimum 44×44px for all interactive elements
- No `max-width` breakpoints in component CSS

**Done when:** Component renders correctly at mobile, tablet, and desktop widths.

---

## 11. Write Tests

```typescript
// button.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("calls onClick on click", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it("shows loading state", () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup()
    render(<Button onClick={vi.fn()}>Tab me</Button>)
    await user.tab()
    expect(screen.getByRole("button")).toHaveFocus()
  })
})
```

**Cover:** rendering, variants, interactions, states (loading/disabled), keyboard, accessibility.

**Done when:** Co-located `*.test.tsx` exists with tests for all states and interactions.

---

## 12. Add Usage Example

Add a usage example as a comment in the component file or as a separate story file:

```typescript
// Usage:
// <Button variant="primary" size="md" onClick={handleSave}>
//   Save Symptom Log
// </Button>
```

**Done when:** A usage example exists showing the component with realistic props.

---

## 13. Review Against Design Rules

Before considering the component complete:

- [ ] `design-system.md` — matches the required component variants? Tokens used correctly?
- [ ] `component-builder/Skills.md` — follows the standard template patterns?
- [ ] `code-style.md` — naming correct? Exports named? File length under 300 lines?
- [ ] `AGENTS.md` — Definition of Done satisfied? All four states implemented?

**Done when:** All four review checkboxes are checked.
