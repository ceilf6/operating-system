import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteShell } from "../components/layout/SiteShell";
import { ChapterPage } from "../pages/ChapterPage";
import { GlossaryPage } from "../pages/GlossaryPage";
import { HomePage } from "../pages/HomePage";
import { NoteDetailPage } from "../pages/NoteDetailPage";
import { NotesIndexPage } from "../pages/NotesIndexPage";
import { PracticeHubPage } from "../pages/PracticeHubPage";
import { ReviewPage } from "../pages/ReviewPage";
import { SandboxPage } from "../pages/SandboxPage";
import { SearchPage } from "../pages/SearchPage";
import { TdDetailPage } from "../pages/TdDetailPage";
import { TdIndexPage } from "../pages/TdIndexPage";

export function SiteRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteShell />}>
          <Route index element={<HomePage />} />
          <Route path="/course/:chapterSlug" element={<ChapterPage />} />
          <Route path="/notes" element={<NotesIndexPage />} />
          <Route path="/notes/:noteSlug" element={<NoteDetailPage />} />
          <Route path="/practice" element={<PracticeHubPage />} />
          <Route path="/practice/:sandboxSlug" element={<SandboxPage />} />
          <Route path="/tds" element={<TdIndexPage />} />
          <Route path="/tds/:tdSlug" element={<TdDetailPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
