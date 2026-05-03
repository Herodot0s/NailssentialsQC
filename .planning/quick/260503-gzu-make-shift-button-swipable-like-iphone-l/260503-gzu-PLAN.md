---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/src/components/ui/SwipeButton.tsx
  - frontend/src/pages/StaffDashboard.tsx
autonomous: true
requirements: [QUICK-260503]
user_setup: []
must_haves:
  truths:
    - "Shift button is swipeable like iPhone lock screen"
    - "Swiping to opposite end triggers check-in or check-out"
    - "Visual feedback (progress, icon movement) during swipe"
    - "Shift card has improved visual impact"
    - "Check-in/check-out functionality is preserved (no regression)"
  artifacts:
    - path: frontend/src/components/ui/SwipeButton.tsx
      provides: "Reusable swipeable button component"
      min_lines: 150
    - path: frontend/src/pages/StaffDashboard.tsx
      provides: "Integrated SwipeButton and visual improvements"
      contains: "SwipeButton"
  key_links:
    - from: frontend/src/pages/StaffDashboard.tsx
      to: frontend/src/components/ui/SwipeButton.tsx
      via: "import and usage"
      pattern: "import.*SwipeButton"
---

<objective>
Create a swipeable shift button (mimicking iPhone lock screen) and improve UI visuals in StaffDashboard.tsx. Replace the standard shift button with a reusable SwipeButton component, add visual enhancements to the shift card, and preserve existing check-in/check-out functionality.

Purpose: Improve user experience with intuitive swipe interactions and modernized UI visuals for the staff shift management feature.
Output: SwipeButton.tsx component, updated StaffDashboard.tsx with integrated swipe button and visual improvements.
</objective>

<execution_context>
@C:/Users/Administrator/Desktop/nailssentialsqc-system/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@C:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/pages/StaffDashboard.tsx
@C:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/ui/button.tsx
@C:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/ui/card.tsx
@C:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Reusable SwipeButton Component</name>
  <files>frontend/src/components/ui/SwipeButton.tsx</files>
  <action>
    Create `frontend/src/components/ui/SwipeButton.tsx` as a reusable, generic swipeable button component mimicking iPhone's "slide to unlock" interaction. No external animation libraries are available (framer-motion/react-spring not in dependencies), so use Tailwind CSS transitions and native mouse/touch events.

    1. **Props Interface**: Define TypeScript interface accepting:
       - `isCheckedIn: boolean` (current shift status)
       - `onCheckIn: () => void` (callback for check-in action)
       - `onCheckOut: () => void` (callback for check-out action)
       - `checkInLabel?: string` (default: "Slide to Initialize Shift")
       - `checkOutLabel?: string` (default: "Slide to Check Out")
       - `className?: string` (optional additional styling)

    2. **State Management**:
       - `isDragging: boolean` (tracks active drag state)
       - `thumbPosition: number` (0-100 percentage of track width)
       - `trackWidth: number` (cached track element width)

    3. **Swipe Logic (Native Events)**:
       - Use `useRef` for track container and thumb refs
       - `handleDragStart`: Record initial clientX, set isDragging true, add global mousemove/mouseup and touchmove/touchend listeners
       - `handleDragMove`: Calculate drag distance from start, update thumbPosition as percentage of trackWidth (clamp 0-100)
       - `handleDragEnd`: Remove global listeners, if thumbPosition >= 90% trigger corresponding action (onCheckIn if !isCheckedIn, onCheckOut if isCheckedIn), reset thumbPosition to 0 (if !isCheckedIn) or 100 (if isCheckedIn)
       - Clean up all listeners on component unmount

    4. **Styling (Tailwind CSS)**:
       - Track: `w-full h-14 rounded-none relative overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/10`
       - Thumb: `absolute top-1/2 -translate-y-1/2 size-12 bg-primary shadow-lg transition-all duration-100` (position via `left: ${thumbPosition}%` with `transform: translateX(-${thumbPosition}%)`)
       - Icon: `ChevronRight` (lucide-react) for check-in state, `ChevronLeft` for check-out state, centered in thumb, color primary-foreground
       - Text overlay: Centered `text-[10px] uppercase tracking-widest font-bold text-primary/80` showing appropriate label based on isCheckedIn
       - Progress fill: Track background uses `bg-primary/30` with width proportional to thumbPosition (via inline style `width: ${thumbPosition}%`)
  </action>
  <verify>
    <automated>npx tsc --noEmit frontend/src/components/ui/SwipeButton.tsx 2>&1 | Select-String -Pattern "error" ; if ($LASTEXITCODE -eq 0) { exit 1 } else { exit 0 }</automated>
  </verify>
  <done>SwipeButton.tsx exists, has no TypeScript errors, accepts all required props, implements drag logic with visual feedback, is reusable for future use cases.</done>
