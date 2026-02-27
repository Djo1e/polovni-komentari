# Defensive Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the extension against potential takedown by fixing branding, adding disclaimers everywhere, creating TOS, and strengthening the privacy policy.

**Architecture:** Text/content changes across landing page, extension UI, CWS listing, and legal docs. No backend changes. No new dependencies.

**Tech Stack:** React, TypeScript, Tailwind CSS (landing + extension)

---

### Task 1: Fix CWS listing name and description

**Files:**
- Modify: `extension/STORE_LISTING.md`
- Modify: `extension/manifest.json:5`

**Step 1: Update STORE_LISTING.md**

Change the name from "Polovni Automobili Comments" to "Polovni Komentari" and add disclaimer as first line of detailed description:

```markdown
# Chrome Web Store Listing

## Name
Polovni Komentari

## Short description (132 chars max)
Nezavisni komentari za oglase na polovniautomobili.com. Ostavi mišljenje, odgovori drugima i glasaj za korisne komentare.

## Detailed description

Polovni Komentari je nezavisan projekat. Nije povezano sa polovniautomobili.com.

Polovni Komentari dodaje sekciju za komentare na svaki oglas na polovniautomobili.com.

Funkcionalnosti:
• Ostavi komentar na bilo koji auto oglas
• Odgovori na komentare drugih korisnika
• Glasaj za (ili protiv) korisne komentare
• Automatski generisani nadimci ili unesi sopstveni
• Komentari se prikazuju u realnom vremenu

Kako radi:
Otvorite bilo koji oglas na polovniautomobili.com i kliknite na narandžasto dugme sa desne strane ekrana. Panel za komentare se otvara gde možete čitati i ostavljati komentare.

Privatnost:
Ekstenzija ne zahteva nikakve posebne dozvole. Ne prikupljamo lične podatke, ne pratimo istoriju pretraživanja i ne koristimo kolačiće za praćenje.

---

## Category
Social & Communication

## Language
Serbian
```

**Step 2: Update manifest.json description**

Change line 5 from:
```json
"description": "Komentari na oglasima na Polovnim Automobilima",
```
to:
```json
"description": "Nezavisni komentari za oglase na polovniautomobili.com",
```

**Step 3: Commit**

```bash
git add extension/STORE_LISTING.md extension/manifest.json
git commit -m "fix: update CWS listing name and add disclaimer to description"
```

---

### Task 2: Expand landing page footer disclaimer

**Files:**
- Modify: `landing/src/App.tsx:177`

**Step 1: Update the footer disclaimer**

On line 177 of `App.tsx`, change:
```tsx
<span>&copy; 2026 Polovni Komentari &middot; Nije povezano sa polovniautomobili.com</span>
```
to:
```tsx
<span>&copy; 2026 Polovni Komentari &middot; Nezavisan projekat, nije povezan sa polovniautomobili.com ili Polovni automobili doo.</span>
```

**Step 2: Build and verify**

```bash
cd landing && npm run build
```

Expected: builds without errors.

**Step 3: Commit**

```bash
git add landing/src/App.tsx
git commit -m "fix: expand landing page disclaimer with full legal text"
```

---

### Task 3: Add disclaimer to privacy policy pages

**Files:**
- Modify: `landing/src/PrivacyPolicy.tsx`
- Modify: `extension/PRIVACY_POLICY.md`

**Step 1: Add disclaimer section to PrivacyPolicy.tsx**

Add a new first entry to the `sections` array (Serbian):
```ts
{
  title: "O ekstenziji",
  content:
    "Polovni Komentari je nezavisan projekat i nije povezan sa, podržan od strane, niti odobren od strane polovniautomobili.com ili Polovni automobili doo.",
},
```

Add a new first entry to the `sectionsEn` array (English):
```ts
{
  title: "About this extension",
  content:
    "Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
},
```

**Step 2: Add data retention and listing data sections to PrivacyPolicy.tsx**

Add to `sections` array (after "Brisanje podataka"):
```ts
{
  title: "Čuvanje podataka",
  content:
    "Komentari i glasovi se čuvaju neograničeno osim ako se ne zatraži brisanje. Osnovni podaci o oglasu (naslov, cena, URL slike) se čuvaju kako bi se prikazali u fiду najnovijih komentara. Ovi podaci su javno dostupni na polovniautomobili.com.",
},
```

Add to `sectionsEn` array (after "Data deletion"):
```ts
{
  title: "Data retention",
  content:
    "Comments and votes are retained indefinitely unless deletion is requested. Basic listing data (title, price, image URL) is stored to display in the latest comments feed. This data is publicly available on polovniautomobili.com.",
},
```

**Step 3: Update extension/PRIVACY_POLICY.md**

