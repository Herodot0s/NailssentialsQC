# NailssentialsQC - Full-Fledge UI/UX Design System & Web App Implementation Guide

This document is the ultimate "Source of Truth" for generating and implementing the NailssentialsQC Spa Management System UI. It strictly adheres to **UI/UX Pro Max Guidelines**, ensuring enterprise-grade accessibility, aesthetic excellence, and robust interaction patterns, while fully aligning with the `05-UX-Design.md` specification.

---

## 1. Global Theme Configuration (Design Tokens)

The brand conveys an elegant, warm, natural, and modern spa-like experience.

### 1.1 Color Palette
```javascript
export const theme = {
  colors: {
    // Brand Colors
    primary: '#B8794E',       // Terracotta Brown (Main Action / Brand Identity)
    primaryHover: '#9A6440',  // Darker Terracotta (Active/Hover states)
    primaryLight: '#F5E6D9',  // Subtle backgrounds / Active tab states
    primaryUltra: '#FDF8F4',  // Card accents / Very light hover surfaces
    
    // UI Colors
    background: '#FAFAF9',    // Warm off-white page background (Spa vibe)
    surface: '#FFFFFF',       // Pure white for cards/modals
    surfaceAlt: '#F5F5F4',    // Alternate sections/Light warm gray
    border: '#E5E7EB',        // Dividers and inputs
    
    // Text Colors
    textPrimary: '#1F2937',   // Headings, body text (Contrast > 4.5:1 on light backgrounds)
    textSecondary: '#6B7280', // Labels, subtitles (Contrast > 4.5:1 on light backgrounds)
    textMuted: '#9CA3AF',     // Disabled text (Do not use for vital info)
    
    // Semantic Colors (Must pair with icons, never color alone)
    success: '#4CAF50',       // Confirmed/Completed
    successBg: '#E8F5E9',
    warning: '#FF9800',       // Pending/Attention
    warningBg: '#FFF3E0',
    error: '#DC2626',         // Cancelled/Failed/Destructive
    errorBg: '#FEE2E2',
    info: '#2563EB',          // Links/Help
    infoBg: '#DBEAFE',
  },
  // ... rest of theme
};
```

### 1.2 Typography & Spacing
```javascript
export const theme = {
  // ...
  fonts: {
    heading: '"Playfair Display", serif', // Elegant, luxurious
    body: '"Inter", sans-serif',          // Highly legible UI font
  },
  fontSizes: {
    xs: '12px',   // Badges, footnotes
    sm: '14px',   // Labels, captions
    md: '16px',   // Base mobile body (prevents iOS auto-zoom)
    lg: '18px',   // Subtitles (Inter)
    xl: '20px',   // Card titles (Inter)
    '2xl': '24px',// Section titles (Playfair)
    '3xl': '32px',// Page titles (Playfair)
    '4xl': '48px',// Hero sections (Playfair)
  },
  space: {
    1: '4px',
    2: '8px',     // Minimum touch target gap
    3: '16px',    // Standard padding
    4: '24px',    // Generous padding
    5: '32px',
    6: '48px',
    7: '64px',
  },
  radii: {
    sm: '4px',    // Badges
    md: '8px',    // Inputs, standard buttons
    lg: '16px',   // Soft, organic spa-like primary radius for cards
    pill: '50px', // For tags and special buttons
    round: '50%', // Avatars, Icon circles
  },
  shadows: {
    // Terracotta-tinted elegant shadows (replaces harsh grays)
    sm: '0 2px 8px rgba(184, 121, 78, 0.04)',
    md: '0 8px 24px rgba(184, 121, 78, 0.08)',
    lg: '0 16px 32px rgba(184, 121, 78, 0.12)',
    focus: '0 0 0 2px #F5E6D9, 0 0 0 4px #B8794E', // Required A11y Focus Ring
  },
  transitions: {
    default: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    fast: 'all 0.2s ease',
    spring: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Natural bounce
  }
};
```

---

## 2. UI/UX Pro Max Engineering Rules
*Strictly follow these rules across ALL web application code to ensure enterprise-grade quality.*

### 2.1 Accessibility (A11y) & Interaction [CRITICAL]
- **Touch Targets:** ALL interactive elements (buttons, links, icon buttons) MUST have a minimum height/width of `44px` on mobile/touch interfaces.
- **Focus States:** Globally enforce `:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }`. Never remove focus rings.
- **Icons:** STRICTLY use SVG icons (Lucide/Heroicons/Radix). **DO NOT use Emojis**. Ensure consistent stroke width (1.5px or 2px).
- **Semantic HTML:** Use native `<button type="button">`, `<nav>`, `<main>`, `<dialog>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`.
- **Color Contrast:** All text must meet the WCAG 4.5:1 contrast ratio against its background. Do not convey info by color alone (always pair with icons or text).

