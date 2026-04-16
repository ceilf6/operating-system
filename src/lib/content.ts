import coverageLinks from "../content/generated/coverage-links.json";
import glossary from "../content/generated/glossary.json";
import manifest from "../content/generated/source-manifest.json";
import notePagesJson from "../content/generated/notes.json";
import sandboxes from "../content/generated/sandboxes.json";
import searchIndex from "../content/generated/search-index.json";
import tdPagesJson from "../content/generated/td-pages.json";

export type SourceKind = "note" | "pdf" | "docx" | "pptx" | "sandbox" | "project" | "media";

export interface SourceAsset {
  id: string;
  displayName: string;
  path: string;
  kind: SourceKind;
  language: "zh" | "fr" | "mixed";
  extractedTextPath?: string;
  coverageStatus: "covered" | "needs-review";
  excerpt?: string;
  publicPath?: string | null;
  pageCount?: number;
  ocrPages?: number[];
}

export interface CoverageLink {
  sourceId: string;
  chapterSlug: string;
  sectionId: string;
  usage: "primary" | "supporting" | "exercise" | "sandbox";
}

export interface ExerciseItem {
  id: string;
  prompt: string;
  answer: string;
  difficulty: "basic" | "medium" | "hard";
}

export type LearningBlock =
  | { type: "overview"; content: string }
  | { type: "key-points"; items: string[] }
  | { type: "callout"; variant: "warning" | "info" | "success"; title: string; content: string }
  | { type: "diagram-list"; items: string[] }
  | { type: "exercise-list"; items: ExerciseItem[] }
  | { type: "source-pack"; items: SourceCard[] }
  | { type: "sandbox-links"; ids: string[] };

export interface SourceCard {
  sourceId: string;
  title: string;
  path: string;
  kind: SourceKind;
  language: "zh" | "fr" | "mixed";
  content: string;
  excerpt: string;
}

export interface CourseSection {
  id: string;
  title: string;
  anchor: string;
  blocks: LearningBlock[];
  glossaryIds: string[];
  sourceIds: string[];
}

export interface CourseChapter {
  slug: string;
  number: string;
  track: string;
  title: string;
  summary: string;
  searchKeywords: string[];
  sourceIds: string[];
  sandboxIds: string[];
  sections: CourseSection[];
  review: {
    checklist: string[];
    pitfalls: string[];
    diagramIdeas: string[];
  };
  previousSlug: string | null;
  nextSlug: string | null;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  chapterSlug: string;
}

export interface NotePage {
  id: string;
  sourceId: string;
  slug: string;
  path: string;
  title: string;
  summary: string;
  content: string;
  chapterSlugs: string[];
  primaryChapterSlug: string;
  relatedTdSlugs: string[];
  relatedSandboxIds: string[];
  baseMaterials: SourceCard[];
  scriptMaterials: SourceCard[];
  keywords: string[];
}

export interface TdPage {
  id: string;
  slug: string;
  number: string;
  title: string;
  summary: string;
  chapterSlug: string;
  sandboxIds: string[];
  keywords: string[];
  sourceIds: string[];
  noteEntries: Array<{
    slug: string;
    title: string;
    summary: string;
    content: string;
    path: string;
  }>;
  questionMaterials: SourceCard[];
  scriptMaterials: SourceCard[];
}

export interface SandboxSpec {
  id: string;
  slug: string;
  title: string;
  summary: string;
  conceptTargets: string[];
  limitations: string[];
  initialState: unknown;
  chapterSlugs: string[];
}

export interface SearchRecord {
  id: string;
  route: string;
  title: string;
  excerpt: string;
  chapterSlug?: string | null;
  kind: "section" | "glossary" | "sandbox" | "note" | "td";
  keywords: string[];
}

const chapterModules = import.meta.glob("../content/generated/chapters/*.json", {
  eager: true,
}) as Record<string, { default: CourseChapter } | CourseChapter>;

export const chapters = Object.values(chapterModules)
  .map((moduleValue) => ("default" in moduleValue ? moduleValue.default : moduleValue))
  .sort((left, right) => Number(left.number) - Number(right.number));

export const sourceManifest = manifest as SourceAsset[];
export const glossaryEntries = glossary as GlossaryEntry[];
export const notePages = notePagesJson as NotePage[];
export const sandboxSpecs = sandboxes as SandboxSpec[];
export const sourceCoverageLinks = coverageLinks as CoverageLink[];
export const searchRecords = searchIndex as SearchRecord[];
export const tdPages = tdPagesJson as TdPage[];

export function getChapterBySlug(slug: string | undefined) {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function getSandboxBySlug(slug: string | undefined) {
  return sandboxSpecs.find((sandbox) => sandbox.slug === slug);
}

export function getNotePageBySlug(slug: string | undefined) {
  return notePages.find((note) => note.slug === slug);
}

export function getTdPageBySlug(slug: string | undefined) {
  return tdPages.find((td) => td.slug === slug);
}

export function getSourcesByIds(ids: string[]) {
  const targetIds = new Set(ids);
  return sourceManifest.filter((asset) => targetIds.has(asset.id));
}

export function getGlossaryByIds(ids: string[]) {
  const targetIds = new Set(ids);
  return glossaryEntries.filter((entry) => targetIds.has(entry.id));
}

export function getCoverageLinksForChapter(chapterSlug: string) {
  return sourceCoverageLinks.filter((link) => link.chapterSlug === chapterSlug);
}

export function getNotePagesForChapter(chapterSlug: string) {
  return notePages.filter((note) => note.chapterSlugs.includes(chapterSlug));
}

export function getTdPagesForChapter(chapterSlug: string) {
  return tdPages.filter((td) => td.chapterSlug === chapterSlug);
}

export function getStats() {
  const zhCount = sourceManifest.filter((asset) => asset.language === "zh").length;
  const mixedCount = sourceManifest.filter((asset) => asset.language === "mixed").length;

  return {
    chapterCount: chapters.length,
    noteCount: notePages.length,
    sourceCount: sourceManifest.length,
    sandboxCount: sandboxSpecs.length,
    tdCount: tdPages.length,
    glossaryCount: glossaryEntries.length,
    zhCount,
    mixedCount,
  };
}
