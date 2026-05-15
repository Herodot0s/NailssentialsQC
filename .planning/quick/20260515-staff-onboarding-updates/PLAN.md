# Quick Task: Staff Onboarding Enhancements

Add image upload for profile pictures and 'Hair' specialization to staff onboarding.

## Proposed Changes

### Frontend

#### `AddStaffDialog.tsx`
- Import `uploadFile` from `@/api/apiClient`.
- Add state for upload progress.
- Replace the `profilePictureUrl` text input with an integrated upload button/preview area.
- Ensure "Hair" specialization is prominently displayed as a first-class option.

### Backend
- No changes needed (already supports `profile_picture_url`).

## Verification Plan

### Manual Verification
- Open Manager Dashboard.
- Click "New Employee".
- Verify "Hair" specialization is visible.
- Upload an image for the profile picture.
- Complete onboarding and verify the staff member has the correct picture and specialization.
