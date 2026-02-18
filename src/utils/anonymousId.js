const STORAGE_KEY = "anonymousId";
export async function getOrCreateAnonymousId() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY])
        return result[STORAGE_KEY];
    const id = crypto.randomUUID();
    await chrome.storage.local.set({ [STORAGE_KEY]: id });
    return id;
}
