export const toUrlSearchParams = (search: unknown) => {
  if (!search) return new URLSearchParams();
  if (typeof search === "string") return new URLSearchParams(search);
  if (search instanceof URLSearchParams) return search;
  if (typeof search === "object") {
    const entries = Object.entries(search as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    );
    return new URLSearchParams(entries);
  }
  return new URLSearchParams();
};
