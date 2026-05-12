---
id: 260510-opv
description: in @frontend/src/components/home/ContactInfoSection.tsx  Add Socials -> Facebook, Instagram. And Instead of opening hours, put operating hours 10am to 9:00PM

Facebook: https://www.facebook.com/profile.php?id=61576963875321
Instagram: https://www.instagram.com/nailssentialsqc
date: 2026-05-10
status: pending
---

## Task

Update `frontend/src/components/home/ContactInfoSection.tsx`:

1. Add social links for Facebook and Instagram alongside the contact info section
2. Change "Opening Hours" heading to "Operating Hours"
3. Update hours display from "Daily: 10:00 AM - 8:00 PM" to "10:00 AM - 9:00 PM"

## Files

- `frontend/src/components/home/ContactInfoSection.tsx`

## Action

1. Import `Facebook` and `Instagram` icons from `lucide-react`
2. Add `facebookLink` and `instagramLink` props to `ContactInfoSectionProps` interface
3. Add Facebook and Instagram links to the contact card section (phone/email card area) using `AnimatedCard` with social icons
4. Change `Opening Hours` text to `Operating Hours`
5. Change default hours fallback from `Daily: 10:00 AM - 8:00 PM` to `10:00 AM - 9:00 PM`

## Verify

- Facebook link points to `https://www.facebook.com/profile.php?id=61576963875321`
- Instagram link points to `https://www.instagram.com/nailssentialsqc`
- Operating Hours label shows "Operating Hours" not "Opening Hours"
- Hours display shows "10:00 AM - 9:00 PM"

## Done

- Social links (Facebook and Instagram) added with proper hrefs
- Operating Hours label updated