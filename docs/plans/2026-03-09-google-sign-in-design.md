# Google Sign-In Design

## Overview

Add optional Google Sign-In to the Polovni Komentari extension. Anonymous users retain full functionality. Signing in unlocks: email notifications on replies, in-extension unread badge, cross-device identity, and lays groundwork for future reputation tiers.

## Approach

Use `chrome.identity.getAuthToken()` for one-click Google sign-in (uses Chrome's signed-in account). Verify the token server-side in Convex and manage user records in a new `users` table. Send emails via Resend.

## Data Model

### New `users` table

```typescript
users: defineTable({
  googleId: v.string(),
  email: v.string(),
  firstName: v.string(),
  displayName: v.string(),       // firstName by default, or custom
  isCustomName: v.boolean(),
  anonymousId: v.string(),       // localStorage UUID, for migration
  createdAt: v.number(),
  lastSeenAt: v.number(),
  emailNotifications: v.boolean(), // default true
  commentCount: v.number(),        // reputation groundwork
  upvotesReceived: v.number(),     // reputation groundwork
})
  .index("by_googleId", ["googleId"])
  .index("by_anonymousId", ["anonymousId"])
  .index("by_email", ["email"])
```

### New `notifications` table

```typescript
notifications: defineTable({
  userId: v.id("users"),
  type: v.string(),              // "reply" for now
  commentId: v.id("comments"),
  triggerAuthorName: v.string(),
  listingId: v.string(),
  read: v.boolean(),
  emailSent: v.boolean(),
  createdAt: v.number(),
})
  .index("by_userId_read", ["userId", "read"])
  .index("by_userId_createdAt", ["userId", "createdAt"])
```

### Changes to `comments` table

Add optional `userId: v.optional(v.id("users"))` field. Existing `authorId` (anonymous UUID) stays for backwards compatibility.

### Migration

On first sign-in, find all comments where `authorId` matches the user's localStorage UUID and backfill `userId` on those comments.

## Auth Flow

1. User clicks "Sign in with Google" in the drawer
2. Extension calls `chrome.identity.getAuthToken({ interactive: true })`
3. Extension sends token + anonymousId to Convex action `signIn`
4. Convex action verifies token via Google userinfo endpoint, gets googleId/email/firstName
5. Creates or updates user record; migrates anonymous comments on first sign-in
6. Extension stores userId in localStorage
7. Subsequent Convex calls include userId when available

Sign-out: `chrome.identity.removeCachedAuthToken()`, clear stored user data, fall back to anonymous mode.

No blocking auth checks on load — drawer opens immediately, auth hydrates in background.

## Notification System

### In-extension badge

- Red dot + count on drawer toggle button when unread > 0
- Notifications tab (bell icon) in drawer, only visible when signed in
- Lists notifications chronologically with highlights for unread
- Click to navigate to listing; "mark all as read" option
- Real-time updates via Convex `useQuery` subscription

### Email notifications

Triggered in `postComment` flow:
1. Comment inserted
2. Walk parent chain to find signed-in users in thread (direct parent author + root comment author)
3. Create `notifications` rows
4. Schedule Convex action calling Resend API for users with `emailNotifications: true`
5. Mark `emailSent: true`

Rules:
- Don't notify yourself
- Deduplicate (same user is both root and parent author → one notification)

Email content: who replied, reply snippet, link to listing. Unsubscribe link in footer.

### Settings

- Toggle email notifications on/off
- Change display name
- Sign out
- Only visible when signed in

## UI Changes

### Drawer toggle
- Red dot with unread count overlay (signed in + unread > 0 only)

### Drawer header
- Signed out: subtle "Sign in with Google" link
- Signed in: display name with dropdown menu (change name, settings, sign out)

### Notifications tab
- Bell icon tab, only when signed in
- Chronological list: "{name} replied to your comment on {listing}"
- Unread highlight, click to navigate, empty state

### Comment display
- Signed-in users: display name + small verified indicator
- Anonymous users: unchanged (auto-generated or custom name, no indicator)

### No changes to
- Comment posting flow, voting, reactions, VIN check
- Anonymous user experience

## Permissions & Privacy

### Manifest additions

```json
{
  "permissions": ["identity"],
  "oauth2": {
    "client_id": "CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["openid", "email", "profile"]
  }
}
```

`identity` permission does not trigger new permissions warning on update.

### Privacy

- Email stored only for notifications, never displayed publicly
- Google ID internal, never exposed
- Other users only see display name
- Unsubscribe link in every email
- Privacy policy update needed: mention Google sign-in, email storage, Resend

### Google Cloud Console

- Create OAuth 2.0 client ID of type "Chrome Extension"
- Configure with extension ID

## Benefits of Signing In (User-Facing)

- Get emailed when someone replies to your comment
- See unread reply count in the extension
- Keep your identity across browsers and devices
- Verified indicator next to your name
- Future: reputation tiers and trusted contributor badges

## Future Extensions (Not in v1)

- Reputation tiers (trusted contributor, etc.)
- Notification on votes/reactions
- Follow listings for new comment alerts
- "Your comments" activity page
- Report/flag comments (signed-in only)
- Weighted votes from trusted users