</task>

<task type="auto">
  <name>Task 2: Integrate SwipeButton and Apply Visual Improvements</name>
  <files>frontend/src/pages/StaffDashboard.tsx</files>
  <action>
    Update `frontend/src/pages/StaffDashboard.tsx` to integrate the new SwipeButton component and apply visual improvements to the shift card (lines 221-249):

    1. **Import SwipeButton**: Add `import SwipeButton from '@/components/ui/SwipeButton';` (uses existing `@/*` path alias from frontend tsconfig)

    2. **Replace Shift Button**: Remove existing `Button` component (lines 236-242) and replace with:
       ```tsx
       <SwipeButton
         isCheckedIn={status?.isCheckedIn}
         onCheckIn={handleCheckIn}
         onCheckOut={handleCheckOut}
         className="w-full max-w-xs"
       />
       ```

    3. **Shift Card Visual Improvements**:
       - Update outer Card (line 221): Add `bg-gradient-to-br from-primary/5 to-secondary/5 shadow-[0_0_20px_rgba(0,0,0,0.05)]` for more striking appearance
       - Time display (line 227): Change `text-5xl` to `text-6xl font-bold` for larger, bolder typography
       - Pulse animation when checked in: Wrap time display div (lines 223-232) in a conditional `animate-pulse` div when `status?.isCheckedIn` is true
       - Status badge (line 230): Change to `bg-success-color/90 text-white shadow-sm px-3 py-1` for better contrast
       - Preserve all existing layout and responsive behavior

    4. **Backward Compatibility**: Verify `handleCheckIn` and `handleCheckOut` functions remain unchanged and functional.
  </action>
  <verify>
    <automated>cd frontend && npm run build 2>&1 | Select-String -Pattern "error" ; if ($LASTEXITCODE -eq 0) { exit 1 } else { exit 0 }</automated>
    <automated>cd frontend && npm run lint 2>&1 | Select-String -Pattern "error" ; if ($LASTEXITCODE -eq 0) { exit 1 } else { exit 0 }</automated>
  </verify>
  <done>SwipeButton is integrated into StaffDashboard.tsx, visual improvements are applied, build and lint pass with no errors, check-in/check-out functionality is preserved.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client-side component | SwipeButton and StaffDashboard are client-side React components, no sensitive data handled |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Spoofing | SwipeButton | Accept | No user identity or auth checks handled in this component |
| T-quick-02 | Tampering | SwipeButton | Accept | Client-side only, no server communication; tampering has no server-side impact |
| T-quick-03 | Repudiation | StaffDashboard | Accept | No audit logging in this component; existing server-side audit logs remain unchanged |
| T-quick-04 | Information Disclosure | SwipeButton | Accept | No sensitive data stored or processed in the component |
| T-quick-05 | Denial of Service | StaffDashboard | Accept | Unlikely to cause DoS; low-risk client-side component |
| T-quick-06 | Elevation of Privilege | SwipeButton | Accept | No privilege checks handled here; existing auth middleware remains unchanged |
</threat_model>

<verification>
1. SwipeButton component renders correctly with track, draggable thumb, and text
2. Swiping thumb to opposite end (>=90% track width) triggers onCheckIn or onCheckOut
3. Visual feedback (progress fill, icon movement) is visible during swipe
4. Shift card has gradient background, larger time text, pulse animation when checked in
5. Status badge has improved contrast
6. Build (`npm run build:frontend`) and lint (`npm run lint:frontend`) pass with no errors
</verification>

<success_criteria>
1. SwipeButton.tsx is created in frontend/src/components/ui/, reusable with props for isCheckedIn, onCheckIn, onCheckOut, labels
2. SwipeButton is integrated into StaffDashboard.tsx, replacing the existing shift button
3. Swipe interaction works as expected: slide to opposite end triggers check-in/check-out
4. Visual improvements are applied: shift card has better background, larger time text, pulse animation when active, improved status badge
5. No regression in check-in/check-out functionality
6. All automated checks (TypeScript, build, lint) pass
</success_criteria>