### 2.2 Layout & Responsive [HIGH]
- **Mobile-First:** Design for 320px-375px first. Use a responsive max-width container (`1200px`) for desktop to prevent horizontal stretching.
- **Spacing Rhythm:** Use strict 8px increment multiples (`8px`, `16px`, `24px`, `32px`).
- **Navigation:** 
  - Mobile: Bottom navigation bar (max 5 items, active highlighted in primary color).
  - Desktop: Left sidebar (fixed, 240px wide).

### 2.3 Animation & States [MEDIUM]
- **Interactions:** Use active/pressed states. Button hovers use a subtle scale `transform: scale(1.02)`.
- **Loading:** Use skeleton screens for content loading > 300ms. Use button spinners for form submissions. Never leave the UI unresponsive.
- **Toasts:** Success/Error toast notifications should auto-dismiss in 3-5 seconds and be announced to screen readers (`aria-live="polite"`).

### 2.4 Forms & Inputs
- **Labels:** Every input MUST have a visible `<label>`. Do not rely solely on placeholders.
- **Validation:** Validate on blur. Show clear error messages below the input in `error` color (#DC2626) with an error SVG icon.
- **Progressive Disclosure:** Group long forms into logical steps (e.g., the 4-step booking flow).

---

## 3. Web App Component Architecture

### 3.1 Buttons
- **Primary:** `bg: primary`, `color: white`, `radius: 8px`, `min-height: 44px`, `font: bold 16px`. Hover: `bg: primaryHover`, `scale(1.02)`. Loading: Show spinner, disable.
- **Secondary (Outline):** `bg: transparent`, `border: 1px solid primary`, `color: primary`. Hover: `bg: primaryLight`.
- **Ghost:** `bg: transparent`, `color: primary`. Hover: `bg: primaryUltra`.
- **Destructive:** `bg: error`, `color: white`. Used for Cancel/Delete/Remove actions.

### 3.2 Form Inputs
- **Base:** `bg: white`, `border: 1px solid border`, `radius: 8px`, `min-height: 48px`, `padding: 0 16px`.
- **Focus:** `border-color: primary`, `box-shadow: focus`.
- **Error:** `border-color: error`. Red error text + icon below input.

### 3.3 Cards (Services, Appointments, Metrics)
- **Base Style:** `bg: surface`, `borderRadius: lg (16px)`, `boxShadow: sm`, `border: 1px solid transparent`, `padding: 24px`.
- **Hover State (Interactive Cards):** `transform: translateY(-2px) scale(1.01)`, `boxShadow: lg`, `transition: spring`.
- **Accent:** Use a `4px` solid left border for status indication (e.g., Orange for Pending, Green for Confirmed, Primary Terracotta for Active/Highlighted).

### 3.4 Badges & Status Tags
- **Base:** `padding: 4px 8px`, `radius: 4px`, `font: bold 12px`.
- **Success:** `bg: successBg`, `color: success`.
- **Warning:** `bg: warningBg`, `color: warning`.
- **Info:** `bg: infoBg`, `color: info`.

---

## 4. Full-Fledge Web App Screen Prompts (UI Generation)

*Copy and paste these exact descriptions into your UI generator (v0, Cursor, Bolt, Lovable) to build out the full application screen by screen.*

### 🖥️ Prompt 1: Landing Page & Navigation
> "Generate a responsive landing page for NailssentialsQC Spa. **Navbar:** Fixed top, blurred glassmorphism background. Includes Logo (Playfair Display font, Terracotta #B8794E), links (Services, About, Contact), and two buttons ('Log In' outline, 'Book Now' solid primary). **Hero Section:** Split layout. Left: Playfair Display H1 'Elevate Your Natural Beauty', Inter body text, primary 'Book Appointment' button (min 44px height). Right: A placeholder for a beautiful spa image with soft rounded corners (16px) and a subtle terracotta shadow (`0 16px 32px rgba(184, 121, 78, 0.12)`). **Services Preview:** 3 cards in a row. Each card has a white bg, 16px radius, a 64px circular SVG icon container with a light pink gradient, service title, and an outline select button. Ensure all spacing follows an 8px grid."

### 🔐 Prompt 2: Authentication (Login / Register)
> "Generate an Authentication page (Login view). **Background:** Warm gradient from off-white (#FAFAF9) to a very faint terracotta (#F5E6D9). **Card:** Centered, white, 8px border-radius, terracotta shadow (`0 4px 24px rgba(0,0,0,0.08)`), max-width 400px. Padding 40px vertical, 32px horizontal. **Header:** 'Welcome Back' in Playfair Display. **Form:** Email input and Password input. Both MUST have visible `<label>` above them, 8px border-radius, 48px height, and focus states with a 2px terracotta ring. Include a password visibility toggle (SVG eye icon). **Actions:** Full-width 48px Primary Button ('Login'). A 'Forgot Password?' text link, and a 'Don't have an account? Register Now' footer text. Ensure keyboard accessibility."

### 🛍️ Prompt 3: Service Catalog (Browsing)
> "Generate a Service Catalog page. **Header:** 'Services' (18px, bold) with sticky search bar (magnifying glass SVG). **Tabs:** Horizontally scrollable category tabs (All, Nails, Waxing, Lashes). Active tab has a 2px solid primary underline and primary text. **Main Content:** Responsive grid of Service Cards. **Service Card Design:** White bg, 8px radius, shadow `sm`. Left: 48px circular SVG icon container (primaryLight bg). Middle: Service Name, Duration (14px textSecondary), Price. Right: 'Select' outline button. Include 'Package Deals' cards with a light gradient background (#FCE4F3 to #FFFFFF) and a primary left border."

### 📅 Prompt 4: Date & Time Selection (Booking Flow)
> "Generate a Date and Time Selection booking interface. **Header:** Progress stepper showing 'Step 3 of 4: Select Date & Time' with a green checkmark on completed steps. **Summary Card:** Sticky top card showing 'Selected Service: Gel Manicure'. **Left Column (Date):** Calendar component. Available dates are bold, selected date has a solid primary circle background. **Right Column (Time):** Grid of time slots. Each chip is a pill shape (44px height). Selected chip is solid primary. **Bottom Bar:** Fixed bottom container with an 'Order Summary' and an enabled 'Continue' primary button."

### 👤 Prompt 5: Customer Dashboard (Home & Appointments)
> "Generate a Customer Dashboard. **Layout:** Bottom nav on mobile (Home, Book, Appointments, Profile), Left sidebar on desktop. **Header:** 'Welcome back, Maria! 👋' in Playfair Display. **Upcoming Appointment Widget:** A prominent card (16px radius, terracotta shadow) with a 4px primary left border. Shows service name, date, time, and 'Reschedule' (outline) / 'Cancel' (destructive red text) buttons. **Quick Actions:** 2x2 grid of square cards (Book Now, My Appointments, Profile, Support). Each has a 32x32px circular SVG icon. **Recent Activity:** A list of completed appointments with a green checkmark SVG."

### 💅 Prompt 6: Staff Schedule & Check-in Dashboard
> "Generate a Staff Dashboard for Salon Technicians. **Header:** 'Today's Schedule'. **Welcome Widget:** 'Good morning, Anna' with a large green '✅ CHECK IN' primary button (48px height). **Timeline:** A vertical list of today's appointments. **Card Statuses:** Pending = Orange left-border, Confirmed = Green left-border, In Progress = Blue left-border. Include a 'Start Service' button on Confirmed cards. **Progress Widget:** A card showing 'Daily Target' with a horizontal progress bar (8px height) filled with the primary terracotta color based on commission earned."

### 📊 Prompt 7: Manager / Admin Analytics Dashboard
> "Generate a Manager Analytics Dashboard. **Top Bar:** Date range picker and export buttons. **KPI Grid:** 4 cards across the top (Sales, Appointments, Staff Present, Target). Each card shows a large metric number and a soft-colored SVG icon. **Charts Area:** A card containing a placeholder for a Sales Trend Line Chart (using Chart.js logic), and a 'Top Services' card showing horizontal progress bars. **Team Target Widget:** A full-width progress bar showing daily break-even goal. **Alerts:** A list of actionable notifications (e.g., '⚠️ 2 appointments pending')."

---

## 5. Final Code Review & Delivery Checklist (UI/UX Pro Max)

Before finalizing any frontend implementation, developers MUST verify the following:

- [ ] **Component Semantics:** Are buttons native `<button>` tags? Are interactive links `<a>` tags?
- [ ] **Accessibility (A11y):** Does every form input have an associated `<label>`? Are icons hidden from screen readers unless they convey meaning?
- [ ] **Focus States:** Can a user tab through the interface and clearly see a Terracotta (`#B8794E`) focus ring?
- [ ] **Touch Targets:** Are all clickable elements at least `44px` tall on mobile devices?
- [ ] **Icons:** Are all icons SVG-based (strictly NO emojis)? Are they visually consistent in stroke width (1.5px - 2px)?
- [ ] **Responsiveness:** Does the layout break gracefully from Desktop (Sidebar/Grid) to Mobile (Bottom Nav/Stacked)?
- [ ] **Contrast:** Is text contrast sufficient? (Especially white text on the #B8794E primary color, and gray text on white backgrounds).
- [ ] **Loading/Empty States:** Are there states designed for "No appointments", "Loading data" (skeletons), and form submission spinners?
- [ ] **Error Handling:** Are form errors displayed inline beneath the input field with clear, actionable text?
- [ ] **Animation:** Are transitions smooth, short (150-300ms), and free of layout thrashing (only animating `transform` or `opacity`)?
- [ ] **Mobile Overlays:** Do bottom sheets, modals, and dropdowns have a semi-transparent dark scrim (40-60% opacity) separating them from the background?
