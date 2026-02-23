export interface ListingInfo {
  title: string;
  price: string;
  imageUrl: string;
  url: string;
}

export function extractListingInfo(): ListingInfo | null {
  try {
    const titleEl = document.querySelector("h1.uk-article-title");
    const priceEl = document.querySelector(".price-item .regularPriceColor");
    const imageEl = document.querySelector(
      ".pi-img-wrapper img"
    ) as HTMLImageElement | null;

    const title = titleEl?.textContent?.trim() ?? "";
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
