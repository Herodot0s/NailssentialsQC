---
sketch: 001
name: slider-checkin
question: "What slider interaction feels right for time in/out?"
winner: null
tags: [slider, checkin, attendance, mobile, interaction]
---

# Sketch 001: Slider Check-In/Out

## Design Question
Replace the current button-based check-in/check-out in StaffDashboard with an iPhone lockscreen-style slider. Reference: Frappe HRMS time tracking structure. Supports both employee self check-in and manager override viewing.

## How to View
```bash
open .planning/sketches/001-slider-checkin/index.html
```

## Variants

- **A: iPhone-Style** — Classic horizontal slider with spotlight text animation, mimicking the old iPhone "Slide to Unlock" interaction. Slide right to check in, slide left to check out (or vice versa based on state). Shows real-time clock and status badge.

- **B: Modern Capsule** — Clean capsule-shaped track with a sliding thumb and fill animation. Shows current time, status with colored dot indicator, and today's hours worked. More aligned with the project's flat, minimal aesthetic.

- **C: Pull-Down** — Vertical slider that pulls up to check in and pulls down to check out. Uses a vertical track with a draggable thumb. Unique interaction that feels distinct from typical horizontal sliders.

## What to Look For

- **A**: Does the horizontal slide feel natural for check-in/out? Does the spotlight text animation add value or distraction? Is the status badge clear?
- **B**: Does the capsule fill animation feel satisfying? Is the status dot + label combination clear? Does it fit the project's aesthetic (rounded-none, minimal)?
- **C**: Does the vertical interaction feel intuitive? Is it clear which direction does what? Does it work well on mobile (thumb reachability)?

## Frappe HRMS References
- Checkin Panel shows last check-in/check-out timestamp
- Quick check-in with minimal clicks
- No slider in official Frappe HRMS — this is a custom enhancement over their standard button approach

## Project Context
- Current implementation: Button component in `StaffDashboard.tsx` (line 235-241)
- Status tracked via `getAttendanceStatus()` API
- Check-in: `checkIn()`, Check-out: `checkOut()`
- Brand colors: Terracotta #B8794E, Success #4a8c6f
