/* eslint-disable no-var */
declare var process: { env: Record<string, string | undefined> };

import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

interface ParsedListing {
  listingId: string;
  title: string;
  price: string;
  imageUrl: string;
  url: string;
}

const CAR_BRANDS = [
  "Golf", "Punto", "Pezo", "Astra", "Jugo", "Stojadin", "Fica", "Yugo",
  "Clio", "Megane", "Octavia", "Fabia", "Polo", "Corsa", "Leon", "Ibiza",
  "Tipo", "Brava", "Uno", "Kadett", "Lada", "Niva", "Zastava", "Skala", "Koral",
];

function randomUsername(): string {
  const brand = CAR_BRANDS[Math.floor(Math.random() * CAR_BRANDS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${brand}${num}`;
}

function parseListingsFromHtml(html: string): ParsedListing[] {
  const listings: ParsedListing[] = [];
  const seen = new Set<string>();

  // PA homepage structure per listing card:
  //   data-classifiedid="{id}" ...
  //   <img src="https://gcdn.polovniautomobili.com/user-images/thumbs/.../{id}/...-205x154.jpg" alt="{title}">
  //   <h3>{title}</h3>
  //   <div class="price"> {price}&nbsp;&euro;</div>
  const cardRegex =
    /data-classifiedid="(\d+)"[\s\S]*?<img\s+src="(https:\/\/gcdn\.polovniautomobili\.com\/[^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<h3>([^<]*)<\/h3>[\s\S]*?class="price">([^<]*)/g;

  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const [, listingId, imageUrl, , title, priceRaw] = match;
    if (seen.has(listingId)) continue;
    seen.add(listingId);

    const price = priceRaw.replace(/&nbsp;/g, " ").replace(/&euro;/g, "\u20AC").trim();
    const titleClean = title.trim();
    const slug = titleClean.toLowerCase().replace(/\s+/g, "-");

    listings.push({
      listingId,
      title: titleClean,
      price,
      imageUrl,
      url: `https://www.polovniautomobili.com/auto-oglasi/${listingId}/${slug}`,
    });
  }

  return listings;
}

async function generateQuestion(title: string, price: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY env var");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Generisi jedno pitanje za oglas za auto na sajtu polovniautomobili.com.

Auto: ${title}
Cena: ${price}

Pravila:
- Pitanje treba da bude na srpskom jeziku (latinica)
- Max 150 karaktera
- Stil kao na srpskim auto forumima — opusteno, direktno
- Pitanje MORA da bude specificno za taj model auta (motor, poznati problemi, iskustva, odrzavanje)
- Ako pominjes tehnicke detalje (tip motora, menjac, kvarovi), moraju biti 100% tacni za taj model
- Cilj je da isprovocira druge korisnike da odgovore i podele iskustvo
- NE koristi emoji
- NE koristi navodnike
- VAZNO: Bezlican ton, kao pitanje na javnom forumu — NE obracaj se nikome direktno
- U otprilike 25% slucajeva napravi jednu malu gresku u kucanju ili velikom/malom slovu da bi delovalo autenticno

Primeri dobrog pitanja (NE koristi ove doslovno, samo kao inspiraciju za stil):
- Da li neko ima iskustva sa 2.0 TDI motorom u ovom modelu?
- Koliko realno trosi ovaj motor po gradu?
- Jel ima neko iskustvo sa lancem razvoda na ovom motoru?
- kakav je ovaj menjac na duze staze?

Odgovori SAMO tekstom pitanja, bez navodnika, bez dodatnog teksta.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text.trim();
}

export const postDailyQuestion = internalAction({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch PA homepage
    let html: string;
    try {
      const response = await fetch("https://www.polovniautomobili.com");
      if (!response.ok) {
        console.log("Failed to fetch PA homepage:", response.status);
        return;
      }
      html = await response.text();
    } catch (e) {
      console.log("Failed to fetch PA homepage:", e);
      return;
    }

    // 2. Parse listings from HTML
    const listings = parseListingsFromHtml(html);
    if (listings.length === 0) {
      console.log("No listings parsed from homepage");
      return;
    }

    // 3. Find listings without comments
    const listingIds = listings.map((l) => l.listingId);
    const withoutComments: string[] = await ctx.runQuery(
      api.comments.findListingsWithoutComments,
      { listingIds }
    );

    if (withoutComments.length === 0) {
      console.log("All homepage listings already have comments");
      return;
    }

    // 4. Pick one at random
    const chosenId = withoutComments[Math.floor(Math.random() * withoutComments.length)];
    const chosen = listings.find((l) => l.listingId === chosenId)!;

    // 5. Generate question via Claude API
    let question: string;
    try {
      question = await generateQuestion(chosen.title, chosen.price);
    } catch (e) {
      console.log("Failed to generate question:", e);
      return;
    }

    // 6. Upsert listing so it shows in the Latest feed
    await ctx.runMutation(api.listings.upsertListing, {
      listingId: chosen.listingId,
      title: chosen.title,
      price: chosen.price,
      imageUrl: chosen.imageUrl,
      url: chosen.url,
    });

    // 7. Post the comment
    await ctx.runMutation(api.comments.seedComment, {
      listingId: chosen.listingId,
      text: question,
      authorId: crypto.randomUUID(),
      username: randomUsername(),
      isAutoGenerated: true,
      createdAt: Date.now(),
    });

    console.log(`Posted engagement question on ${chosen.title} (${chosen.listingId}): ${question}`);
  },
});