Add disclaimer at the top (after the "Last updated" line) and add data retention section at the bottom. The full updated file:

```markdown
# Privacy Policy — Polovni Komentari

**Last updated:** February 27, 2026

**Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.**

## What this extension does

Polovni Komentari adds a community comment section to car listing pages on polovniautomobili.com. Users can post comments, reply to others, and vote on comments.

## Data we collect

- **Anonymous identifier** — A randomly generated ID stored in your browser's local storage. This is not linked to your real identity.
- **Username** — Either auto-generated (e.g., "Golf123") or chosen by you. Stored in your browser's local storage.
- **Comments and votes** — Text you post and votes you cast are sent to our server and visible to all users of the extension.
- **Listing data** — When you comment on a listing, we store the listing's title, price, image URL, and URL to display in the latest comments feed. This is publicly available data from polovniautomobili.com.

## Data we do NOT collect

- No personal information (name, email, phone, etc.)
- No browsing history
- No cookies or tracking pixels
- No analytics or telemetry

## Where data is stored

- **Local data** (anonymous ID, username, preferences) is stored in your browser using localStorage on the polovniautomobili.com domain.
- **Comments and votes** are stored on Convex (convex.dev), a cloud database service.

## Permissions

This extension requires **no special browser permissions**.

## Third-party services

We use [Convex](https://convex.dev) to store and serve comments and votes. Convex's privacy policy applies to data stored on their servers.

## Data retention

Comments and votes are retained indefinitely unless deletion is requested. Listing data is updated when users visit a listing.

## Data deletion

- To delete your local data, clear your browser's site data for polovniautomobili.com.
- To request deletion of your comments, open an issue at the project's GitHub repository with your anonymous ID (found in your browser's localStorage as `paCommentsAnonymousId`).

## Contact

For privacy questions or data removal requests, open an issue at the project's GitHub repository.
```

**Step 4: Build and verify**

```bash
cd landing && npm run build
```

Expected: builds without errors.

**Step 5: Commit**

```bash
git add landing/src/PrivacyPolicy.tsx extension/PRIVACY_POLICY.md
git commit -m "feat: add disclaimers and data retention info to privacy policies"
```

---

### Task 4: Create Terms of Service page

**Files:**
- Create: `landing/src/TermsOfService.tsx`
- Modify: `landing/src/App.tsx:101-103`
- Modify: `landing/src/App.tsx:178`

**Step 1: Create TermsOfService.tsx**

Create `landing/src/TermsOfService.tsx` following the same structure as `PrivacyPolicy.tsx`:

```tsx
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "O servisu",
    content:
      "Polovni Komentari je nezavisan projekat koji dodaje komentare na stranice oglasa na polovniautomobili.com. Nije povezan sa, podržan od strane, niti odobren od strane polovniautomobili.com ili Polovni automobili doo.",
  },
  {
    title: "Korisnički sadržaj",
    items: [
      "Korisnici su odgovorni za sadržaj koji postavljaju.",
      "Zabranjeni su: govor mržnje, spam, nezakonit sadržaj, lični napadi i deljenje ličnih podataka drugih lica.",
      "Zadržavamo pravo da uklonimo bilo koji komentar bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Odricanje od odgovornosti",
    items: [
      "Servis se pruža \"kakav jeste\" bez ikakvih garancija.",
      "Ne garantujemo dostupnost, tačnost ili pouzdanost servisa.",
      "Servis može biti izmenjen ili ukinut u bilo kom trenutku bez prethodnog obaveštenja.",
    ],
  },
  {
    title: "Ograničenje odgovornosti",
    content:
      "Ni u kom slučaju nećemo biti odgovorni za bilo kakvu direktnu, indirektnu, slučajnu ili posledičnu štetu nastalu korišćenjem ovog servisa.",
  },
  {
    title: "Privatnost",
    content:
      "Korišćenjem servisa prihvatate našu Politiku privatnosti. Za više informacija posetite stranicu /privacy.",
  },
  {
    title: "Merodavno pravo",
    content: "Na ove Uslove korišćenja primenjuje se pravo Republike Srbije.",
  },
] as const;

const sectionsEn = [
  {
    title: "About the service",
    content:
      "Polovni Komentari is an independent project that adds comments to listing pages on polovniautomobili.com. It is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.",
  },
  {
    title: "User content",
    items: [
      "Users are responsible for the content they post.",
      "Prohibited: hate speech, spam, illegal content, personal attacks, and sharing personal information of others.",
      "We reserve the right to remove any comment without prior notice.",
    ],
  },
  {
    title: "Disclaimer of warranties",
    items: [
      'The service is provided "as is" without any warranties.',
      "We do not guarantee availability, accuracy, or reliability of the service.",
      "The service may be modified or discontinued at any time without prior notice.",
    ],
  },
  {
    title: "Limitation of liability",
    content:
      "In no event shall we be liable for any direct, indirect, incidental, or consequential damages arising from the use of this service.",
  },
  {
    title: "Privacy",
    content:
      "By using the service you accept our Privacy Policy. For more information visit /privacy.",
  },
  {
    title: "Governing law",
    content:
      "These Terms of Service are governed by the laws of the Republic of Serbia.",
  },
] as const;

function SectionList({ data }: { data: typeof sections | typeof sectionsEn }) {
  return (
    <div className="space-y-8">
      {data.map((section) => (
        <div key={section.title}>
          <h2 className="font-[Outfit] font-700 text-lg text-[#1a1a1a] mb-2">
            {section.title}
          </h2>
          {"content" in section && (
            <p className="text-[#6b7280] text-sm leading-relaxed">
              {section.content}
            </p>
          )}
          {"items" in section && (
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="text-[#6b7280] text-sm leading-relaxed flex gap-2"
                >
                  <span className="text-[#E5A100] shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 bg-[#E5A100]" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#1a1a1a] transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Nazad
        </a>

        <h1 className="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">
          Uslovi korišćenja
        </h1>
        <p className="text-[#6b7280] text-sm mb-10">
          Poslednje ažuriranje: 27. februar 2026.
        </p>

        <SectionList data={sections} />

        <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
          <h1 className="font-[Outfit] font-900 text-3xl md:text-4xl text-[#1a1a1a] mb-2">
            Terms of Service
          </h1>
          <p className="text-[#6b7280] text-sm mb-10">
            Last updated: February 27, 2026
          </p>

          <SectionList data={sectionsEn} />
        </div>

        <div className="mt-12 pt-6 border-t border-[#e5e5e5] text-[#6b7280] text-xs">
          &copy; 2026 Polovni Komentari
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add route in App.tsx**

In `landing/src/App.tsx`, add import and route. Change lines 101-103 from:

```tsx
  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }
