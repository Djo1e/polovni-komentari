export interface ListingInfo {
  title: string;
  price: string;
  imageUrl: string;
  url: string;
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

    return {
      title,
      price,
      imageUrl,
      url: window.location.href,
    };
  } catch {
    return null;
  }
}
