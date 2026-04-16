import { chapters, getProjectAssets, sourceManifest, sourceCoverageLinks } from "./content";

export function getCoverageSummary() {
  const coveredIds = new Set(sourceCoverageLinks.map((link) => link.sourceId));
  const covered = sourceManifest.filter((asset) => coveredIds.has(asset.id));
  const pending = sourceManifest.filter((asset) => !coveredIds.has(asset.id));

  return {
    coveredCount: covered.length,
    pendingCount: pending.length,
    coveredPercent:
      sourceManifest.length === 0 ? 0 : Math.round((covered.length / sourceManifest.length) * 100),
  };
}

export function getChapterCoverage(chapterSlug: string) {
  const chapter = chapters.find((item) => item.slug === chapterSlug);
  if (!chapter) {
    return [];
  }
  return sourceManifest.filter((asset) => chapter.sourceIds.includes(asset.id));
}

export function getProjectMediaAssets() {
  return getProjectAssets().filter((asset) => asset.kind === "media");
}
