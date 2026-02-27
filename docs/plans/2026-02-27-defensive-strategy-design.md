# Defensive Strategy: Polovni Komentari vs Takedown Risks

Date: 2026-02-27

## Risk Summary

| Vector | Risk Level | Notes |
|--------|-----------|-------|
| Trademark (CWS complaint) | Medium-High | "Polovni" is descriptive ("used") but PA may claim acquired distinctiveness. CWS tends to remove first, ask later. |
| Copyright (DMCA) | Low | Extension doesn't reproduce PA content. Minimal factual data extracted (listing ID, title, price, image URL). |
| TOS violation | Medium | PA TOS prohibits "automated system use including scripts." Content scripts arguably fall under this, but you're not a party to their TOS as a third-party developer. |
| Serbian court action | Low | No history of PA suing anyone. Expensive relative to threat level. |
| Technical blocking | Medium | PA could change DOM structure or add CSP headers. Non-legal, but practical. |

## Key Legal Context

- **PA's TOS** (effective Dec 1, 2022, at `/uslovi-koriscenja`): Prohibits automated systems, scraping, using their logo/trademark. Jurisdiction: Serbian courts in Subotica.
- **Serbian trademark law** (Law on Trademarks, No. 6/2020): Article 5(1)(4-5) refuses descriptive/generic marks. "Polovni Automobili" = "Used Cars" in Serbian. Would need acquired distinctiveness (Article 5(2)) to be registered.
- **PA's robots.txt**: Does NOT block listing pages. Only blocks user accounts, ad management, and internal endpoints.
- **Precedent**: No public record of PA ever taking legal action against scrapers or extensions. An open GitHub scraping project exists unchallenged.

---

## Section 1: Naming & Branding Defense

### Current state
- Extension: "Polovni Komentari"
- CWS listing name: "Polovni Automobili Comments" (in STORE_LISTING.md)
- Manifest description: "Komentari na oglasima na Polovnim Automobilima"
- Landing page: "Polovni Komentari" in large hero text
- Single footer disclaimer: "Nije povezano sa polovniautomobili.com"

### Changes

**1a. Fix CWS listing name inconsistency**
- STORE_LISTING.md says "Polovni Automobili Comments" — this is worse than the manifest name because it contains their full brand "Polovni Automobili"
- Change to "Polovni Komentari" to match the manifest (uses only the generic word "Polovni")

**1b. Update manifest description**
- Current: "Komentari na oglasima na Polovnim Automobilima"
- Change to: "Nezavisni komentari za oglase na polovniautomobili.com" (Independent comments for listings on...)
- The word "nezavisni" (independent) and using the domain name (not the brand name) frames this as nominative fair use

**1c. Add descriptor to CWS listing**
- First line of detailed description should be the disclaimer:
  "Polovni Komentari je nezavisan projekat. Nije povezano sa polovniautomobili.com."
- This is what CWS reviewers see first if a complaint is filed

