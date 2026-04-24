# Hotfix Report - UI Runtime Crashes

**Project:** NailssentialsQC Salon Management System
**Phase:** 4-Implementation (Post-Sprint 5 Hotfix)
**Date:** April 24, 2026

## 1. Issue Overview
During the final polish and testing of the Shadcn UI pivot, two critical React runtime errors were encountered that caused the application to crash, specifically within the `Navbar` and `NotificationBell` components.

### Error 1: Base UI MenuGroupRootContext Missing
```text
Error: Base UI: MenuGroupRootContext is missing. Menu group parts must be used within <Menu.Group>.
```
**Cause:** The new Shadcn UI v0 implementation utilizing Base UI (`@base-ui/react`) requires `DropdownMenuLabel` (which maps to `MenuPrimitive.GroupLabel`) to be strictly wrapped within a `DropdownMenuGroup` (`MenuPrimitive.Group`). In `Navbar.tsx` and `NotificationBell.tsx`, the labels were placed directly inside `DropdownMenuContent` without the required group context.

### Error 2: Native Button Semantics Violation
```text
button.tsx:48 Base UI: A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.
```
**Cause:** Shadcn's `Button` component, built on Base UI, sets the internal `nativeButton` prop to `true` by default. When developers used the `render` prop to transform the button into an anchor tag or a `<Link>` (e.g., `<Button render={<Link to="/booking" />}>`), Base UI correctly threw a warning/error because a non-button element was receiving button-specific accessibility and event logic without explicit opt-out.

## 2. Implemented Fixes

### Fix for Error 1 (`DropdownMenuLabel`)
1.  **Modified `frontend/src/components/Navbar.tsx`**
    *   Imported `DropdownMenuGroup`.
    *   Wrapped the user profile details `<DropdownMenuLabel>` inside a `<DropdownMenuGroup>`.
2.  **Modified `frontend/src/components/NotificationBell.tsx`**
    *   Imported `DropdownMenuGroup`.
    *   Wrapped the "Notifications" header `<DropdownMenuLabel>` inside a `<DropdownMenuGroup>`.

### Fix for Error 2 (`nativeButton`)
1.  **Modified `frontend/src/components/ui/button.tsx`**
    *   Intercepted the `render` prop.
    *   Conditionally applied `nativeButton={false}` to the underlying `ButtonPrimitive` whenever a `render` prop is provided.
    *   *Implementation Details:*
        ```tsx
        <ButtonPrimitive
          data-slot="button"
          render={render}
          nativeButton={render ? false : undefined}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
        ```

## 3. Verification
*   **Compilation:** The frontend compiles successfully without strict TS errors (`npm run build`).
*   **Stability:** The UI no longer crashes when opening the Navbar dropdowns, interacting with the Notification Bell, or clicking routing Links styled as Buttons.

*The system remains stable and production-ready.*