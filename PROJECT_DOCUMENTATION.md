# QBMS v2.0 - Project Documentation

## 1. Project Overview
**QBMS v2.0 (Question Bank Management System)** is a comprehensive web application designed to streamline the process of managing educational content, conducting assessments, and facilitating online learning. It serves as a centralized platform for administrators, teachers, and students to interact with a vast repository of questions, tests, and learning resources.

## 2. Technology Stack

### Frontend
- **Framework**: [React](https://react.dev/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (likely via [shadcn/ui](https://ui.shadcn.com/))
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: React Context / Local State
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Utilities**: `clsx`, `tailwind-merge`, `date-fns`

### Backend & Services
- **Backend-as-a-Service (BaaS)**: [Supabase](https://supabase.com/) (Authentication & Database)
- **Serverless Functions**: Node.js (Vercel-style `api/` directory)
- **PDF Generation**: `jspdf`, `html2canvas`
- **Charts**: `recharts`

## 3. Architecture & Integrations

### 3.1 Authentication
The application uses **Supabase Auth** for user management.
- **File**: `src/lib/supabase.js` initializes the client.
- **Context**: `src/components/auth/AuthProvider.jsx` manages user session state.
- **Protection**: `src/pages/ProtectedRoute.jsx` ensures only authenticated users access specific routes, with support for role-based access control (e.g., Admin vs. Student).

### 3.2 Database
**Supabase** is used as the primary data store. It likely hosts tables for:
- Users/Profiles
- Questions
- Tests/Quizzes
- Classrooms
- Student Results

### 3.3 External Integrations
- **Google Forms / Apps Script**:
    - **Proxy**: `api/google-form-proxy.js`
    - **Purpose**: Acts as a bridge to communicate with a Google Apps Script deployment. This is likely used for importing data from Google Forms or syncing assessment results.
    - **Security**: Handles CORS and hides the destination URL via environment variables (`APPS_SCRIPT_URL`).

## 4. Key Features & Modules

### 4.1 Dashboard
- **Route**: `/dashboard`
- **Component**: `DashboardPage.jsx`
- **Description**: The central landing page providing an overview of activities, quick stats, and navigation to other modules.

### 4.2 Question Management
- **Features**:
    - **Browse Questions**: `QuestionsPage.jsx`
    - **Saved Questions**: `SavedQuestionsPage.jsx` - Bookmarked for later.
    - **Reported Questions**: `ReportedQuestionsPage.jsx` - Flagged for errors.
    - **Import/Export**: Functionality to handle bulk question data (likely via CSV/Excel).

### 4.3 Assessments & Tests
- **Live Tests**: `LiveTestsPage.jsx` - Real-time scheduled exams.
- **Test Series**: `TestSeriesPage.jsx` - Collections of tests.
- **Free Quizzes**: `FreeQuizzesPage.jsx` - Open access quizzes.
- **Practice Mode**: `PracticePage.jsx` - Self-paced practice.
- **Attempted Tests**: `AttemptedTestsPage.jsx` - History of taken tests.

### 4.4 Paper Generation
- **Templates**: `PaperTemplatesPage.jsx` - Pre-defined structures for question papers.
- **Creation**: `CreatedQuestionPapersPage.jsx` - Manage generated papers.
- **Preview**: `PaperPreviewPage.jsx` - Visual confirmation before printing/exporting.
- **Previous Year Papers**: `PreviousYearPapersPage.jsx` - Archive of past exams.

### 4.5 Classroom & Learning
- **Classrooms**: `ClassroomsPage.jsx` & `ClassroomDetailsPage.jsx` - Manage student groups.
- **Online Sessions**: `OnlineSessionsPage.jsx` - Interface for live classes or webinars.
- **Candidates**: `CandidatesPage.jsx` - User management for students/examinees.

## 5. File Structure & Specifics

### Root Configuration
- **`vite.config.js`**: Configures path aliases (e.g., `@` -> `/src`) and build plugins.
- **`tailwind.config.js`**: Custom theme extension and content paths.
- **`jsconfig.json`**: JavaScript path mapping for IDE support.

### Source Directory (`/src`)
- **`App.jsx`**: Defines the application routing map.
- **`main.jsx`**: Application entry point, wraps `App` in strict mode.

#### Components (`/src/components`)
- **`Layout.jsx`**: The main shell of the app (Sidebar, Header, Content Area).
- **`/ui`**: Reusable atomic components (Buttons, Inputs, Dialogs, Toasts).
- **`/auth`**: Login forms and auth logic.

#### Pages (`/src/pages`)
Each file corresponds to a major route in the application. They typically act as container components that fetch data and render specific feature views.

#### API (`/api`)
- **`google-form-proxy.js`**: A serverless function to securely proxy requests to Google Apps Script, avoiding CORS issues and hiding API keys/URLs from the client-side code.

## 6. Setup & Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file with:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    APPS_SCRIPT_URL=your_google_script_url
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build for Production**:
    ```bash
    npm run build
    ```