**1d. Never use PA's visual branding**
- Don't use their logo, color scheme (#CC0000 red), or visual elements
- Current orange (#E5A100) is sufficiently distinct — keep it

**1e. Prepare rebrand candidates**
- If a C&D demands a name change, have ready: "Oglas Komentari", "Auto Komentari", or "Komentari"
- Files to update: manifest.json, STORE_LISTING.md, PRIVACY_POLICY.md, landing page App.tsx, PrivacyPolicy.tsx

---

## Section 2: Legal Documents

### 2a. Disclaimers — add to ALL surfaces

Full disclaimer text (Serbian):
> Polovni Komentari je nezavisan projekat i nije povezan sa, podržan od strane, niti odobren od strane polovniautomobili.com ili Polovni automobili doo.

Full disclaimer text (English):
> Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.

Where to add:
1. **Landing page** — already has short version in footer. Make it the full version.
2. **CWS description** — first line of detailed description (see 1c above)
3. **Privacy policy** (both languages) — add an "About" or "Disclaimer" section at the top
4. **Inside the extension** — add to an info/about tooltip or footer in the comments panel

### 2b. Terms of Service (new document)

Create a Terms of Service covering:
- **What the service is**: Independent community comment overlay, not affiliated with PA
- **User-generated content**: Users are responsible for their comments. No hate speech, spam, illegal content, personal attacks.
- **Moderation**: We reserve the right to remove any comment at our discretion.
- **No warranty / as-is**: Service provided as-is, may be discontinued at any time.
- **Limitation of liability**: Not liable for damages from use of the service.
- **Governing law**: Republic of Serbia.
- **Data**: Refer to Privacy Policy.

Add as:
- `/landing/src/TermsOfService.tsx` (new page, route at `/terms`)
- Link from landing page footer alongside "Politika privatnosti"
- Reference in extension STORE_LISTING.md

### 2c. Strengthen Privacy Policy

Current gaps to fill:
- **Add disclaimer section** at top (see 2a)
- **Data retention**: "Comments and votes are retained indefinitely unless deletion is requested."
- **Listing data**: Clarify that listing title, price, image URL, and URL are stored to power the Latest Feed feature. This data is publicly available on polovniautomobili.com.
- **Data deletion process**: Add a concrete process — "To request deletion of your comments, open a GitHub issue with your anonymous ID (found in browser localStorage as `paCommentsAnonymousId`)."

---

## Section 3: Technical Hardening

### 3a. Audit DOM data extraction

Current extraction (`extension/src/utils/listingInfo.ts`):
- Title from `.table-cell-left h1`
- Price from `span.priceClassified.regularPriceColor`
- Image URL from `#image-gallery img`
- URL from `window.location.href`

This data is stored in the Convex `listings` table and used for the Latest Feed feature.

**Assessment**: This is the most legally sensitive part of the extension. You're persisting PA's listing data (titles, prices, image URLs) in your own database. While this is factual data (not creative expression), it could be framed as "scraping."

**Options**:
- **Option A (recommended)**: Keep storing it but minimize — only store what the Latest Feed strictly needs. Consider whether you need the image URL or if a placeholder would work.
- **Option B (aggressive)**: Don't persist listing data at all. Instead, have the Latest Feed show only listing IDs/URLs, and let the content script fetch the details live when viewing the feed. This eliminates the "you're storing our data" argument entirely.
- **Option C (current)**: Keep as-is. The data is factual and publicly available.

### 3b. Option B Contingency: Remove persisted listing data

If pressured to stop "storing their data," execute this plan to switch the Latest Feed to a link-only design with no persisted PA content.

**What changes:**

1. **Schema** (`extension/convex/schema.ts`):
   - Remove the `listings` table entirely

2. **Backend** (`extension/convex/listings.ts`):
   - Delete this file (contains `upsertListing` mutation)

3. **Backend** (`extension/convex/comments.ts` — `getLatestComments` query):
   - Remove the listings join. Return only:
     ```ts
     { _id, text, username, isAutoGenerated, createdAt, listingId }
     ```
   - The `listingId` is enough to construct the URL: `https://www.polovniautomobili.com/auto-oglasi/${listingId}/`

4. **Frontend** (`extension/src/components/LatestFeedItem.tsx`):
   - Remove the image thumbnail and title/price display
   - Show: username, comment text, time ago, and a "Pogledaj oglas →" link constructed from `listingId`
   - The `listing` field becomes just `{ url: string }` (derived from listingId, not stored)

5. **Content script** (`extension/src/utils/listingInfo.ts`):
   - Delete this file entirely — no DOM extraction needed
   - Remove the `extractListingInfo()` call and `upsertListing` mutation call from wherever the content script invokes them

6. **Convex migration**:
   - Run a migration or manually clear the `listings` table data in the Convex dashboard

**UX impact:**
- Latest Feed loses rich previews (no car image, no title, no price)
- Feed items become: "[username]: [comment text] — [time ago] — Pogledaj oglas →"
- Less visually appealing but functionally equivalent — users can still click through to the listing

**Estimated effort:** ~1 hour of code changes + Convex dashboard cleanup.

### 3c. Ensure no page modification

Already good:
- Shadow DOM isolation (content doesn't leak into PA's page)
- No network request interception
- No cookie access
- No authentication bypass

### 3c. No special permissions

The manifest requests zero permissions. Keep it this way — this is a strong defense against "this extension is invasive" claims.
