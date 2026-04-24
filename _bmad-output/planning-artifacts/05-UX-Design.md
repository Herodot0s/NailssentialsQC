# UX Design Document - NailssentialsQC System

**Project:** NailssentialsQC Salon Management System  
**Version:** 1.0  
**Date:** April 14, 2026  
**Team:** SFIT-2B Group 4

---

## 1. BRAND GUIDELINES

### 1.1 Logo & Brand Identity

**Official Logo:**
- The Nailssentials logo features a stylized "N" monogram within a circle
- Two sparkle stars accent the circular frame
- Text "Nailssentials" in elegant serif typeface
- Subtitle "NAIL & WAXING SPA" in sans-serif
- Primary logo color: Terracotta Brown (#B8794E)
- Logo variations: Full color, white on dark, monochrome

**Brand Personality:**
- **Elegant:** Sophisticated, refined, professional
- **Warm:** Welcoming, friendly, approachable
- **Natural:** Earth tones, organic feel, spa-like
- **Modern:** Clean, contemporary, tech-savvy

### 1.2 Brand Colors (Logo-Aligned)

**Primary Brand Color - Terracotta Brown (#B8794E):**
- Used for: Primary buttons, logo, brand elements, active states
- Represents: Warmth, earthiness, natural beauty, sophistication
- Psychology: Grounded, reliable, organic, comforting

**Color Hierarchy:**
```
Primary Action:     Terracotta (#B8794E)    - Main CTAs, brand elements
Secondary Action:   White + Terracotta      - Outline buttons, secondary CTAs
Success:            Green (#4CAF50)         - Completed, positive outcomes
Warning:            Orange (#FF9800)        - Pending, attention needed
Error:              Red (#DC2626)           - Failed, destructive actions
Information:        Blue (#2563EB)          - Help, links, info
```

**Background Colors:**
```
Page Background:    #FAFAF9  (Warm white, slightly off-white)
Card Background:    #FFFFFF  (Pure white for contrast)
Section Alt:        #F5F5F4  (Light warm gray for alternating sections)
Accent Background:  #FDF8F4  (Ultra-light terracotta tint)
```

### 1.3 Typography Brand Alignment

**Brand Font Pairing:**
- **Headings:** 'Playfair Display' (serif) - Matches logo elegance
- **Body:** 'Inter' (sans-serif) - Modern, clean, readable

**Rationale:**
- Playfair Display mirrors the elegant serif style of "Nailssentials" logo text
- Inter provides modern contrast for UI readability
- Combination creates sophisticated yet accessible feel

**Type Scale (Aligned with Brand):**
```
Display: 48px / 56px (Playfair Display, bold)     - Hero sections, major headlines
h1:      32px / 40px (Playfair Display, bold)      - Page titles
h2:      24px / 32px (Playfair Display, semibold)  - Section titles
h3:      20px / 28px (Inter, semibold)             - Card titles
h4:      18px / 24px (Inter, semibold)             - Subtitles
Body:    16px / 24px (Inter, regular)              - Main content text
Small:   14px / 20px (Inter, regular)              - Labels, captions
Tiny:    12px / 16px (Inter, regular)              - Footnotes, badges
```

### 1.4 Visual Language

**Photography Style:**
- Warm, natural lighting
- Earth tones and neutral backgrounds
- Close-up shots of nail art and waxing results
- Diverse models representing client base
- Lifestyle shots of salon interior

**Iconography:**
- Line icons with rounded corners (Lucide/Heroicons style)
- Consistent stroke width (1.5px - 2px)
- Terracotta color for brand icons
- Simple, elegant, not overly decorative

**Illustrations:**
- Minimalist line art style
- Warm color palette (terracotta, cream, sage, gold)
- Spa and beauty themed
- Friendly but sophisticated

### 1.5 Brand Voice & Tone

**Writing Style:**
- **Friendly but Professional:** "Welcome back, Maria! 👋" not "User authenticated"
- **Clear & Simple:** Avoid jargon, use plain language
- **Encouraging:** "Great job! You've reached your daily target!" 
- **Helpful:** Clear error messages with solutions
- **Consistent:** Same terminology throughout (e.g., always "appointment" not "booking" sometimes)

**Microcopy Examples:**
- Button: "Book Now" (not "Submit")
- Empty state: "Book your first appointment to get started!" (not "No data")
- Error: "Oops! Something went wrong. Please try again." (not "Error 500")
- Success: "Appointment booked successfully! ✓" (not "Operation complete")

---

## 2. DESIGN PRINCIPLES

### 1.1 Core Principles

**Simplicity First**
- Maximum 3 clicks to complete common tasks
- Clean, uncluttered interface with ample white space
- Clear hierarchy and visual grouping
- No jargon or technical terms visible to users

**Mobile-First**
- Design for 320px screens first, then scale up
- Touch-friendly targets (minimum 44x44px)
- Thumb-zone optimization (key actions in easy-to-reach areas)
- Minimal typing (use dropdowns, selections, auto-complete)

**Consistency**
- Same navigation pattern throughout
- Consistent button styles, colors, and placements
- Predictable interaction patterns
- Familiar UI components (no experimental designs)

**Accessibility**
- High contrast ratios (WCAG AA minimum)
- Large, readable fonts (14px base, 16px+ for important text)
- Clear labels on all form fields
- Error messages explain what went wrong AND how to fix it
- Keyboard navigation support

---

## 2. DESIGN SYSTEM

### 2.1 Color Palette

**Brand Colors (Derived from Nailssentials Logo):**
```
Primary:       #B8794E  (Terracotta Brown)   - Brand color, primary buttons, logo
Primary Dark:  #9A6440                       - Hover states, active states, emphasis
Primary Light: #F5E6D9                       - Backgrounds, highlights, subtle elements
Primary Ultra: #FDF8F4                       - Very light backgrounds, card accents
```

**Functional Colors:**
```
Success:       #4CAF50  (Green)              - Completed, confirmed, positive actions
Warning:       #FF9800  (Orange)             - Pending, caution, attention needed
Error:         #DC2626  (Red)                - Failed, cancelled, destructive actions
Info:          #2563EB  (Blue)               - Informational, links, help text
```

**Neutral Colors:**
```
Text Primary:  #1F2937                       - Headings, body text (near black)
Text Secondary:#6B7280                       - Labels, placeholders, subtitles
Text Muted:    #9CA3AF                       - Disabled text, timestamps
Border:        #E5E7EB                       - Dividers, input borders, separators
Background:    #FAFAF9                       - Page background (warm white)
Surface:       #FFFFFF                       - Cards, modals, overlays
Surface Alt:   #F5F5F4                       - Alternate surfaces, subtle sections
```

**Accent Colors (Optional Enhancements):**
```
Sparkle Gold:  #F59E0B                       - Premium features, stars, ratings
Rose:          #E11D48                       - Special promotions, limited offers
Sage:          #059669                       - Eco-friendly/natural service indicators
```

### 2.2 Typography

**Font Family:**
- Primary: 'Inter', sans-serif (Google Fonts)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

**Type Scale:**
```
h1: 32px / 40px (bold)      - Page titles
h2: 24px / 32px (bold)      - Section titles
h3: 20px / 28px (semibold)  - Card titles
h4: 18px / 24px (semibold)  - Subtitles
Body: 16px / 24px (regular) - Main text
Small: 14px / 20px (regular) - Labels, captions
Tiny: 12px / 16px (regular)  - Footnotes, badges
```

### 2.3 Spacing

**Spacing Scale (4px base):**
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### 2.4 Components

**Buttons:**
```
Primary:   Terracotta background (#B8794E), white text, 8px radius
Secondary: White background, terracotta border (#B8794E), terracotta text
Danger:    Red background (#DC2626), white text (destructive actions)
Ghost:     Transparent, terracotta text on hover
Disabled:  Gray background (#E5E7EB), reduced opacity, cursor not-allowed
Hover:     Darker terracotta (#9A6440), slight scale increase (1.02)
Active:    Even darker terracotta (#7A5032), pressed effect
```

**Form Inputs:**
```
Default:   White background, gray border (#E5E7EB), 8px radius
Focus:     Terracotta border (#B8794E, 2px), subtle terracotta shadow
Error:     Red border (#DC2626), error message below in red
Disabled:  Gray background (#F5F5F4), no interaction, cursor not-allowed
Success:   Green border (#4CAF50), for validated fields
```

**Cards:**
```
Default:   White background, subtle shadow (0 2px 8px rgba(0,0,0,0.08))
Hover:     Slightly elevated shadow (0 4px 16px rgba(0,0,0,0.12)), translateY -2px
Accent:    Terracotta left border (4px, #B8794E) for highlighted cards
Gradient:  Terracotta to white gradient (#B8794E to #FFFFFF) for hero sections
```

**Badges:**
```
Success:   Green background (#4CAF50), white text, 4px radius
Warning:   Orange background (#FF9800), white text
Error:     Red background (#DC2626), white text
Info:      Blue background (#2563EB), white text
Default:   Gray background (#6B7280), white text
Premium:   Gold background (#F59E0B), white text (for special features)
```

**Navigation:**
```
Active Tab:    Terracotta underline (2px, #B8794E), terracotta text
Inactive Tab:  Gray text (#6B7280), no underline
Hover Tab:     Darker gray text (#1F2937), subtle background (#F5F5F4)
```

**Progress Bars:**
```
Background:  Light gray (#E5E7EB), 8px height, 4px radius
Fill:        Terracotta gradient (#B8794E to #9A6440)
Success:     Green fill (#4CAF50) when target met
Warning:     Orange fill (#FF9800) when approaching target
```

---

## 3. INFORMATION ARCHITECTURE

### 3.1 Site Map

```
NailssentialsQC System
│
├── Public Pages (No Login Required)
│   ├── Home/Landing Page
│   ├── Service Catalog
│   ├── Login
│   └── Register
│
├── Customer Portal (Login Required)
│   ├── Dashboard
│   │   ├── Upcoming Appointments
│   │   ├── Quick Actions (Book Now)
│   │   └── Recent Activity
│   │
│   ├── Book Appointment
│   │   ├── Step 1: Select Service(s)
│   │   ├── Step 2: Select Technician (Optional)
│   │   ├── Step 3: Select Date & Time
│   │   └── Step 4: Confirm Booking
│   │
│   ├── My Appointments
│   │   ├── Upcoming
│   │   ├── History
│   │   └── Appointment Details
│   │       ├── Reschedule
│   │       ├── Cancel
│   │       └── View Receipt
│   │
│   ├── Profile
│   │   ├── Personal Information
│   │   ├── Preferences
│   │   ├── Change Password
│   │   └── Notification Settings
│   │
│   └── Notifications
│
├── Staff Dashboard (Login Required)
│   ├── Today's Schedule
│   │   ├── Timeline View
│   │   ├── Appointment Details
│   │   │   ├── Customer Info
│   │   │   ├── Service Details
│   │   │   ├── Start/Complete Actions
│   │   │   └── Add Notes
│   │   └── Quick Actions
│   │       ├── Check-In
│   │       └── Check-Out
│   │
│   ├── Weekly Schedule
│   │   ├── Calendar View
│   │   └── Availability Settings
│   │
│   ├── Customers
│   │   ├── Customer Profile
│   │   └── Booking History
│   │
│   ├── Performance
│   │   ├── Today's Earnings
│   │   ├── Daily Target Progress
│   │   ├── Weekly Commission
│   │   └── Transaction History
│   │
│   └── Notifications
│
└── Manager Admin (Login Required)
    ├── Dashboard
    │   ├── Today's Summary
    │   │   ├── Total Sales
    │   │   ├── Appointments Count
    │   │   ├── Team Target Progress
    │   │   └── Alerts
    │   ├── Quick Actions
    │   └── Recent Activity
    │
    ├── Staff Management
    │   ├── Staff List
    │   ├── Add/Edit Staff
    │   ├── Staff Details
    │   │   ├── Profile
    │   │   ├── Schedule
    │   │   ├── Performance
    │   │   └── Commissions
    │   └── Attendance
    │       ├── Daily Log
    │       └── Monthly Report
    │
    ├── Service Management
    │   ├── Service List
    │   ├── Add/Edit Service
    │   └── Categories
    │
    ├── Appointments
    │   ├── All Appointments (Calendar)
    │   ├── Walk-In Booking
    │   └── Manage Bookings
    │
    ├── Payroll
    │   ├── Commission Reports
    │   ├── Payroll Generation
    │   └── Deductions
    │
    ├── Reports
    │   ├── Sales Reports
    │   │   ├── Daily
    │   │   ├── Weekly
    │   │   └── Monthly
    │   ├── Service Analytics
    │   ├── Staff Performance
    │   └── Customer Insights
    │
    ├── Customers
    │   ├── Customer Database
    │   ├── Customer Profile
    │   └── Booking History
    │
    └── Settings
        ├── Business Information
        ├── Operating Hours
        ├── Commission Rules
        └── Notification Settings
```

### 3.2 Navigation Patterns

**Customer Portal:**
- Bottom navigation bar (mobile) / Left sidebar (desktop)
- Tabs: Home, Book, Appointments, Profile, Notifications

**Staff Dashboard:**
- Bottom navigation bar (mobile) / Left sidebar (desktop)
- Tabs: Schedule, Customers, Performance, Notifications

**Manager Admin:**
- Left sidebar navigation (always visible on desktop)
- Top bar with quick actions and notifications (mobile)
- Hamburger menu for mobile

---

## 4. KEY SCREEN DESIGN PROMPTS

### 4.1 How to Use These Prompts

These prompts are designed for:
- **AI Design Tools** (v0, Lovable, Cursor AI, Figma AI)
- **UI Designers** creating mockups in Figma
- **Frontend Developers** building components
- **Stakeholder Reviews** visualizing the final product

**Prompt Structure:**
- **Context:** What screen we're designing
- **User Role:** Who uses this screen
- **Layout Requirements:** Structure and hierarchy
- **Components:** Specific UI elements needed
- **Interactions:** User actions and behaviors
- **States:** Default, loading, error, empty, success
- **Responsive Behavior:** Mobile → Tablet → Desktop adaptations

---

### 4.2 Customer-Facing Screens

#### Screen 1: Login/Authentication Page

**Design Prompt:**

Create a clean, centered login page for a beauty salon booking system with the following specifications:

**Layout & Composition:**
- Center-aligned card layout on a warm terracotta gradient background (#F5E6D9 to #FDF8F4)
- Salon logo and brand name "NailssentialsQC" prominently displayed at top center (logo ~80x80px using terracotta #B8794E, brand name 24px bold in #1F2937)
- White card container (max-width 400px, 8px border radius, subtle shadow 0 4px 24px rgba(0,0,0,0.08))
- Generous padding inside card (40px vertical, 32px horizontal)
- Ample white space between all elements (16-24px)

**Form Elements (Top to Bottom):**
1. **Email or Phone Input:**
   - Full-width text input (height 48px, 8px radius, 1px #E0E0E0 border)
   - Placeholder: "Email or Phone Number"
   - Label above input: "Email or Phone" (14px, #757575)
   - Accepts email format OR Philippine phone number (+63 or 09XXXXXXXXX)
   - Auto-format phone number as user types

2. **Password Input:**
   - Full-width text input (same styling as above)
   - Placeholder: "Enter your password"
   - Label above input: "Password"
   - Password visibility toggle icon (eye icon) on right side
   - Show/hide password on tap/click

3. **Remember Me & Forgot Password Row:**
   - Checkbox with "Remember me" label (left-aligned)
   - "Forgot password?" text link in primary color #E91E8C (right-aligned)
   - Both elements on same horizontal row with space-between

4. **Login Button:**
   - Full-width primary button (height 48px, 8px radius)
   - Background: Terracotta #B8794E, white text, bold
   - Text: "Login" centered
   - Hover state: Darker terracotta #9A6440
   - Disabled state when form invalid: Gray #E5E7EB, cursor not-allowed
   - Loading state: Spinner icon replaces text during submission

5. **Registration Link:**
   - Centered text below card: "Don't have an account?"
   - "Register Now" text link in terracotta #B8794E, bold
   - Clickable area extends beyond text for easy tapping

**States & Behaviors:**
- **Default:** Empty form with placeholder text
- **Validation Error:** Red border (#F44336) on invalid field, error message below in 12px red text
- **Failed Login:** Toast notification top-right (red background, white text: "Invalid email or password. Please try again.")
- **Successful Login:** Button shows spinner → green checkmark → redirect to dashboard
- **Loading:** Skeleton screen or spinner during initial page load

**Responsive Adaptations:**
- **Mobile (320-767px):** Card full-width with 16px margins, logo 60x60px
- **Tablet (768-1023px):** Card max-width 400px, centered
- **Desktop (1024px+):** Card max-width 400px, centered, decorative background pattern

**Accessibility:**
- Keyboard navigation: Tab order follows form elements
- Focus indicators: 2px pink outline on focused inputs
- Screen reader labels for all inputs
- Error messages announced to screen readers
- Minimum touch target 44x44px for all interactive elements

**Micro-interactions:**
- Input focus: Smooth border transition (0.2s ease)
- Password toggle: Eye icon opacity change on hover
- Button hover: Slight scale increase (1.02) with color change
- Form submission: Button loading spinner with 0.3s fade-in

---

#### Screen 2: Customer Dashboard (Home)

**Design Prompt:**

Design a mobile-first dashboard for customers of a beauty salon that displays upcoming appointments, quick actions, and recent activity:

**Header/Top Bar:**
- Fixed top navigation bar (height 56px, white background, bottom border 1px #E0E0E0)
- Left: Hamburger menu icon (24x24px) for sidebar navigation (mobile) / Salon logo (desktop)
- Center: "Dashboard" title (18px, bold, #212121)
- Right: Notification bell icon (24x24px) with red badge showing unread count
- Status bar shows current time and connection status

**Welcome Section:**
- Personalized greeting below header (padding 24px): "Welcome back, Maria! 👋"
- Customer first name in bold
- Waving hand emoji adds friendly tone
- Subtle wave animation on emoji (optional enhancement)

**Upcoming Appointment Card:**
- Prominent card below welcome (white background, 8px radius, shadow 0 2px 8px rgba(0,0,0,0.1))
- Card header: "UPCOMING APPOINTMENT" (12px uppercase, bold, #757575)
- Appointment details stacked vertically with icons:
  - 💅 "Gel Manicure" (20px, bold, #212121)
  - 📅 "Apr 16, 2026" (16px, #757575)
  - 🕐 "2:00 PM" (16px, #757575)
  - 👤 "Technician: Anna" (16px, #757575)
- Each icon 20x20px, aligned left with 8px spacing to text
- Divider line (1px #E0E0E0) separating details from action button
- "View Details" button at bottom:
  - Outline style: Pink border (#E91E8C), pink text, transparent background
  - Full-width, height 40px, 8px radius
  - Hover/fill state: Pink background, white text
- If no upcoming appointments: Show empty state with illustration (calendar icon with plus sign), friendly message "No upcoming appointments", "Book Now" button in primary pink

**Quick Actions Section:**
- Section title: "Quick Actions" (18px, bold, #212121, margin-top 24px)
- 2x2 grid of action cards:
  - Each card: White background, 8px radius, shadow, padding 16px
  - Icon top-left (32x32px, pink background circle #FCE4F3, icon #E91E8C)
  - Title below icon (14px, bold, #212121)
  - Cards arranged in responsive grid
  - Card 1: 📅 "Book Now"
  - Card 2: 📋 "My Appointments"
  - Card 3: 👤 "Profile"
  - Card 4: ⭐ "Leave a Review"
- Hover/tap effect: Card lifts slightly (shadow increases, translateY -2px)
- Tap navigates to respective page

**Recent Activity Section:**
- Section title: "Recent Activity" (18px, bold, #212121, margin-top 24px)
- Activity list items (no card background, just list with dividers):
  - Each item: Left-aligned icon, text content, right-aligned timestamp
  - Example 1: 
    - ✓ Green circle icon (completed)
    - "Completed - Gel Manicure with Anna" (14px, #212121)
    - "⭐⭐⭐⭐⭐" star rating shown if reviewed
    - "Apr 10" (12px, #757575, right-aligned)
  - Divider line (1px #E0E0E0) between items
  - Example 2: Similar structure for past appointments
- "View All" link at bottom (14px, pink #E91E8C)
- Shows last 5 activities, paginated or infinite scroll

**Bottom Navigation Bar (Mobile Only):**
- Fixed bottom bar (height 64px, white background, top border 1px #E0E0E0)
- 5 evenly-spaced tabs with icon + label:
  - 🏠 "Home" (active: pink icon, pink text)
  - 📅 "Book" (inactive: gray icon #757575)
  - 📋 "Appointments"
  - 👤 "Profile"
  - 🔔 "Notifications" (with badge if unread)
- Active tab highlighted with pink color
- Tap navigates to respective section
- Safe area padding for notched phones (iPhone notch, etc.)

**States & Variations:**
- **Empty State (No Appointments):** Large illustration, "Book your first appointment" message, prominent "Book Now" button
- **Loading State:** Skeleton screens for each section (gray pulsing rectangles)
- **Error State:** Full-screen error with retry button if API fails
- **Offline State:** Banner at top "You're offline. Some features may not work."

**Responsive Adaptations:**
- **Mobile:** Bottom navigation, single-column layout, full-width cards
- **Tablet:** Left sidebar navigation (collapsible), 2-column quick actions grid
- **Desktop:** Fixed left sidebar (240px width), main content area with max-width 1200px, quick actions in 4-column row, recent activity as data table

**Data Visualization Notes:**
- No charts on this screen
- Progress indicators only in appointment card status
- Focus on scannable, card-based information hierarchy

---

#### Screen 3: Service Catalog Browser

**Design Prompt:**

Create an browsable service catalog for a beauty salon with category filtering, search, and package deal highlights:

**Header:**
- Top bar (56px height, white background):
  - Left: Back arrow icon (if navigated from booking) OR hamburger menu
  - Center: "Services" title (18px, bold)
  - Right: Search icon (magnifying glass), Shopping cart icon (if multi-service booking enabled)
- Sticky header remains visible on scroll

**Category Filter Tabs:**
- Horizontal scrollable tabs below header (white background, bottom border):
  - Tabs: "All", "Nails", "Hair", "Waxing", "Lashes"
  - Active tab: Pink underline (2px, #E91E8C), pink text
  - Inactive tabs: Gray text (#757575)
  - Tab padding: 16px horizontal, 12px vertical
  - Swipeable on mobile
  - Tap filters service list instantly (smooth animation)

**Service Cards List:**
- Vertical scrollable list of service cards:
- Each card specifications:
  - White background, 8px radius, shadow (0 2px 8px rgba(0,0,0,0.08))
  - Padding: 16px all sides
  - Margin-bottom: 12px between cards
  - Left: Service icon in circle (48x48px, pink background #FCE4F3, icon #E91E8C)
  - Middle (flex-grow):
    - Service name (16px, bold, #212121)
    - Duration and price on same line (14px, #757575): "60 min • ₱500"
    - Description below (14px, #757575, max 2 lines, ellipsis overflow)
  - Badges on top-right corner of card:
    - ⭐ Popular: Blue badge (#2196F3, white text, 4px radius)
    - 🔥 Trending: Orange badge (#FF9800, white text)
  - Right: "Select" button (or "+" icon for add to booking):
    - Outline style: Pink border, pink text
    - Height 32px, padding 8px 16px
    - Hover: Pink background fill
    - Click adds to booking (shows checkmark confirmation)
  - Full card clickable → navigates to service details page

**Package Deals Section:**
- Section header after regular services (margin-top 32px):
  - 📦 Icon (24x24px)
  - "Package Deals" title (20px, bold)
  - Subtitle: "Save more with bundles!" (14px, #757575)
- Package cards (distinct styling from service cards):
  - Gradient background: Light pink to white (#FCE4F3 to #FFFFFF)
  - Pink left border (4px, #E91E8C)
  - Package name (16px, bold)
  - Duration and discounted price: "120 min • ₱900"
  - Savings callout: "Save ₱100!" (green text, bold, 14px)
  - Description below
  - "Select" button same as service cards
  - Visual distinction makes packages stand out

**Search Functionality:**
- Search icon in header opens search bar (slides down from header):
  - Full-width input field (height 48px, pink border when focused)
  - Placeholder: "Search services..."
  - Clear (X) button on right when typing
  - Real-time filtering as user types (debounced 300ms)
  - No results state: "No services found" with suggestion "Try a different search term"
  - Search history: Recent searches shown below input (chip tags, dismissible)

**States & Variations:**
- **Loading State:** Skeleton cards (gray rectangles pulsing)
- **Empty Filter State:** "No services in this category yet" with friendly illustration
- **Error State:** "Unable to load services. Please check your connection." with retry button
- **Offline State:** Cached services shown with banner "Showing offline data"

**Responsive Adaptations:**
- **Mobile:** Single column, cards full-width, bottom padding for scroll
- **Tablet:** 2-column grid of service cards, side-by-side layout
- **Desktop:** 3-column grid, filters in left sidebar instead of top tabs, packages in featured section at top

**Interaction Details:**
- Tap "Select" → Button changes to checkmark ✓ (green), card added to booking
- Scroll → Header stays sticky, tabs may collapse to icon-only on small screens
- Category tap → Smooth scroll to first service in that category
- Package card hover → Slight scale up (1.02) with shadow increase

---

#### Screen 4: Appointment Booking - Date & Time Selection

**Design Prompt:**

Design a multi-step date and time selection interface for booking a salon appointment:

**Context Indicator:**
- Progress bar at top (4px height, full-width):
  - Step 1 (completed): ✓ Green circle with checkmark
  - Step 2 (completed): ✓ Green circle
  - Step 3 (active): Pink circle with "3" inside
  - Step 4 (inactive): Gray circle with "4"
- Connected by lines (gray for incomplete, green for complete)
- Below progress bar: "Step 3 of 4: Select Date & Time" (14px, #757575)

**Booking Summary (Sticky Card):**
- Compact summary card at top (white background, pink left border 4px, shadow):
  - "Selected Service:" label (12px, #757575)
  - 💅 "Gel Manicure • 60 min" (16px, bold, #212121)
  - 👤 "Technician: Anna (optional)" (14px, #757575)
  - Tap to edit service or technician (navigates back)
- Summary remains visible while scrolling calendar

**Date Selection - Calendar Component:**
- Section title: "Select Date" (18px, bold, #212121, margin-top 24px)
- Calendar widget:
  - Month/Year header with navigation arrows: "◀ Apr 2026 ▶"
  - Days of week header: "Su Mo Tu We Th Fr Sa" (12px, #757575)
  - Date grid (7 columns):
    - Past dates: Grayed out, disabled (color #E0E0E0, cursor not-allowed)
    - Available dates: Black text, tappable
    - Selected date: Pink circle background (#E91E8C), white text
    - Unavailable dates (fully booked): Strikethrough or X mark, disabled
    - Weekends: Highlighted with pink dot below date number
    - Today: Pink border around date circle (not filled)
  - Calendar shows current month + next 13 days (14-day booking window)
  - Month navigation limited: Cannot go beyond 14 days from today
  - Tap date → Highlights pink, triggers time slot loading
- Below calendar: "[Selected: April 16, 2026 - Thursday]" confirmation text (14px, green)

**Time Slot Selection:**
- Section title: "Available Times" (18px, bold, margin-top 24px)
- Time slots displayed as chip buttons:
  - Grid layout: 3 columns on mobile, 6 columns on desktop
  - Each chip: Pill shape (height 44px, border-radius 22px)
  - Available: White background, pink border (#E91E8C), black text
  - Selected: Pink background (#E91E8C), white text
  - Unavailable: Gray background (#E0E0E0), gray text, disabled
  - Times displayed: "12:00 PM", "1:00 PM", "2:00 PM", etc.
  - Tap chip → Selects time, deselects previous selection
  - Smooth transition animation (0.2s)
- Loading state: Skeleton chips (gray pulsing) while fetching availability
- No availability state: "No available times for this date" with suggestion "Try a different date"

**Continue Button:**
- Fixed bottom bar (mobile) OR inline button (desktop):
  - Full-width button (height 56px, pink background, white bold text)
  - Text: "CONTINUE" (16px, uppercase)
  - Disabled state: Gray background, disabled until both date AND time selected
  - Enabled state: Pink background, hover darkens slightly
  - Loading state: Spinner when submitting booking
- Safe area padding on mobile (above home indicator on iPhone)

**States & Validations:**
- **Initial State:** No date/time selected, Continue button disabled
- **Date Selected Only:** Time slots loading spinner, Continue still disabled
- **Date + Time Selected:** Continue button enabled, summary updates with selection
- **Time Becomes Unavailable:** If slot taken while user deciding, chip grays out, shows toast "This time slot was just booked. Please select another."
- **Error State:** Calendar/times fail to load → "Unable to load availability. Please refresh."

**Responsive Adaptations:**
- **Mobile:** Vertical layout, calendar full-width, 3-column time chips, fixed bottom Continue button
- **Tablet:** Calendar and time slots side-by-side (2 columns), 4-column time chips
- **Desktop:** Horizontal layout: Calendar left, time slots right, 6-column time chips, Continue button inline below

**Micro-interactions:**
- Date tap → Pink circle appears with smooth scale animation (0.8 → 1.0)
- Time chip tap → Color transition white→pink with 0.2s ease
- Continue button enable → Gray→pink gradient transition
- Selection change → Summary card updates with smooth text transition

---

#### Screen 5: My Appointments List

**Design Prompt:**

Design an appointment management screen for customers to view upcoming and past salon appointments:

**Header:**
- Top bar (56px):
  - Left: Back arrow or hamburger
  - Center: "My Appointments" (18px, bold)
  - Right: Filter icon (funnel), Search icon (magnifying glass)
- Sticky on scroll

**Tab Navigation:**
- Two tabs below header (white background, bottom border):
  - "Upcoming" (active: pink underline, pink text)
  - "History" (inactive: gray text)
- Full-width tabs, equal width (50% each)
- Tap switches between views
- Active tab shows relevant appointments

**Upcoming Appointments Tab:**
- Vertical list of appointment cards:
- Each card design:
  - White background, 8px radius, shadow (0 2px 8px)
  - Padding: 16px
  - Top row:
    - Left: Service icon in circle (💅 32x32px, pink background)
    - Middle: Service name "Gel Manicure" (16px, bold)
    - Right: Status badge:
      - "Confirmed": Green badge (#4CAF50, white text, 4px radius)
      - "Pending": Orange badge (#FF9800, white text)
  - Details rows (icon + text, stacked):
    - 📅 "Apr 16, 2026" (14px, #757575)
    - 🕐 "2:00 PM - 3:00 PM" (14px)
    - 👤 "With Anna" (14px)
  - Divider line (1px #E0E0E0, margin 16px 0)
  - Action buttons row:
    - "Reschedule" button: Outline style (pink border, pink text)
    - "Cancel" button: Text only, red (#F44336)
    - Buttons equal width, 8px spacing between
  - Swipe actions on mobile (optional):
    - Swipe left → Cancel (red background)
    - Swipe right → Reschedule (pink background)
- Cards ordered chronologically (nearest first)
- Past appointments auto-move to History tab

**History Tab:**
- Same card design as Upcoming
- Additional information on cards:
  - Star rating displayed if reviewed (⭐⭐⭐⭐⭐)
  - "View Receipt" button added to actions
  - "Leave a Review" button if not yet reviewed
  - Status shows: "Completed", "Cancelled", "No-show"
- Ordered reverse chronologically (most recent first)
- Older appointments (6+ months) collapsible or paginated

**Filter & Search:**
- Filter icon opens filter panel (slides down):
  - Filter by: Status (checkboxes: Confirmed, Pending, Completed, Cancelled)
  - Filter by: Service type (dropdown)
  - Filter by: Date range (date picker)
  - Filter by: Technician (dropdown)
  - "Apply Filters" button (pink, full-width)
  - "Clear All" link (gray, text only)
- Search icon opens search bar:
  - Search by service name, technician name, date
  - Real-time results as user types
  - Clear button to reset search

**Empty States:**
- **No Upcoming Appointments:**
  - Large illustration: Calendar with question mark
  - "No upcoming appointments" (18px, bold)
  - "Book your next appointment to get started!" (14px, #757575)
  - "Book Now" button (pink, primary)
- **No History:**
  - Illustration: Clock icon
  - "No appointment history" (18px, bold)
  - "Your completed appointments will appear here" (14px, #757575)
- **Filtered Empty State:**
  - "No appointments match your filters"
  - "Clear filters" link

**Loading & Error States:**
- Loading: Skeleton cards (3 placeholders, pulsing gray)
- Error: "Unable to load appointments" with retry button
- Offline: Cached appointments shown with "Offline mode - data may be outdated" banner

**Bottom Navigation (Mobile):**
- Same as Dashboard (Home, Book, Appointments, Profile, Notifications)
- Appointments tab highlighted pink (active)

**Responsive Adaptations:**
- **Mobile:** Single column, full-width cards, bottom nav, swipe actions
- **Tablet:** 2-column card grid, left sidebar navigation
- **Desktop:** Data table view instead of cards:
  - Columns: Date, Time, Service, Technician, Status, Actions
  - Sortable headers
  - Row hover highlights
  - Bulk actions (cancel multiple)

**Interactions:**
- Tap card → Navigates to appointment details page
- Tap Reschedule → Opens booking flow with pre-filled service/technician
- Tap Cancel → Confirmation dialog ("Are you sure? Cancellation within 24 hours may affect your booking privileges.")
- Tap View Receipt → Opens receipt modal/PDF
- Pull down to refresh → Spinner at top, reloads data

---

### 4.3 Staff-Facing Screens

#### Screen 6: Staff Dashboard - Today's Schedule

**Design Prompt:**

Design a staff dashboard for salon technicians to manage their daily schedule and track performance:

**Header:**
- Top bar (56px, white background):
  - Left: Hamburger menu icon
  - Center: "Today" (18px, bold) with date "Apr 14, 2026" below (12px, #757575)
  - Right: Notification bell, Settings gear icon
- Sticky on scroll

**Welcome & Check-In Section:**
- Greeting card below header (gradient background pink to white, padding 24px):
  - "Good morning, Anna! ☀️" (20px, bold, white text on pink gradient)
  - Current date: "Today: Apr 14, 2026" (14px, white)
  - Dynamic greeting changes based on time (morning/afternoon/evening)
- Check-In button (if not yet checked in):
  - Full-width, height 48px, green background (#4CAF50), white bold text
  - "✅ CHECK IN" text with checkmark icon
  - Tap → Changes to "✓ Checked In at 12:05 PM" (disabled, gray)
  - Timestamp recorded automatically
  - If already checked in: Shows check-in time in header

**Today's Schedule Timeline:**
- Section title: "Today's Schedule" (18px, bold, margin-top 24px)
- Vertical timeline layout:
  - Left column: Time labels (12:00 PM, 2:00 PM, 4:00 PM)
  - Vertical line connecting times (2px, #E0E0E0)
  - Right side: Appointment cards at each time slot
- Appointment card designs:
  - **Pending Appointment:**
    - White background, left border orange (4px, #FF9800)
    - Top row: Customer name "💅 Maria Santos" (16px, bold)
    - Service: "Gel Manicure" (14px, #757575)
    - Status badge: "⏳ Pending" (orange badge)
    - Action buttons: "View" (outline pink), "Approve" (solid pink)
    - Tap View → Opens appointment details
    - Tap Approve → Confirmation dialog → Status changes to Confirmed
  - **Confirmed Appointment:**
    - White background, left border green (4px, #4CAF50)
    - Customer name, service, time displayed
    - Status badge: "✓ Confirmed" (green badge)
    - Action button: "View" only
    - "Start Service" button appears 10 min before appointment time
  - **In-Progress Appointment:**
    - Left border blue (4px, #2196F3)
    - Status badge: "🔄 In Progress" (blue badge)
    - "Complete Service" button (green)
    - Timer showing elapsed time (optional)
  - **Completed Appointment:**
    - Left border gray (4px, #E0E0E0)
    - Status badge: "✓ Completed" (gray badge)
    - Shows payment status: "Paid ₱500" or "Payment Pending"
    - "Add Notes" button
  - **Available Slot (No Booking):**
    - Dashed border card (2px, #E0E0E0)
    - Background: Light gray (#FAFAFA)
    - "[Available]" text (14px, #757575)
    - "+ Add Walk-In" button (outline pink)
    - Tap → Opens quick walk-in booking form
- Cards ordered chronologically
- Past appointments collapse into "Completed" section (expandable)
- Future appointments show with upcoming time indicator

**Today's Progress Widget:**
- Card below schedule (white background, shadow, padding 16px):
  - Title: "Today's Progress" (16px, bold)
  - Commission earned: "₱450" (32px, bold, pink #E91E8C)
  - Subtitle: "Commission Earned" (14px, #757575)
  - Daily Target Progress:
    - Label: "Daily Target" (14px, #757575)
    - Progress bar: Horizontal bar (height 8px, light gray background #E0E0E0, pink fill proportional)
    - "[░░░░░░░░░░░░░░░░░] 8%" (pink fill width 8%)
    - "₱450 / ₱6,000" below bar (12px, #757575)
  - Services completed: "Services: 2/8" (14px, bold)
  - Tap widget → Navigates to full Performance dashboard
- Progress updates in real-time as payments recorded

**Quick Actions (Floating or Bottom):**
- For pending appointments: "Approve All" button (pink, appears if 2+ pending)
- End of shift: "Check Out" button (red outline, appears after all appointments completed)

**Bottom Navigation (Mobile):**
- 4 tabs: 📅 Schedule (active), 👥 Customers, 📊 Performance, 🔔 Notifications
- Schedule tab highlighted pink

**States & Variations:**
- **Empty Day (No Appointments):**
  - Illustration: Calendar with checkmark
  - "No appointments today" (18px, bold)
  - "Enjoy your free time or check for walk-ins" (14px)
  - "+ Add Walk-In" button
- **Loading State:** Skeleton timeline items
- **Error State:** "Unable to load schedule" with retry
- **Offline State:** Cached schedule with warning banner

**Responsive Adaptations:**
- **Mobile:** Vertical timeline, single-column, bottom nav, swipe actions on cards
- **Tablet:** Timeline left, details panel right (split view), sidebar navigation
- **Desktop:** Full calendar view (like Google Calendar), drag-and-drop rescheduling (manager only), sidebar navigation, multi-day view toggle

**Interactions:**
- Tap appointment → Expands card showing full details and customer info
- Swipe right on card → Quick "Start Service" action
- Swipe left → Quick "No-show" or "Cancel"
- Pull down to refresh → Reloads schedule from server
- Approve tap → Confirmation modal → Success animation (checkmark) → Card updates

---

#### Screen 7: Staff Performance Dashboard

**Design Prompt:**

Design a performance tracking dashboard for salon staff to view commission earnings, targets, and transaction history:

**Header:**
- Top bar (56px):
  - Left: Back arrow
  - Center: "Performance" (18px, bold)
  - Right: Export icon (download), Date range selector
- Sticky on scroll

**Today's Earnings Card:**
- Prominent card at top (gradient background pink to white, padding 24px, white text):
  - Title: "Today's Earnings" (14px, white, uppercase)
  - Commission amount: "₱450.00" (48px, bold, white)
  - Subtitle: "Commission Earned" (14px, white, 80% opacity)
  - Divider line (1px, white, 30% opacity, margin 16px 0)
  - Daily Target Section:
    - Label: "Daily Target" (12px, white, 80% opacity)
    - Progress bar (height 12px, white background 30% opacity, pink fill #FFFFFF)
    - Progress text overlay on bar: "₱450 / ₱6,000 (8%)" (12px, bold)
    - Motivational message below: "Keep going! You're on track" (12px, white)
- Card has subtle shadow, rounded corners (8px)

**This Week Summary Card:**
- White background card below (shadow, padding 16px):
  - Title: "This Week" (16px, bold, margin-bottom 12px)
  - Stats grid (2x2):
    - Each stat: Label above, value below
    - Stat 1:
      - "Total Sales" (12px, #757575)
      - "₱4,500" (20px, bold, #212121)
    - Stat 2:
      - "Commission" (12px)
      - "₱450 (10%)" (20px, bold, pink #E91E8C)
    - Stat 3:
      - "Tier Level" (12px)
      - "Base Rate" (16px, bold, orange #FF9800)
    - Stat 4:
      - "Services" (12px)
      - "9" (20px, bold)
  - Divider (1px #E0E0E0, margin 16px 0)
  - Weekly tier progress explanation:
    - "Next tier at ₱8,000 weekly sales" (14px, #757575)
    - Mini progress bar showing current position
    - "Earn 12% commission at next tier" (12px, green)

**Recent Transactions List:**
- Section title: "Recent Transactions" (18px, bold, margin-top 24px)
- Vertical list of transaction items:
- Each item design:
  - No card background, just list with bottom border (1px #E0E0E0)
  - Padding: 12px vertical
  - Left: Service icon in circle (24x24px, pink background)
  - Middle (flex-grow):
    - Date and service name: "Apr 14 • Gel Manicure" (14px, bold)
    - Amount and commission: "₱500 • Commission: ₱50" (12px, #757575)
    - Commission breakdown: "10% rate" (12px, gray)
  - Right: Status badge
    - "Paid": Green badge
    - "Pending": Orange badge
  - Tap item → Opens transaction details modal
- Shows last 10 transactions
- "Load More" button at bottom if more exist

**Date Range Selector:**
- Dropdown or calendar range picker at top right of header
- Preset ranges: "Today", "This Week", "This Month", "Custom"
- Tap "Custom" → Opens date range picker (start date, end date)
- Selection updates all data on dashboard
- Range displayed in header: "Apr 1 - Apr 14, 2026"

**View Full Report Button:**
- Fixed at bottom or inline after transactions:
  - Full-width button (height 48px, outline pink):
  - "View Full Report" text
  - Tap → Opens detailed commission report (exportable to PDF/CSV)

**States & Variations:**
- **No Data Yet (First Day):**
  - "No transactions recorded yet today" (14px, #757575)
  - "Start serving customers to see your earnings!" (12px)
  - Illustration: Money bag with plus sign
- **Loading State:** Skeleton cards and list items
- **Error State:** "Unable to load performance data" with retry
- **End of Day Summary:** If shift ended, shows daily summary with celebration animation (confetti if target met)

**Responsive Adaptations:**
- **Mobile:** Single column, stacked stats (2x2 grid), bottom-anchored full report button
- **Tablet:** Stats in single row (4 columns), side-by-side layout for cards
- **Desktop:** Data table for transactions with sortable columns, charts showing earnings trend over time (line chart), comparison with previous periods

**Data Visualization:**
- Progress bars for targets (linear, clear labels)
- Future enhancement: Line chart showing daily earnings trend
- Future enhancement: Bar chart comparing weekly performance
- Color-coded tiers: Green (meeting target), Orange (approaching), Red (behind)

**Interactions:**
- Tap transaction → Modal slides up showing full details
- Pull down to refresh → Reloads data, shows last updated time
- Date range change → Smooth transition with loading skeleton
- Export tap → Download options modal (PDF, CSV, Print)

---

### 4.4 Manager-Facing Screens

#### Screen 8: Manager Dashboard

**Design Prompt:**

Design a comprehensive manager dashboard for salon owners to monitor daily operations, staff performance, and business metrics:

**Header:**
- Top bar (56px, white background, shadow):
  - Left: Hamburger menu (or logo on desktop)
  - Center: "Dashboard" (18px, bold)
  - Right: Notification bell (with badge), Quick actions (+ icon)
- Sticky on scroll
- Desktop: Fixed top bar with search

**Welcome & Date Selector:**
- Greeting below header (padding 24px):
  - "Good morning, Sir Robert!" (24px, bold)
  - Date: "Today: Apr 14, 2026" (14px, #757575)
  - Date picker icon on right to change view date

**Key Metrics Grid:**
- 2x2 grid of metric cards (responsive, equal height):
- Each card design:
  - White background, 8px radius, shadow (0 2px 8px)
  - Padding: 20px
  - Icon in circle top-left (40x40px, colored background):
    - Sales: Pink background (#FCE4F3), peso sign icon
    - Appointments: Blue background, calendar icon
    - Staff In: Green background, people icon
    - Target: Orange background, trophy icon
  - Metric value: Large, bold (32px, #212121)
    - "₱3,200" (Sales)
    - "8" (Appointments)
    - "6/8" (Staff In - fraction shows present/total)
    - "75%" (Target %)
  - Metric label: Below value (14px, #757575)
    - "Sales Today"
    - "Total Appointments"
    - "Staff Checked In"
    - "Target Progress"
  - Tap card → Navigates to detailed view
  - Hover effect: Card lifts, shadow increases
- Grid adapts to screen size (mobile: 2x2, desktop: 4 in row)

**Team Target Progress Widget:**
- Full-width card below metrics (white, shadow, padding 20px):
  - Title: "Team Target Progress" (16px, bold)
  - Subtitle: "Daily break-even goal: ₱8,000" (12px, #757575)
  - Large progress bar (height 16px, full-width):
    - Background: Light gray (#E0E0E0)
    - Fill: Pink (#E91E8C) proportional to progress
    - 40% filled: "[████████░░░░░░░░░░░░] 40%"
    - Milestone markers on bar: 25%, 50%, 75%, 100%
    - Current value marker: Pink flag on bar showing position
  - Below bar:
    - "₱3,200 / ₱8,000" (16px, bold)
    - "₱4,800 more to reach break-even" (14px, #757575)
    - Estimated time to goal: "On track to hit target by 6:00 PM" (12px, green)
    - If behind: "Behind pace. Need ₱800/hour to hit target" (12px, orange)
  - Tap widget → Opens detailed sales report

**Alerts & Notifications Widget:**
- Card with alert items (margin-top 24px):
  - Title: "Alerts" (16px, bold, margin-bottom 12px)
  - Alert items stacked vertically:
    - Each alert:
      - Left: Alert icon (⚠️ warning, ℹ️ info, ✅ success)
      - Middle: Alert message (14px)
        - "⚠️ 2 appointments pending approval" (orange text)
        - "ℹ️ Team at 40% of daily target" (blue text)
        - "✅ All staff checked in" (green text, if applicable)
      - Right: Timestamp ("5 min ago")
      - Tap alert → Navigates to relevant page
      - Dismissable: Swipe left or tap X to dismiss
  - Badge showing unread alert count on widget title
  - "View All Alerts" link at bottom (14px, pink)

**Top Services Today Widget:**
- Card showing service performance (white, shadow, padding):
  - Title: "Top Services Today" (16px, bold)
  - Ranked list:
    - Each service:
      - Rank number (1, 2, 3...) in circle (24x24px, pink background, white text)
      - Service name: "Gel Manicure" (14px, bold)
      - Booking count: "(4)" (14px, #757575)
      - Mini bar showing relative popularity (proportional width)
    - Services ranked by number of bookings today
  - Shows top 5 services
  - "View All Services" link → Service analytics page

**Staff Performance Widget:**
- Card showing individual staff performance (white, shadow, padding):
  - Title: "Staff Performance" (16px, bold)
  - Horizontal bar chart for each staff member:
    - Staff name: "Anna" (14px, bold)
    - Sales amount: "₱2,100" (14px, #757575)
    - Horizontal bar (height 12px, proportional to highest earner):
      - Anna: "[██████████░░░░░░░░] █████░" (pink fill)
      - Maria: "[████████░░░░░░░░░░] ███░░░" (lighter pink)
    - Visual comparison makes it easy to see top performers
  - Tap staff name → Opens staff details page
  - "View Full Staff Report" link at bottom
  - Sortable by: Sales, Commission, Services Completed, Attendance

**Quick Actions Section:**
- Grid of action buttons (2 columns on mobile, 4 on desktop):
  - Each action:
    - Icon in large circle (56x56px, pink background, white icon)
    - Label below (14px, bold, centered)
    - Card background (white, shadow, padding 16px)
    - Tap navigates to action page
  - Actions:
    - 📅 "Add Walk-In"
    - 📊 "View Reports"
    - 👥 "Manage Staff"
    - 💰 "Payroll"
    - 🛎️ "Service Management"
    - ⚙️ "Settings"
  - Quick access to most-used manager functions

**Bottom/Sidebar Navigation:**
- Mobile: Bottom nav (5 tabs: Dashboard, Appointments, Staff, Reports, More)
- Desktop: Fixed left sidebar (240px width) with full navigation menu
- "More" tab on mobile reveals additional manager-only pages

**States & Variations:**
- **Before Opening (Before 12 PM):**
  - "Salon opens in X hours" countdown
  - Yesterday's summary shown instead
  - Staff check-in starts appearing as they arrive
- **After Closing (After 10 PM):**
  - End-of-day summary automatically generated
  - "Today's Final Numbers" displayed
  - Comparison with yesterday and same day last week
  - "View Detailed Report" prominent button
- **Loading State:** Skeleton metrics and cards
- **Error State:** "Unable to load dashboard data" with retry, shows cached data if available
- **No Data (First Day):** Friendly onboarding "Your dashboard will populate as appointments are recorded"

**Responsive Adaptations:**
- **Mobile:** Single column, 2x2 metric grid, stacked widgets, bottom navigation, simplified charts
- **Tablet:** 2-column layout for widgets, sidebar navigation (collapsible), metric grid expands to 4 columns
- **Desktop:** Fixed sidebar, multi-column dashboard (bento grid layout), interactive charts with hover tooltips, data tables instead of simple lists, keyboard shortcuts

**Data Visualization:**
- Progress bars for targets (linear, labeled)
- Horizontal bar charts for staff comparison
- Future enhancement: Line chart for sales trends
- Future enhancement: Pie chart for service distribution
- Color-coding: Green (good), Orange (warning), Red (critical), Pink (brand)

**Interactions:**
- Tap metric card → Drill-down to detailed report
- Tap alert → Navigate to issue, auto-dismisses
- Tap staff name → Staff profile slides in
- Pull down to refresh → All widgets reload, shows last updated timestamp
- Quick action tap → Navigates to page, maintains context

---

#### Screen 9: Sales Report & Analytics

**Design Prompt:**

Design a comprehensive sales analytics page for salon managers to view detailed revenue breakdowns, trends, and performance insights:

**Header:**
- Top bar (56px):
  - Left: Back arrow
  - Center: "Sales Report" (18px, bold)
  - Right: Download icon (export), Print icon
- Sticky on scroll

**Date Range Selector:**
- Prominent selector below header (white card, padding 16px):
  - Label: "Date Range" (14px, #757575)
  - Two date inputs side-by-side:
    - "From: [Apr 1, 2026] 📅"
    - "To: [Apr 14, 2026] 📅"
  - "Apply" button (pink, height 40px)
  - Preset ranges as chips above inputs:
    - "Today", "This Week", "This Month", "Last Month", "Custom"
    - Active preset highlighted pink
  - Tap date → Opens calendar picker
  - Apply updates all report data

**Summary Statistics Card:**
- Card at top (white, shadow, padding 20px):
  - Title: "Summary" (16px, bold, margin-bottom 16px)
  - Stats grid (2x2 on mobile, 4 in row on desktop):
    - Each stat:
      - Label (12px, #757575, uppercase)
      - Value (24px, bold, #212121)
      - Icon subtle background
    - Stat 1:
      - 💰 "Total Sales"
      - "₱42,500"
    - Stat 2:
      - 📊 "Transactions"
      - "85"
    - Stat 3:
      - 📈 "Average"
      - "₱500"
    - Stat 4:
      - 🎯 "Daily Average"
      - "₱3,036"
  - Divider (1px #E0E0E0, margin 16px 0)
  - Booking source breakdown:
    - Label: "Booking Source" (14px, bold)
    - Two stats inline:
      - "Online: 35 (41%)" (blue badge)
      - "Walk-in: 50 (59%)" (gray badge)
    - Mini pie chart or donut chart visual (optional)

**Sales Trend Chart:**
- Card with chart visualization (white, shadow, padding):
  - Title: "Sales Trend" (16px, bold)
  - Subtitle: "Apr 1-14 Daily Sales" (12px, #757575)
  - Line chart (using Chart.js):
    - X-axis: Dates (Apr 1, 2, 3... 14)
    - Y-axis: Sales amount (₱0 to ₱6,000)
    - Line: Pink (#E91E8C), 2px thickness, smooth curve
    - Data points: Pink circles on each day
    - Hover tooltip: Shows exact date and amount
    - Grid lines: Light gray (#E0E0E0)
    - Fill under line: Light pink gradient (#FCE4F3, 30% opacity)
  - Daily target line: Dashed horizontal line at ₱8,000
  - Annotations: Highlight days with exceptional performance
  - Chart controls: Toggle between daily/weekly/monthly view
  - "Expand" icon → Full-screen chart with more controls

**By Service Breakdown:**
- Card showing service performance (white, shadow, padding):
  - Title: "Revenue by Service" (16px, bold)
  - Horizontal bar chart (sorted by revenue, descending):
    - Each service:
      - Service name: "Gel Manicure" (14px, bold)
      - Revenue: "₱15,000" (14px, right-aligned)
      - Horizontal bar (proportional to max):
        - Fill: Pink gradient
        - Percentage label on bar: "35%"
      - Booking count below: "(30 bookings)" (12px, #757575)
    - Services listed:
      - Gel Manicure: ₱15,000 (35%)
      - Nail Art: ₱12,000 (28%)
      - Hair Spa: ₱8,500 (20%)
      - Others: ₱7,000 (17%)
  - "View Service Details" link → Service analytics page
  - Toggle: View by revenue OR by booking count

**By Staff Performance:**
- Card showing staff sales comparison (white, shadow, padding):
  - Title: "Revenue by Staff" (16px, bold)
  - Staff rows with horizontal bars:
    - Each staff:
      - Avatar or initial in circle (32x32px, pink background)
      - Name: "Anna" (14px, bold)
      - Revenue: "₱18,000" (14px, right-aligned)
      - Horizontal bar (proportional):
        - Color-coded by performance tier
        - Anna: Green (top performer)
        - Maria: Pink (meeting target)
        - Others: Orange/Red (below target)
      - Services completed: "(36 services)" (12px)
  - Sorted by revenue (highest first)
  - Tap staff → Staff performance details

**Export Actions:**
- Fixed or inline buttons at bottom:
  - "Export CSV" button (outline, icon + text)
  - "Export PDF" button (outline, icon + text)
  - "Print Report" button (outline, icon + text)
  - All buttons full-width on mobile, inline on desktop

**States & Variations:**
- **No Data for Range:**
  - "No sales data for selected period" (14px)
  - "Try a different date range" (12px)
  - Illustration: Empty chart
- **Loading State:** Skeleton cards and chart placeholders
- **Error State:** "Unable to load report" with retry, shows last successful data
- **Single Day View:**
  - Shows hour-by-hour breakdown
  - More granular data
  - Appointment-level detail table below

**Responsive Adaptations:**
- **Mobile:** Stacked cards, simplified charts (tap for details), export buttons stacked, touch-friendly chart interactions
- **Tablet:** 2-column chart layout, sidebar for date range, more chart controls visible
- **Desktop:** Multi-chart dashboard, side-by-side comparisons, advanced filtering, data table below charts with sortable columns, drill-down on chart elements

**Data Visualization Guidelines:**
- Chart.js library for all charts
- Consistent pink color palette for brand alignment
- Accessible charts: Patterns + colors for colorblind users
- Tooltips on hover/tap showing exact values
- Responsive charts that resize with window
- Print-friendly chart versions (black & white compatible)

**Interactions:**
- Date range change → All charts animate to new data (0.5s transition)
- Chart tap/click → Expands to full-screen, reveals more controls
- Export tap → Download starts, shows progress
- Tap service/staff → Drill-down to detailed breakdown
- Pull down to refresh → Reloads report data

---

## 5. RESPONSIVE BEHAVIOR SPECIFICATIONS

### 5.1 Customer Booking Flow

```
Start
  │
  ▼
[Landing Page]
  │
  ▼
[Login/Register] ←── Not logged in?
  │
  ▼
[Browse Services]
  │
  ▼
[Select Service(s)]
  │
  ▼
[Select Technician] (Optional)
  │
  ▼
[Select Date]
  │
  ▼
[Select Time Slot]
  │
  ▼
[Review Booking]
  │
  ├── Cancel? ──► [Confirm Cancellation] ──► End
  │
  ▼
[Confirm Booking]
  │
  ▼
[Confirmation Screen]
  │
  ▼
[Notification Sent]
  │
  ▼
End
```

---

### 5.2 Service Delivery Flow (Staff)

```
Start (Staff Logs In)
  │
  ▼
[View Today's Schedule]
  │
  ▼
[Check-In] (if start of shift)
  │
  ▼
[Appointment Time Arrives]
  │
  ▼
[View Appointment Details]
  │
  ├── Customer No-Show? ──► [Mark as No-Show] ──► Continue
  │
  ▼
[Start Service] (Mark as In-Progress)
  │
  ▼
[Perform Service]
  │
  ▼
[Complete Service] (Mark as Completed)
  │
  ▼
[Record Payment]
  │
  ├── Cash? ──► [Confirm Cash Received]
  │
  ├── GCash? ──► [Confirm GCash Received]
  │
  ▼
[Generate Receipt]
  │
  ▼
[Commission Calculated]
  │
  ▼
[Add Service Notes] (Optional)
  │
  ▼
End (Ready for Next Appointment)
```

---

### 5.3 Commission Calculation Flow

```
Start (Payment Recorded)
  │
  ▼
[Get Service Type]
  │
  ├── Hair Service?
  │     │
  │     ▼
  │  [Get Technician's Daily Hair Total]
  │     │
  │     ├── ≥ ₱6,000? ──► [Apply 20% Commission]
  │     │
  │     └── < ₱6,000? ──► [Apply 10% Commission]
  │
  ├── Nails/Lashes/Waxing?
  │     │
  │     ▼
  │  [Apply Flat 10% Commission]
  │
  ▼
[Record Commission]
  │
  ▼
[Update Daily Total]
  │
  ├── ≥ ₱6,000? ──► [Recalculate Earlier Hair Commissions]
  │
  ▼
[Update Weekly Total]
  │
  ▼
[Apply Weekly Tier if Applicable]
  │
  ▼
[Update Staff Dashboard]
  │
  ▼
End
```

---

## 6. RESPONSIVE BREAKPOINTS

### 6.1 Breakpoint Definitions

```
Mobile:     320px - 767px
Tablet:     768px - 1023px
Desktop:    1024px - 1439px
Large:      1440px+
```

### 6.2 Layout Adaptations

**Mobile (320px-767px):**
- Single column layout
- Bottom navigation bar
- Stacked cards
- Full-width buttons
- Collapsible sections

**Tablet (768px-1023px):**
- Two-column layout (where applicable)
- Left sidebar navigation (collapsible)
- Grid cards (2 columns)
- Larger touch targets

**Desktop (1024px+):**
- Multi-column layouts
- Fixed left sidebar navigation
- Data tables instead of cards
- Hover states enabled
- Keyboard shortcuts available

---

## 7. INTERACTION PATTERNS

### 7.1 Loading States

**Skeleton Screens:**
- Used for initial page load
- Mimic final content layout
- Animated shimmer effect

**Spinners:**
- Used for button actions
- Inline loading for forms
- Maximum display: 3 seconds (then show error or retry)

**Progress Indicators:**
- Multi-step flows show progress bar
- Step numbers and labels
- Back button available

### 7.2 Error Handling

**Form Validation:**
- Real-time validation on blur
- Inline error messages below field
- Red border on invalid fields
- Submit button disabled until valid

**System Errors:**
- Toast notification (top-right, 5 seconds)
- Clear error message
- Actionable guidance (what to do next)
- Retry button when applicable

**Empty States:**
- Illustration or icon
- Friendly message
- Call-to-action (e.g., "Book your first appointment")
- Link to relevant section

### 7.3 Success Feedback

**Toast Notifications:**
- Success: Green background, checkmark icon
- Auto-dismiss after 3 seconds
- Dismissible manually

**Confirmation Dialogs:**
- Used for destructive actions (cancel, delete)
- Clear consequences explained
- Require explicit confirmation

---

## 8. ACCESSIBILITY GUIDELINES

### 8.1 WCAG 2.1 AA Compliance

**Perceivable:**
- Color contrast ratio: 4.5:1 minimum
- Text resizing: Up to 200% without loss of functionality
- Alt text for all images and icons
- Form labels associated with inputs

**Operable:**
- All functions accessible via keyboard
- Focus indicators visible (pink outline, 2px)
- No keyboard traps
- Skip navigation link

**Understandable:**
- Clear, simple language
- Predictable navigation
- Input assistance (labels, instructions, error messages)
- Consistent identification

**Robust:**
- Semantic HTML (proper heading hierarchy, ARIA labels)
- Compatible with screen readers
- Valid HTML/CSS

### 8.2 Screen Reader Support

- ARIA labels on all interactive elements
- Role attributes where semantic HTML insufficient
- Live regions for dynamic content (notifications)
- Proper tab order

---

## 9. PROTOTYPING NOTES

### 9.1 Recommended Tools

**Wireframing:**
- Figma (free for students)
- Balsamiq (low-fidelity)

**Prototyping:**
- Figma (interactive prototypes)
- InVision (user testing)

**Design Handoff:**
- Figma Dev Mode
- Zeplin

### 9.2 Prototype Fidelity

**Low-Fidelity (Week 1-2):**
- Paper sketches
- Digital wireframes (grayscale, no styling)
- Focus on layout and flow

**Mid-Fidelity (Week 3-4):**
- Digital mockups with basic styling
- Placeholder content
- Basic interactions (click-through)

**High-Fidelity (Week 5-6):**
- Pixel-perfect designs
- Real content
- Micro-interactions
- Responsive variants
- Ready for development

---

## 10. USABILITY TESTING PLAN

### 10.1 Test Participants

| Role | Count | Recruitment |
|------|-------|-------------|
| Customer | 3 | Friends/family, social media |
| Staff | 2 | NailssentialsQC technicians |
| Manager | 1 | NailssentialsQC manager |

### 10.2 Test Scenarios

**Customer Tests:**
1. Register a new account
2. Book an appointment (gel manicure, preferred technician)
3. Reschedule an appointment
4. Cancel an appointment
5. View booking history
6. Update profile preferences

**Staff Tests:**
1. Log in and check-in for shift
2. View today's schedule
3. Approve a pending appointment
4. Mark appointment as completed
5. Record payment
6. View performance dashboard

**Manager Tests:**
1. View daily sales summary
2. Add a new service
3. View staff performance
4. Generate payroll report
5. Create walk-in appointment

### 10.3 Success Metrics

| Metric | Target |
|--------|--------|
| Task completion rate | > 90% |
| Time on task (booking) | < 3 minutes |
| Error rate | < 5% |
| User satisfaction (SUS) | > 75/100 |
| Critical issues found | 0 |

---

## 11. DESIGN DELIVERABLES

### 11.1 Required Assets

- [ ] Wireframes (all screens, low-fidelity)
- [ ] High-fidelity mockups (all screens, desktop + mobile)
- [ ] Interactive prototype (click-through)
- [ ] Design system documentation
- [ ] Component library (buttons, forms, cards, etc.)
- [ ] Icon set (SVG format)
- [ ] Responsive variants (mobile, tablet, desktop)
- [ ] Empty state designs
- [ ] Error state designs
- [ ] Loading state designs

### 11.2 Handoff to Development

- Figma file with organized layers
- Asset exports (SVG, PNG)
- Style guide (colors, typography, spacing)
- Component specifications
- Interaction notes
- Responsive behavior documentation

---

**Document Status:** Draft - For Review  
**Next Step:** System Architecture Design  
**Prepared by:** SFIT-2B Group 4
