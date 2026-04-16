import { SearchRecord, searchRecords } from "./content";

export interface SearchFilters {
  kind?: SearchRecord["kind"] | "all";
  chapterSlug?: string | "all";
}

export function querySearchRecords(query: string, filters: SearchFilters = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const kind = filters.kind ?? "all";
  const chapterSlug = filters.chapterSlug ?? "all";

  return searchRecords.filter((record) => {
    if (kind !== "all" && record.kind !== kind) {
      return false;
    }

    if (chapterSlug !== "all" && record.chapterSlug !== chapterSlug) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [record.title, record.excerpt, ...record.keywords].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
