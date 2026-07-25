# Transcendence Design System

Custom design system featuring centralized CSS tokens, SVG icons, and 10 reusable React components.

---

## 1. Color Palette & Typography

Centralized in [`/frontend/src/index.css`](file:///Users/wuerxuan/code/transcendence/ft_transcendence/frontend/src/index.css):

- **Colors**: `--ink` (`#29231e`), `--muted` (`#756b61`), `--cream` (`#f8f4eb`), `--paper` (`#fffdf8`), `--line` (`#e6ddd0`), `--coral` (`#d85d42`), `--indigo` (`#393b77`), `--danger` (`#a5312a`), `--success` (`#2e7d32`).
- **Typography**: `--font-serif` (Georgia, Times), `--font-sans` (system-ui, sans-serif).
- **Tokens**: `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (14px), `--radius-pill` (9999px), `--shadow-md`.

---

## 2. Icon Set

Located in [`Icon.tsx`](file:///Users/wuerxuan/code/transcendence/ft_transcendence/frontend/src/components/Icon.tsx).
Provides SVG icons: `calendar`, `user`, `users`, `map-pin`, `plus`, `edit`, `trash`, `search`, `check`, `x`, `arrow-left`, `log-out`, `shield`, `heart`, `sparkles`, `upload`, `alert-circle`, `info`, `check-circle`, `settings`, `filter`, `globe`, `chevron-down`, `eye`, `eye-off`, `bell`.

```tsx
import { Icon, CalendarIcon } from "../components";
<CalendarIcon size={20} />
```

---

## 3. The 10 Reusable UI Components

Located in [`frontend/src/components/`](file:///Users/wuerxuan/code/transcendence/ft_transcendence/frontend/src/components/):

1. **`<Button>`**: Button with `primary`/`subtle`/`danger`/`ghost` variants, loading spinner, and icon props.
2. **`<Input>`**: Text input with label, error formatting, helper text, and icon slots.
3. **`<Select>`**: Select dropdown with options, label, and error states.
4. **`<Avatar>`**: User avatar with automatic initials fallback when image is missing.
5. **`<Badge>`**: Status tag with `soft`, `primary`, `danger`, `success`, `outline` variants.
6. **`<Card>`**: Card container with `CardHeader`, `CardTitle`, `CardBody`, and `CardFooter`.
7. **`<Modal>`**: Accessible dialog with backdrop blur, close button, and ESC key closing.
8. **`<EmptyState>`**: Empty listing container with icon, title, description, and action button.
9. **`<Alert>`**: Banner for `error`, `success`, `warning`, `info` states with dismiss button.
10. **`<Icon>`**: SVG icon component and 26 named icon shortcuts.
