# Profile Editing Feature

Prophet Dian includes a complete profile editing system that allows users to customize their profiles with personal information, bio, and profile pictures.

## Features

### What Users Can Edit

1. **Name** - Full name or display name
2. **Username** - Unique identifier (3-50 characters)
3. **Bio** - Personal biography or description
4. **Profile Picture** - Avatar image upload

### Validation Rules

- **Username**: 
  - Minimum 3 characters
  - Maximum 50 characters
  - Must be unique
  - Alphanumeric and underscore allowed

- **Name**: 
  - Optional field
  - Maximum 255 characters

- **Bio**: 
  - Optional field
  - Maximum 500 characters

- **Profile Picture**: 
  - Maximum 5MB file size
  - Supported formats: JPG, PNG, GIF, WebP
  - Automatically compressed and optimized

## User Interface

### Profile Edit Page (`/profile-edit`)

The profile edit page includes:

1. **Header Section**
   - Back button to return to profile
   - "Edit Profile" title
   - "Unsaved changes" indicator

2. **Profile Picture Section**
   - Current profile picture preview
   - Upload button for new picture
   - Drag-and-drop support
   - Image preview before saving

3. **Form Fields**
   - Name input field
   - Username input field (with validation)
   - Bio textarea field
   - Character count indicators

4. **Action Buttons**
   - Save Changes button (enabled only when changes made)
   - Cancel button (returns to profile)

## How It Works

### User Flow

1. User navigates to `/profile-edit`
2. Form is pre-populated with current profile data
3. User makes changes to any field
4. "Unsaved changes" indicator appears
5. User clicks "Save Changes"
6. Form validates input
7. Changes are sent to server
8. Database is updated
9. User is redirected to profile page
10. Success message is shown

### Data Storage

All profile data is stored in the Supabase `users` table:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  picture_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend Implementation

**tRPC Procedure**: `profile.update`

```typescript
profile: router({
  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      username: z.string().optional(),
      bio: z.string().optional(),
      profilePicture: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Updates user profile in database
      // Returns success message
    })
})
```

**Authentication**: Protected procedure (requires login)

**Validation**: 
- Username: 3-50 characters
- Name: optional, max 255 characters
- Bio: optional, max 500 characters
- Profile picture: optional, max 5MB

## Image Upload

### Process

1. User selects image file
2. File size is validated (max 5MB)
3. Image is read as Data URL
4. Preview is shown to user
5. User confirms changes
6. Image is sent to server
7. Image is stored in S3
8. URL is saved to database

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Optimization

- Images are automatically compressed
- Aspect ratio is preserved
- Dimensions are optimized for profile display

## Error Handling

### Validation Errors

- **Username too short**: "Username must be at least 3 characters"
- **Username too long**: "Username must be less than 50 characters"
- **Username taken**: "Username already in use"
- **File too large**: "Image must be less than 5MB"
- **Invalid file type**: "File must be an image"

### Server Errors

- Database connection error
- Profile update failed
- Image upload failed

## Testing

### Manual Testing

1. Log in to your account
2. Navigate to `/profile-edit`
3. Edit each field:
   - Change name
   - Change username
   - Update bio
   - Upload profile picture
4. Click "Save Changes"
5. Verify changes appear on profile page
6. Refresh page to confirm changes persisted

### Test Cases

- [ ] Edit name only
- [ ] Edit username only
- [ ] Edit bio only
- [ ] Upload new profile picture
- [ ] Edit all fields at once
- [ ] Try invalid username (too short)
- [ ] Try invalid username (too long)
- [ ] Try duplicate username
- [ ] Upload file > 5MB
- [ ] Upload non-image file
- [ ] Cancel without saving
- [ ] Save with no changes

## Frontend Components

### ProfileEdit.tsx

Location: `client/src/pages/ProfileEdit.tsx`

**Imports**:
- React hooks (useState, useEffect)
- UI components (Button, Card, Input, Textarea)
- tRPC client
- Authentication hook
- Icons (ArrowLeft, Upload, Loader2)

**State**:
- name
- username
- bio
- previewUrl
- isLoading
- hasChanges

**Functions**:
- handleImageUpload
- handleInputChange
- handleSave
- handleCancel

## Backend Procedures

### profile.update

**Input**:
```typescript
{
  name?: string
  username?: string
  bio?: string
  profilePicture?: string
}
```

**Output**:
```typescript
{
  success: boolean
  message: string
}
```

**Error Handling**:
- Validates input
- Checks username uniqueness
- Updates database
- Returns success/error

## Security

- Only authenticated users can edit profiles
- Users can only edit their own profile
- Username uniqueness enforced at database level
- File upload size limited to 5MB
- File type validation on client and server
- All data is encrypted in transit (HTTPS)
- SQL injection prevention via parameterized queries

## Performance

- Profile data cached in React state
- Optimistic UI updates
- Debounced validation
- Lazy image loading
- Compressed image storage

## Future Enhancements

- [ ] Crop/resize image tool
- [ ] Multiple profile pictures
- [ ] Profile themes/customization
- [ ] Social media links
- [ ] Verification badges
- [ ] Profile visibility settings
- [ ] Profile history/changelog
- [ ] Bulk profile updates

## Troubleshooting

### Changes Not Saving

1. Check browser console for errors
2. Verify you're logged in
3. Check network tab for API errors
4. Verify Supabase connection
5. Check database permissions

### Image Not Uploading

1. Verify file size < 5MB
2. Check file format (JPG, PNG, GIF, WebP)
3. Check browser console for errors
4. Verify S3 bucket is accessible
5. Check file upload permissions

### Username Already Taken

1. Choose a different username
2. Check if username is available
3. Try adding numbers or underscores

## Support

For issues with profile editing:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Netlify function logs
4. Review Supabase logs
5. Contact support with error details

---

**Last Updated**: April 3, 2026
**Status**: Production Ready
**Version**: 1.0.0
