export interface ListingInfo {
  title: string;
  price: string;
  imageUrl: string;
  url: string;
  vin: string | null;
  boughtNewInSerbia: boolean;
}

export function extractListingInfo(): ListingInfo | null {
  try {
    const titleEl = document.querySelector(".table-cell-left h1");
    const priceEl = document.querySelector("span.priceClassified.regularPriceColor");
    const imageEl = document.querySelector(
      "#image-gallery img"
    ) as HTMLImageElement | null;

    const title = titleEl?.childNodes[0]?.textContent?.trim() ?? "";
    const price = priceEl?.textContent?.trim() ?? "";
    const imageUrl = imageEl?.src ?? "";

    if (!title) return null;

    let vin: string | null = null;
    let boughtNewInSerbia = false;

    const gridDivs = Array.from(document.querySelectorAll(".divider .uk-grid div"));
    for (const div of gridDivs) {
      const text = div.textContent?.trim() ?? "";
      if (text === "Broj šasije:" || text === "Broj šasije") {
        const sibling = div.nextElementSibling;
        const value = sibling?.textContent?.trim() ?? "";
        if (value) vin = value;
      }
    }

    const classifiedBody = document.querySelector(".classified-content, .classifiedDetailContent, #classified-content");
    const bodyText = classifiedBody?.textContent ?? document.body.textContent ?? "";
    if (bodyText.includes("Kupljen nov u Srbiji")) {
      boughtNewInSerbia = true;
    }

    return {
      title,
      price,
      imageUrl,
      url: window.location.href,
      vin,
      boughtNewInSerbia,
    };
  } catch {
    return null;
  }
}
