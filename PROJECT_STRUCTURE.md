# Project Structure

This document outlines the file and folder structure of the QBMS v2.0 project.

## Root Directory

- **.env**: Environment variables.
- **.gitignore**: Git ignore rules.
- **README.md**: Project documentation.
- **components.json**: Configuration for UI components (likely shadcn/ui).
- **index.html**: Entry point for the Vite application.
- **jsconfig.json**: JavaScript configuration.
- **package.json** & **package-lock.json**: Node.js dependencies and scripts.
- **postcss.config.js** & **tailwind.config.js**: CSS processing configuration.
- **vite.config.js**: Vite build configuration.
- **question_template.csv**: Template file for questions.
- **test.html**: A test HTML file.

## /api

Contains backend/serverless functions.
- **google-form-proxy.js**: Proxy for Google Forms integration.

## /src

The main source code for the React application.

- **App.jsx**: Main application component.
- **main.jsx**: Entry point that mounts the React app.
- **index.css**: Global styles.

### /src/components

Reusable UI components and feature-specific components.

- **Layout.jsx**: Main layout component.
- **HomeRedirect.jsx**: Redirect logic.
- **/auth**: Authentication related components.
- **/candidates**: Candidate management components.
- **/classrooms**: Classroom management components.
- **/layout**: Layout specific components.
- **/liveClasses**: Live class components.
- **/onlineSessions**: Online session components.
- **/papertemplates**: Paper template components.
- **/questions**: Question management components.
- **/ui**: Generic UI components (likely from a library like shadcn/ui).

### /src/pages

Top-level page components corresponding to routes.

- **AdminDashboardPage.jsx**
- **AttemptedTestsPage.jsx**
- **CandidatesPage.jsx**
- **ClassroomDetailsPage.jsx**
- **ClassroomsPage.jsx**
- **CreatedQuestionPapersPage.jsx**
- **DashboardPage.jsx**
- **FreeQuizzesPage.jsx**
- **LiveClassesPage.jsx**
- **LiveTestsPage.jsx**
- **LoginPage.jsx**
- **OnlineSessionsPage.jsx**
- **PaperPreviewPage.jsx**
- **PaperTemplatesPage.jsx**
- **PracticePage.jsx**
- **PreviousYearPapersPage.jsx**
- **ProtectedRoute.jsx**: HOC for protected routes.
- **QuestionsPage.jsx**
- **ReportedQuestionsPage.jsx**
- **SavedQuestionsPage.jsx**
- **StudentDashboardPage.jsx**
- **TestSeriesPage.jsx**

### Other Directories in /src

- **/entities**: Domain entities or models.
- **/hooks**: Custom React hooks.
- **/integrations**: External service integrations.
- **/lib**: Library code and utilities.
- **/utils**: Helper functions.
