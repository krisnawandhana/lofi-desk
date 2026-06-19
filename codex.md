````md
# Lofi Desk — Design System

## 1. Product Direction

**Concept:**  
A cozy offline Windows app for Pomodoro, task focus, and daily productivity.

**Vibe:**  
Chill lofi girl, cozy desk, rainy night, warm lamp, calm productivity.

**Design keywords:**
- Cozy
- Warm
- Calm
- Focused
- Soft
- Personal
- Minimal
- Slightly nostalgic

---

## 2. Color Palette

### Base Colors

| Token | Color | Usage |
|---|---|---|
| `--bg-main` | `#171A24` | Main app background |
| `--bg-surface` | `#222638` | Cards, panels |
| `--bg-soft` | `#2D3348` | Secondary surface |
| `--border-soft` | `#3A4058` | Subtle borders |

### Text Colors

| Token | Color | Usage |
|---|---|---|
| `--text-primary` | `#F5EBDD` | Main text |
| `--text-secondary` | `#C9BBA8` | Description text |
| `--text-muted` | `#8F8493` | Placeholder, meta info |

### Accent Colors

| Token | Color | Usage |
|---|---|---|
| `--accent-warm` | `#D6A66A` | Main CTA, timer highlight |
| `--accent-blue` | `#7DA9D9` | Focus state |
| `--accent-green` | `#89B482` | Completed task |
| `--accent-pink` | `#D89BA7` | Soft decorative accent |
| `--accent-purple` | `#9B8FD3` | Night/lofi accent |

---

## 3. Typography

### Font Recommendation

```txt
Primary: Inter / Nunito Sans
Display: Space Grotesk / Outfit
Mono: JetBrains Mono
````

### Type Scale

| Style   | Size | Weight | Usage         |
| ------- | ---: | -----: | ------------- |
| Display | 64px |    700 | Main timer    |
| H1      | 32px |    700 | Page title    |
| H2      | 24px |    600 | Section title |
| H3      | 18px |    600 | Card title    |
| Body    | 15px |    400 | Main content  |
| Small   | 13px |    400 | Metadata      |
| Tiny    | 11px |    500 | Label         |

---

## 4. Spacing System

Use 4px-based spacing.

```txt
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
4xl: 64px
```

---

## 5. Border Radius

```txt
sm: 8px
md: 12px
lg: 18px
xl: 24px
full: 999px
```

Recommended:

* Button: `999px`
* Card: `18px`
* Modal: `24px`
* Input: `12px`

---

## 6. Shadow / Glow

```css
--shadow-soft: 0 12px 40px rgba(0, 0, 0, 0.25);
--shadow-card: 0 8px 24px rgba(0, 0, 0, 0.18);
--glow-warm: 0 0 32px rgba(214, 166, 106, 0.28);
--glow-blue: 0 0 32px rgba(125, 169, 217, 0.22);
```

Use glow carefully, mostly on:

* active timer
* lamp illustration
* primary button
* focus session state

---

## 7. Layout

### Main Desktop Layout

```txt
┌──────────────────────────────────────────────┐
│ Top Bar                                      │
├───────────────┬──────────────────────────────┤
│ Left Panel    │ Main Focus Area              │
│ Task List     │ Timer + Current Task         │
│ Daily Stats   │ Scene Illustration           │
├───────────────┴──────────────────────────────┤
│ Bottom Controls / Ambience / Settings        │
└──────────────────────────────────────────────┘
```

### Recommended Window Size

```txt
Minimum: 900 x 600
Ideal: 1200 x 760
```

---

## 8. Components

### Button

Variants:

* `primary`
* `secondary`
* `ghost`
* `danger`

```txt
Primary Button:
Background: accent-warm
Text: bg-main
Radius: full
Padding: 12px 20px
```

---

### Card

```txt
Background: bg-surface
Border: 1px solid border-soft
Radius: lg
Shadow: shadow-card
Padding: xl
```

---

### Timer Display

```txt
Font: Display
Color: text-primary
Accent glow when active
```

States:

* Focus: blue accent
* Short Break: green accent
* Long Break: purple accent
* Paused: muted

---

### Task Item

States:

* Todo
* Active
* Done

```txt
Todo: normal text
Active: warm border + glow
Done: green check + muted text
```

---

### Input

```txt
Background: bg-soft
Border: border-soft
Radius: md
Text: text-primary
Placeholder: text-muted
Focus Border: accent-warm
```

---

## 9. Pomodoro States

| State       | Color     | Mood               |
| ----------- | --------- | ------------------ |
| Focus       | `#7DA9D9` | Calm concentration |
| Short Break | `#89B482` | Fresh pause        |
| Long Break  | `#9B8FD3` | Deep rest          |
| Paused      | `#8F8493` | Neutral            |

