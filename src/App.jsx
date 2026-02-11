
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider } from "./components/auth/AuthProvider";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./pages/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import QuestionsPage from "./pages/QuestionsPage";
import LiveTestsPage from "./pages/LiveTestsPage";
import TestSeriesPage from "./pages/TestSeriesPage";
import PreviousYearPapersPage from "./pages/PreviousYearPapersPage";
import PracticePage from "./pages/PracticePage";
import FreeQuizzesPage from "./pages/FreeQuizzesPage";
import PaperTemplatesPage from "./pages/PaperTemplatesPage";
import AttemptedTestsPage from "./pages/AttemptedTestsPage";
import SavedQuestionsPage from "./pages/SavedQuestionsPage";
import ReportedQuestionsPage from "./pages/ReportedQuestionsPage";
import PaperPreviewPage from "./pages/PaperPreviewPage";
import CreatedQuestionPapersPage from "./pages/CreatedQuestionPapersPage";
import CandidatesPage from "./pages/CandidatesPage";
import ClassroomsPage from "./pages/ClassroomsPage";
import OnlineSessionsPage from "./pages/OnlineSessionsPage";

import { HomeRedirect } from "./components/HomeRedirect";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import RolesPage from "./pages/RolesPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <Layout>
                  <QuestionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/livetests"
            element={
              <ProtectedRoute>
                <Layout>
                  <LiveTestsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/testseries"
            element={
              <ProtectedRoute>
                <Layout>
                  <TestSeriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/previousyearpapers"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreviousYearPapersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Layout>
                  <PracticePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/freequizzes"
            element={
              <ProtectedRoute>
                <Layout>
                  <FreeQuizzesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/papertemplates"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaperTemplatesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/paperpreview/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaperPreviewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/createdquestionpapers"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreatedQuestionPapersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attemptedtests"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttemptedTestsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/savedquestions"
            element={
              <ProtectedRoute>
                <Layout>
                  <SavedQuestionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute role="admin">
                <Layout>
                  <CandidatesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/classrooms"
            element={
              <ProtectedRoute role="admin">
                <Layout>
                  <ClassroomsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onlinesessions"
            element={
              <ProtectedRoute role="admin">
                <Layout>
                  <OnlineSessionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportedquestions"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportedQuestionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute role="admin">
                <Layout>
                  <RolesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Layout>
                  <AdminDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