```

to:

```tsx
  if (window.location.pathname === "/privacy") {
    return <PrivacyPolicy />;
  }

  if (window.location.pathname === "/terms") {
    return <TermsOfService />;
  }
```

Add the import at the top of App.tsx (after the PrivacyPolicy import):

```tsx
import TermsOfService from "./TermsOfService";
```

**Step 3: Add TOS link to landing page footer**

In `landing/src/App.tsx`, change the footer links (line 178) from:

```tsx
<a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Politika privatnosti</a>
```

to:

```tsx
<div className="flex gap-3">
  <a href="/terms" className="hover:text-[#1a1a1a] transition-colors">Uslovi korišćenja</a>
  <span className="text-[#d4d4d4]">·</span>
  <a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Politika privatnosti</a>
</div>
```

**Step 4: Build and verify**

```bash
cd landing && npm run build
```

Expected: builds without errors.

**Step 5: Commit**

```bash
git add landing/src/TermsOfService.tsx landing/src/App.tsx
git commit -m "feat: add Terms of Service page"
```

---

### Task 5: Add disclaimer inside the extension drawer

**Files:**
- Modify: `extension/src/components/Drawer.tsx:202-207`

**Step 1: Update the drawer footer**

In `extension/src/components/Drawer.tsx`, replace the existing footer (lines 202-207):

```tsx
        <div className="shrink-0 px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sviđa ti se ekstenzija? Podeli je sa prijateljima
            – što nas je više, komentari su korisniji za sve! 🚗
          </p>
        </div>
```

with:

```tsx
        <div className="shrink-0 px-4 py-3 text-center space-y-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sviđa ti se ekstenzija? Podeli je sa prijateljima
            – što nas je više, komentari su korisniji za sve! 🚗
          </p>
          <p className="text-xs text-muted-foreground/60">
            Nezavisan projekat. Nije povezan sa polovniautomobili.com.
          </p>
        </div>
```

**Step 2: Build and verify**

```bash
cd extension && npm run build && rm -f convex/*.js
```

Expected: builds without errors.

**Step 3: Commit**

```bash
git add extension/src/components/Drawer.tsx
git commit -m "feat: add disclaimer to extension drawer footer"
```

---

### Task 6: Build everything and verify

**Step 1: Build extension**

```bash
cd extension && npm run build && rm -f convex/*.js
```

Expected: builds without errors.

**Step 2: Build landing page**

```bash
cd landing && npm run build
```

Expected: builds without errors.

**Step 3: Final commit (if any unstaged changes)**

```bash
git status
```

If clean, done. If not, stage and commit remaining changes.
