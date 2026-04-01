# WAAXP — Brand & Design System

## Identity

- **Product name:** WAAXP (always all-caps)
- **Tagline:** Automatiza tus ventas por WhatsApp
- **Voice:** Concise, direct, Spanish (es-MX). No filler. No exclamation marks.

---

## Color tokens (CSS variables — dark theme)

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#080c10` | Page background |
| `--bg-surface` | `#0d1117` | Cards, panels |
| `--bg-elevated` | `#131920` | Inputs, dropdowns |
| `--accent` | `#0abab5` | CTAs, highlights, icons |
| `--accent-dim` | `rgba(10,186,181,0.08)` | Chip backgrounds |
| `--accent-border` | `rgba(10,186,181,0.2)` | Chip borders |
| `--accent-glow` | `0 0 20px rgba(10,186,181,0.25)` | Box shadow on accent elements |
| `--text-primary` | `#e8edf2` | Body text |
| `--text-secondary` | `#8b95a1` | Labels, captions |
| `--text-tertiary` | `#4a5568` | Placeholder, disabled |
| `--border-subtle` | `rgba(255,255,255,0.04)` | Dividers |
| `--border-default` | `rgba(255,255,255,0.08)` | Card borders |
| `--border-glass` | `rgba(255,255,255,0.12)` | Hover borders |

### Status colors (inline, no tokens)
- Success / online: `#22c55e`
- Warning / pending: `#f59e0b`
- Danger / error: `#ef4444`
- Info / secondary: `#3b82f6`

---

## Typography

- **Display / headings:** `font-display` (Inter or system) + `font-bold`/`font-extrabold`, `tracking-[-0.03em]`
- **Body:** `text-sm`, `font-medium` for labels, `font-normal` for prose
- **Monospace / data:** `font-mono`

### WAAXPTEAM badge (agent users)
Two-word lock-up: `WAAXP` in `--text-primary` + `TEAM` in `--accent` italic, both `font-black uppercase tracking-[0.08em+]`

---

## Component patterns

### Glass card
```
className="glass-card p-8"
```
Background: `var(--bg-surface)`, border: `1px solid var(--border-default)`, `backdrop-blur-sm`.

### Accent button
```
className="btn-accent"
```
Background: `var(--accent)`, text: `#080c10`, `font-semibold`.

### Floating input
```html
<div className="floating-input">
  <input placeholder=" " />
  <label>Label text</label>
</div>
```

### Status badge
Small pill: `px-2 py-0.5 rounded-full text-xs font-semibold`, inline background + color per status.

---

## Icons

- Library: **Lucide React** (`lucide-react`)
- Default stroke width: `1.5` for decorative, `2` for interactive
- Size: `w-4 h-4` inline, `w-5 h-5` nav, `w-8 h-8` hero

---

## Copy rules

- UI labels in **Spanish (es-MX)**
- Abbreviations: `Msgs` not `Messages`, `Conv` not `Conversación` in tight spaces
- Dates: `DD MMM` (e.g. `31 Mar`), times: `HH:mm` 24h
- Numbers: dot separator for thousands (1.234), comma for decimals (1,5%)
- Error messages: direct, no blame ("Credenciales incorrectas" not "El usuario o contraseña son erróneos")

---

## Do NOT

- Add light-mode variants — app is dark-only
- Use Tailwind color classes (`bg-teal-500`) — always use CSS tokens
- Change accent color to anything other than `#0abab5`
- Add emoji to UI unless user explicitly requests
