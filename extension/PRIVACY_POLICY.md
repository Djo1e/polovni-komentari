# Privacy Policy — Polovni Komentari

**Last updated:** March 6, 2026

**Polovni Komentari is an independent project and is not affiliated with, endorsed by, or approved by polovniautomobili.com or Polovni automobili doo.**

## What this extension does

Polovni Komentari adds a community comment section to car listing pages on polovniautomobili.com. Users can post comments, reply to others, and vote on comments. The extension also allows users to check vehicle import status via the public VIN lookup provided by Serbia's Agency for Traffic Safety (ABS).

## Data we collect

- **Anonymous identifier** — A randomly generated ID stored in your browser's local storage. This is not linked to your real identity.
- **Username** — Either auto-generated (e.g., "Golf123") or chosen by you. Stored in your browser's local storage.
- **Comments and votes** — Text you post and votes you cast are sent to our server and visible to all users of the extension.
- **Listing data** — When you comment on a listing, we store the listing's title, price, image URL, and URL to display in the latest comments feed. This is publicly available data from polovniautomobili.com.
- **VIN check results** — When you use the VIN check feature, the chassis number (VIN) from the listing is sent to abs.gov.rs (a public government service) to check vehicle import status. The result is cached on our server so that subsequent checks for the same VIN load instantly without repeated requests to ABS.
- **Anonymous usage analytics** — We collect anonymous data about how you use the extension (e.g. opening the panel, posting comments, voting) via Google Analytics. This data contains no personal information and is used solely to improve the extension.

## Data we do NOT collect

- No personal information (name, email, phone, etc.)
- No browsing history
- No cookies or tracking pixels

## Where data is stored

- **Local data** (anonymous ID, username, preferences) is stored in your browser using localStorage on the polovniautomobili.com domain.
- **Comments and votes** are stored on Convex (convex.dev), a cloud database service.

## Permissions

This extension requests host access to **abs.gov.rs** for the VIN check feature, access to **google-analytics.com** for sending anonymous analytics, and the **storage** permission for persisting analytics session IDs.

## Third-party services

We use [Convex](https://convex.dev) to store and serve comments, votes, and cached VIN check results. Convex's privacy policy applies to data stored on their servers. The VIN check feature queries [abs.gov.rs](https://www.abs.gov.rs), a public service of Serbia's Agency for Traffic Safety. This request is only made when the user clicks the check button. We use [Google Analytics 4](https://analytics.google.com) to collect anonymous usage statistics. Google's privacy policy applies to that data.

## Data retention

Comments and votes are retained indefinitely unless deletion is requested. Listing data is updated when users visit a listing.

## Data deletion

- To delete your local data, clear your browser's site data for polovniautomobili.com.
- To request deletion of your comments, contact the project with your anonymous ID (found in your browser's localStorage as `paCommentsAnonymousId`).

## Contact

For privacy questions or data removal requests, open an issue at the project's GitHub repository.