---

## 10. Scene Themes

### Rainy Night

```txt
Background: dark blue
Details: rain, window, desk lamp
Mood: calm, deep focus
```

### Sunset Cafe

```txt
Background: orange-purple gradient
Details: coffee cup, window, soft sun
Mood: warm, relaxed
```

### Midnight Room

```txt
Background: navy purple
Details: monitor glow, bookshelf, posters
Mood: quiet, personal
```

### Bali Workspace

```txt
Background: warm tropical evening
Details: plant, wooden desk, soft breeze
Mood: fresh, personal identity
```

---

## 11. Animation Direction

Keep animations slow and subtle.

Recommended:

* Rain loop
* Lamp glow pulse
* Floating dust particles
* Plant sway
* Timer progress ring
* Smooth task completion transition

Avoid:

* Aggressive bounce
* Too many moving elements
* Fast transitions
* Corporate SaaS-like animation

---

## 12. Sound Design

Optional ambience:

* Rain
* Lofi beat
* Fireplace
* Cafe noise
* Ocean
* Keyboard typing

Controls:

```txt
Play / Pause
Volume
Ambience selector
Mute all
```

---

## 13. App Pages

### Home

Main Pomodoro screen:

* timer
* current task
* start/pause/reset
* scene background

### Tasks

Task management:

* add task
* edit task
* delete task
* set estimated pomodoro
* mark done

### History

Focus records:

* completed sessions
* focus minutes
* task history

### Settings

User preferences:

* timer duration
* theme
* sound
* notification
* data export/import

---

## 14. Data Model

### Task

```ts
type Task = {
  id: string
  title: string
  description?: string
  status: "todo" | "doing" | "done"
  estimatedPomodoro: number
  completedPomodoro: number
  createdAt: string
  updatedAt: string
}
```

### Pomodoro Session

```ts
type PomodoroSession = {
  id: string
  taskId?: string
  type: "focus" | "short_break" | "long_break"
  duration: number
  completed: boolean
  startedAt: string
  endedAt?: string
}
```

### Settings

```ts
type AppSettings = {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  theme: "rainy-night" | "sunset-cafe" | "midnight-room" | "bali-workspace"
  ambience: "rain" | "lofi" | "fireplace" | "cafe" | "ocean" | "none"
  volume: number
}
```

---

## 15. CSS Variables

```css
:root {
  --bg-main: #171A24;
  --bg-surface: #222638;
  --bg-soft: #2D3348;
  --border-soft: #3A4058;

  --text-primary: #F5EBDD;
  --text-secondary: #C9BBA8;
  --text-muted: #8F8493;

  --accent-warm: #D6A66A;
  --accent-blue: #7DA9D9;
  --accent-green: #89B482;
  --accent-pink: #D89BA7;
  --accent-purple: #9B8FD3;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-full: 999px;

  --shadow-soft: 0 12px 40px rgba(0, 0, 0, 0.25);
  --shadow-card: 0 8px 24px rgba(0, 0, 0, 0.18);
}
```

---

## 16. Design Principle

> The app should feel like opening a small cozy study room, not a productivity dashboard.

Focus on:

* fewer elements
* soft contrast
* warm details
* calm motion
* personal atmosphere
* offline-first simplicity

```
```
