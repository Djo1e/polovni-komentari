import Anthropic from "@anthropic-ai/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// --- Config ---
const CONVEX_URL = process.env.VITE_CONVEX_URL!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

if (!CONVEX_URL) throw new Error("Missing VITE_CONVEX_URL env var");
if (!ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY env var");

const convex = new ConvexHttpClient(CONVEX_URL);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// --- Listings from polovniautomobili.com landing page ---
const LISTINGS = [
  {
    listingId: "26541915",
    title: "Audi Q4 e-tron",
    price: "42.990 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2654/26541915/ebd0a429a527-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/26541915/audi-q4-e-tron",
  },
  {
    listingId: "27895365",
    title: "Kia Rio",
    price: "10.990 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2789/27895365/93c25879f059-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/27895365/kia-rio",
  },
  {
    listingId: "27268882",
    title: "Volkswagen Golf 8",
    price: "27.972 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2726/27268882/60e938cedad2-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/27268882/volkswagen-golf-8",
  },
  {
    listingId: "26350283",
    title: "Audi RS7",
    price: "55.999 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2635/26350283/d3ca79a0bad4-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/26350283/audi-rs7",
  },
  {
    listingId: "28061377",
    title: "Volvo XC60",
    price: "35.990 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2806/28061377/41b312c0b1ec-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28061377/volvo-xc60",
  },
  {
    listingId: "28139133",
    title: "BMW 520 Mpaket Xdrive",
    price: "36.990 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2813/28139133/d77dcc7811db-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28139133/bmw-520-mpaket-xdrive",
  },
  {
    listingId: "28333767",
    title: "Citroen C4 Picasso",
    price: "4.450 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2833/28333767/1bb8648c0821-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28333767/citroen-c4-picasso",
  },
  {
    listingId: "28563418",
    title: "BMW X3",
    price: "13.500 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2856/28563418/bfa6f3ce95fe-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28563418/bmw-x3",
  },
  {
    listingId: "27425186",
    title: "Audi A3",
    price: "12.350 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2742/27425186/57957f4fb238-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/27425186/audi-a3",
  },
  {
    listingId: "28334444",
    title: "Peugeot 4008 1.6HDI",
    price: "11.799 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2833/28334444/1b16701abd3b-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28334444/peugeot-4008-16hdi-platinium-4x4",
  },
  {
    listingId: "28499801",
    title: "Seat Arona",
    price: "16.990 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2849/28499801/c52849d3d1ff-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/28499801/seat-arona",
  },
  {
    listingId: "27396270",
    title: "Audi RS6",
    price: "106.000 €",
    imageUrl:
      "https://gcdn.polovniautomobili.com/user-images/thumbs/2739/27396270/c2e0c263065d-205x154.jpg",
    url: "https://www.polovniautomobili.com/auto-oglasi/27396270/audi-rs6",
  },
];

// --- Username generation (mirrors src/utils/username.ts) ---
const CAR_BRANDS = [
  "Golf",
  "Punto",
  "Pezo",
  "Astra",
  "Jugo",
  "Stojadin",
  "Fica",
  "Yugo",
  "Clio",
  "Megane",
  "Octavia",
  "Fabia",
  "Polo",
  "Corsa",
  "Leon",
  "Ibiza",
  "Tipo",
  "Brava",
  "Uno",
  "Kadett",
  "Lada",
  "Niva",
  "Zastava",
  "Skala",
  "Koral",
];

function randomUsername(): string {
  const brand = CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${brand}${num}`;
}

function randomAuthorId(): string {
  return crypto.randomUUID();
}

function randomTimestamp(): number {
  const now = Date.now();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
  return now - Math.floor(Math.random() * twoWeeksMs);
}

function replyTimestamp(parentTs: number): number {
  const minDelay = 5 * 60 * 1000; // 5 min
  const maxDelay = 8 * 60 * 60 * 1000; // 8 hours
  return parentTs + minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
}

// --- Comment generation via Claude API ---

interface GeneratedComment {
  text: string;
  reply?: string;
}

async function generateCommentsForListing(
  listing: (typeof LISTINGS)[number],
): Promise<GeneratedComment[]> {
  const count = 1 + Math.floor(Math.random() * 3); // 1-3 comments

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generisi ${count} komentara za oglas za auto na sajtu polovniautomobili.com.

Auto: ${listing.title}
Cena: ${listing.price}

Pravila:
- Komentari treba da budu na srpskom jeziku (latinica)
- Svaki komentar max 150 karaktera
- Stil kao na srpskim auto forumima (autoforum.rs, mojagaraza.rs) — opusteno, direktno, ponekad i duhovito
- Mesaj tipove: misljenja o modelu/motoru, pitanja, saveti, iskustva sa modelom, pohvale, upozorenja. Samo ponekad reakcija na cenu — vecina komentara treba da bude o samom autu, ne o ceni
- Neki komentari koriste auto zargon: "kilometraza", "servisna", "registracija", "uvoz", "tabla", "trap"
- Za otprilike trecinu komentara dodaj i jedan odgovor (reply) od drugog korisnika
- NE koristi emoji
- NE koristi navodnike unutar teksta komentara
- VAZNO: Ton mora biti bezlican, kao komentar na javnom forumu — NE obracaj se nikome direktno. Umesto "proveri servisnu" koristi "treba proveriti servisnu" ili "bitno je da ima servisnu". Umesto "pazi na" koristi "treba paziti na". Nikad ne koristi imperativ upucen jednoj osobi.
- U otprilike 25% komentara napravi jednu malu gresku u kucanju ili velikom/malom slovu (npr. "vehicta" umesto "vestica", malo slovo na pocetku recenice, slovo viska ili fali) da bi komentari delovali autenticno

Odgovori SAMO kao JSON niz ovog formata, bez ikakvog drugog teksta:
[{"text": "komentar", "reply": "odgovor ili null"}, ...]`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  const jsonText = content.text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed: Array<{ text: string; reply: string | null }> = JSON.parse(
    jsonText,
  );
  return parsed.map((c) => ({
    text: c.text,
    ...(c.reply ? { reply: c.reply } : {}),
  }));
}

// --- Main ---

async function main() {
  console.log(`Seeding comments for ${LISTINGS.length} listings...`);

  let totalComments = 0;
  let totalReplies = 0;

  for (const listing of LISTINGS) {
    // 1. Upsert listing
    await convex.mutation(api.listings.upsertListing, {
      listingId: listing.listingId,
      title: listing.title,
      price: listing.price,
      imageUrl: listing.imageUrl,
      url: listing.url,
    });

    // 2. Generate comments
    const comments = await generateCommentsForListing(listing);
    console.log(`  ${listing.title}: ${comments.length} comments generated`);

    // 3. Post each comment
    for (const comment of comments) {
      const parentTs = randomTimestamp();

      const parentId = await convex.mutation(api.comments.seedComment, {
        listingId: listing.listingId,
        text: comment.text,
        authorId: randomAuthorId(),
        username: randomUsername(),
        isAutoGenerated: true,
        createdAt: parentTs,
      });
      totalComments++;

      // 4. Post reply if present
      if (comment.reply) {
        await convex.mutation(api.comments.seedComment, {
          listingId: listing.listingId,
          text: comment.reply,
          authorId: randomAuthorId(),
          username: randomUsername(),
          isAutoGenerated: true,
          createdAt: replyTimestamp(parentTs),
          parentId: parentId,
        });
        totalReplies++;
      }
    }
  }

  console.log(
    `\nDone! Seeded ${totalComments} comments + ${totalReplies} replies across ${LISTINGS.length} listings.`,
  );
}

main().catch(console.error);
