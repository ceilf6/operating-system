import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteShell } from "../components/layout/SiteShell";
import { ChapterPage } from "../pages/ChapterPage";
import { GlossaryPage } from "../pages/GlossaryPage";
import { HomePage } from "../pages/HomePage";
import { PracticeHubPage } from "../pages/PracticeHubPage";
import { ProjectPage } from "../pages/ProjectPage";
import { ReviewPage } from "../pages/ReviewPage";
import { SandboxPage } from "../pages/SandboxPage";
import { SearchPage } from "../pages/SearchPage";

export function SiteRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteShell />}>
          <Route index element={<HomePage />} />
          <Route path="/course/:chapterSlug" element={<ChapterPage />} />
          <Route path="/practice" element={<PracticeHubPage />} />
          <Route path="/practice/:sandboxSlug" element={<SandboxPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/project" element={<ProjectPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
