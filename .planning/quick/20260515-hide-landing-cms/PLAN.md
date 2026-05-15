# Quick Task: Hide Landing Page CMS

Hide the "Landing Page" editor from the Website CMS view in the Manager Dashboard.

## Proposed Changes

### Frontend

#### `ContentView.tsx`
- Remove the "landing" tab from the `TabsList`.
- Remove the `TabsContent` for "landing".
- Set the default tab to "faq".

## Verification Plan

### Manual Verification
- Open Manager Dashboard.
- Navigate to "Website CMS".
- Verify that the "Landing Page" tab is missing and "FAQ" is the default view.
