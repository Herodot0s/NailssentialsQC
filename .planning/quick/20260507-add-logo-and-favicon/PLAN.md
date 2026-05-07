# Plan - Add Logo and Favicon

Update `Home.tsx` (via `Hero.tsx`) to include the NailssentialsQC logo and ensure the favicon is set correctly in `index.html`.

## Proposed Changes

### Frontend

#### [Hero.tsx](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/src/components/home/Hero.tsx)
- Import `logo` from `@/assets/img/NailssentialsQC Logo.svg`.
- Add the logo image above the tagline in the Hero section.
- Style the logo to be appropriate (e.g., max-h-16 or similar).

#### [index.html](file:///c:/Users/Administrator/Desktop/nailssentialsqc-system/frontend/index.html)
- Update `<title>` to "NailssentialsQC".
- Ensure `<link rel="icon" ...>` points to the logo if needed, or keep `/favicon.svg` if it's already the logo.

## Verification Plan

### Automated Tests
- None requested for this quick task.

### Manual Verification
- Check the Home page to see if the logo appears in the Hero section.
- Check the browser tab to see the updated title and favicon.
