# QBMS v2.0 - Flowcharts & Diagrams

This document contains visual representations of the QBMS v2.0 system architecture, user flows, and data relationships using Mermaid diagrams.

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Application<br/>Vite + Tailwind CSS]
        B[UI Components<br/>Radix UI / shadcn]
    end
    
    subgraph "Authentication Layer"
        C[Supabase Auth]
        D[AuthProvider Context]
        E[Protected Routes]
    end
    
    subgraph "Backend Services"
        F[Supabase Database]
        G[Serverless Functions<br/>Vercel API]
        H[Google Apps Script Proxy]
    end
    
    subgraph "External Integrations"
        I[Google Forms]
        J[Google Sheets]
    end
    
    A --> B
    A --> D
    D --> C
    D --> E
    E --> F
    A --> G
    G --> H
    H --> I
    H --> J
    A --> F
    
    style A fill:#4f46e5,stroke:#312e81,color:#fff
    style C fill:#10b981,stroke:#065f46,color:#fff
    style F fill:#f59e0b,stroke:#92400e,color:#fff
    style G fill:#8b5cf6,stroke:#5b21b6,color:#fff
```

---

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant LP as LoginPage
    participant AP as AuthProvider
    participant SA as Supabase Auth
    participant DB as Supabase DB
    participant PR as ProtectedRoute
    participant D as Dashboard
    
    U->>LP: Enter Credentials
    LP->>AP: Login Request
    AP->>SA: Authenticate User
    SA->>DB: Verify Credentials
    DB-->>SA: User Data + Role
    SA-->>AP: Auth Token + Session
    AP-->>LP: Login Success
    LP->>PR: Navigate to Dashboard
    PR->>AP: Check Auth Status
    AP-->>PR: Authenticated + Role
    PR->>D: Render Dashboard (Role-based)
    D-->>U: Display Dashboard
```

---

## 3. Application Routing Structure

```mermaid
graph LR
    A["/"] --> B[HomeRedirect]
    B --> C{Authenticated?}
    C -->|Yes| D["/dashboard"]
    C -->|No| E["/login"]
    
    D --> F[Dashboard Page]
    
    F --> G[Questions Module]
    F --> H[Tests Module]
    F --> I[Papers Module]
    F --> J[Classroom Module]
    
    G --> G1["/questions"]
    G --> G2["/saved-questions"]
    G --> G3["/reported-questions"]
    
    H --> H1["/live-tests"]
    H --> H2["/test-series"]
    H --> H3["/free-quizzes"]
    H --> H4["/practice"]
    H --> H5["/attempted-tests"]
    
    I --> I1["/paper-templates"]
    I --> I2["/created-papers"]
    I --> I3["/paper-preview"]
    I --> I4["/previous-year-papers"]
    
    J --> J1["/classrooms"]
    J --> J2["/classroom-details"]
    J --> J3["/online-sessions"]
    J --> J4["/candidates"]
    
    style D fill:#4f46e5,stroke:#312e81,color:#fff
    style E fill:#ef4444,stroke:#991b1b,color:#fff
```

---

## 4. Database Schema (Entity Relationship)

```mermaid
erDiagram
    USERS ||--o{ QUESTIONS : creates
    USERS ||--o{ TESTS : creates
    USERS ||--o{ CLASSROOMS : manages
    USERS ||--o{ TEST_ATTEMPTS : takes
    USERS ||--o{ SAVED_QUESTIONS : saves
    
    QUESTIONS ||--o{ TEST_QUESTIONS : contains
    QUESTIONS ||--o{ SAVED_QUESTIONS : referenced_by
    QUESTIONS ||--o{ REPORTED_QUESTIONS : flagged_as
    QUESTIONS }o--|| COMPETENCIES : has
    SUBJECTS ||--o{ COMPETENCIES : contains
    
    TESTS ||--o{ TEST_QUESTIONS : includes
    TESTS ||--o{ TEST_ATTEMPTS : attempted_by
    TESTS }o--|| CLASSROOMS : assigned_to
    
    CLASSROOMS ||--o{ CLASSROOM_MEMBERS : has
    CLASSROOMS ||--o{ ONLINE_SESSIONS : hosts
    
    PAPER_TEMPLATES ||--o{ QUESTION_PAPERS : generates
    
    USERS {
        uuid id PK
        string email
        string role
        string full_name
        timestamp created_at
    }
    
    QUESTIONS {
        uuid id PK
        uuid created_by FK
        uuid competency_id FK
        string question_text
        string subject
        string difficulty
        json options
        string correct_answer
        timestamp created_at
    }

    COMPETENCIES {
        uuid id PK
        uuid subject_id FK
        string name
        timestamp created_at
    }

    
    TESTS {
        uuid id PK
        uuid created_by FK
        string title
        string type
        timestamp start_time
        timestamp end_time
        int duration_minutes
        boolean is_published
    }
    
    CLASSROOMS {
        uuid id PK
        uuid teacher_id FK
        string name
        string description
        timestamp created_at
    }
    
    TEST_ATTEMPTS {
        uuid id PK
        uuid user_id FK
        uuid test_id FK
        int score
        json answers
        timestamp submitted_at
    }
    
    SAVED_QUESTIONS {
        uuid id PK
        uuid user_id FK
        uuid question_id FK
        timestamp saved_at
    }
    
    REPORTED_QUESTIONS {
        uuid id PK
        uuid question_id FK
        uuid reported_by FK
        string reason
        timestamp reported_at
    }
```

---

## 5. Question Management Workflow

```mermaid
flowchart TD
    A[Start] --> B{User Action}
    
    B -->|Browse| C[QuestionsPage]
    B -->|Import| D[Import Questions]
    B -->|Create| E[Create New Question]
    
    C --> F{Filter/Search}
    F --> G[Display Questions]
    
    G --> H{User Action}
    H -->|Save| I[Add to Saved Questions]
    H -->|Report| J[Flag as Reported]
    H -->|Edit| K[Update Question]
    H -->|Delete| L[Remove Question]
    
    D --> M[Upload CSV/Excel]
    M --> N[Parse Data]
    N --> O{Validation}
    O -->|Valid| P[Insert to Database]
    O -->|Invalid| Q[Show Errors]
    Q --> M
    
    E --> R[Fill Question Form]
    R --> S[Submit]
    S --> T{Validation}
    T -->|Valid| P
    T -->|Invalid| R
    
    P --> U[Success Message]
    I --> U
    J --> U
    K --> U
    L --> U
    
    U --> V[End]
    
    style A fill:#10b981,stroke:#065f46,color:#fff
    style V fill:#ef4444,stroke:#991b1b,color:#fff
    style P fill:#4f46e5,stroke:#312e81,color:#fff
```

---

## 6. Test Creation & Execution Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant UI as Test Creation UI
    participant DB as Database
    participant S as Student
    participant TE as Test Engine
    participant R as Results
    
    T->>UI: Create New Test
    UI->>T: Show Test Form
    T->>UI: Configure Test Settings
    T->>UI: Select Questions
    UI->>DB: Save Test Draft
    T->>UI: Publish Test
    UI->>DB: Update Test Status
    DB-->>UI: Test Published
    UI-->>T: Confirmation
    
    Note over S,TE: Student Takes Test
    
    S->>TE: Start Test
    TE->>DB: Fetch Test Questions
    DB-->>TE: Questions Data
    TE-->>S: Display Questions
    S->>TE: Submit Answers
    TE->>DB: Save Attempt
    TE->>TE: Calculate Score
    TE->>DB: Save Results
    DB-->>TE: Saved
    TE->>R: Generate Report
    R-->>S: Show Results
    R-->>T: Update Analytics
```

---

## 7. Paper Generation Process

```mermaid
flowchart LR
    A[Start] --> B[Select Paper Template]
    B --> C{Template Type}
    
    C -->|Existing| D[Load Template]
    C -->|New| E[Create Template]
    
    E --> F[Define Structure]
    F --> G[Set Sections]
    G --> H[Configure Marks]
    
    D --> I[Configure Parameters]
    H --> I
    
    I --> J[Select Question Pool]
    J --> K{Selection Method}
    
    K -->|Manual| L[Pick Questions]
    K -->|Auto| M[AI-based Selection]
    
    L --> N[Preview Paper]
    M --> N
    
    N --> O{Approve?}
    O -->|No| P[Modify]
    P --> I
    O -->|Yes| Q[Generate PDF]
    
    Q --> R[Save to Database]
    R --> S[Download/Print]
    S --> T[End]
    
    style A fill:#10b981,stroke:#065f46,color:#fff
    style T fill:#ef4444,stroke:#991b1b,color:#fff
    style Q fill:#f59e0b,stroke:#92400e,color:#fff
```

---

## 8. Classroom & Online Session Management

```mermaid
graph TB
    subgraph "Teacher Actions"
        A[Create Classroom]
        B[Add Students]
        C[Schedule Session]
        D[Assign Tests]
    end
    
    subgraph "Classroom Entity"
        E[Classroom Details]
        F[Member List]
        G[Session Schedule]
        H[Assigned Content]
    end
    
    subgraph "Student Actions"
        I[Join Classroom]
        J[View Sessions]
        K[Attend Live Class]
        L[Take Assigned Tests]
    end
    
    subgraph "Online Session"
        M[Live Class Interface]
        N[Chat/Q&A]
        O[Screen Share]
        P[Recording]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    
    I --> F
    J --> G
    K --> M
    L --> H
    
    M --> N
    M --> O
    M --> P
    
    style A fill:#4f46e5,stroke:#312e81,color:#fff
    style I fill:#10b981,stroke:#065f46,color:#fff
    style M fill:#f59e0b,stroke:#92400e,color:#fff
```

---

## 9. Google Forms Integration Flow

```mermaid
sequenceDiagram
    participant UI as QBMS Frontend
    participant API as Serverless Proxy
    participant GAS as Google Apps Script
    participant GF as Google Forms
    participant GS as Google Sheets
    participant DB as Supabase DB
    
    UI->>API: Request Form Data
    API->>GAS: Forward Request (with Auth)
    GAS->>GF: Fetch Form Responses
    GF-->>GAS: Response Data
    GAS->>GS: Read/Write Sheet Data
    GS-->>GAS: Sheet Data
    GAS-->>API: Formatted Data
    API-->>UI: JSON Response
    UI->>DB: Sync Data to Database
    DB-->>UI: Confirmation
    
    Note over API,GAS: Proxy handles CORS<br/>and hides credentials
```

---

## 10. Role-Based Access Control (RBAC)

```mermaid
flowchart TD
    A[User Login] --> B{Identify Role}
    
    B -->|Admin| C[Admin Dashboard]
    B -->|Teacher| D[Teacher Dashboard]
    B -->|Student| E[Student Dashboard]
    
    C --> C1[Manage Users]
    C --> C2[System Settings]
    C --> C3[All Modules Access]
    C --> C4[Analytics & Reports]
    
    D --> D1[Create Questions]
    D --> D2[Create Tests]
    D --> D3[Manage Classrooms]
    D --> D4[Generate Papers]
    D --> D5[View Student Results]
    
    E --> E1[Browse Questions]
    E --> E2[Take Tests]
    E --> E3[Join Classrooms]
    E --> E4[View Results]
    E --> E5[Practice Mode]
    
    style C fill:#ef4444,stroke:#991b1b,color:#fff
    style D fill:#f59e0b,stroke:#92400e,color:#fff
    style E fill:#10b981,stroke:#065f46,color:#fff
```

---

## 11. Component Hierarchy

```mermaid
graph TD
    A[App.jsx] --> B[AuthProvider]
    B --> C[Router]
    
    C --> D[Layout]
    C --> E[LoginPage]
    
    D --> F[Sidebar]
    D --> G[Header]
    D --> H[Main Content]
    
    H --> I{Protected Routes}
    
    I --> J[Dashboard]
    I --> K[Questions Module]
    I --> L[Tests Module]
    I --> M[Papers Module]
    I --> N[Classroom Module]
    
    K --> K1[QuestionsPage]
    K --> K2[SavedQuestionsPage]
    K --> K3[ReportedQuestionsPage]
    
    L --> L1[LiveTestsPage]
    L --> L2[TestSeriesPage]
    L --> L3[FreeQuizzesPage]
    L --> L4[PracticePage]
    
    M --> M1[PaperTemplatesPage]
    M --> M2[CreatedPapersPage]
    M --> M3[PaperPreviewPage]
    
    N --> N1[ClassroomsPage]
    N --> N2[OnlineSessionsPage]
    N --> N3[CandidatesPage]
    
    style A fill:#4f46e5,stroke:#312e81,color:#fff
    style B fill:#10b981,stroke:#065f46,color:#fff
    style D fill:#f59e0b,stroke:#92400e,color:#fff
```

---

## 12. Data Flow: Question to Test to Result

```mermaid
flowchart LR
    A[Question Bank] --> B{Question Selection}
    
    B -->|Manual| C[Teacher Selects]
    B -->|Auto| D[Algorithm Selects]
    
    C --> E[Test Configuration]
    D --> E
    
    E --> F[Test Created]
    F --> G[Published to Students]
    
    G --> H[Student Attempts]
    H --> I[Answer Submission]
    
    I --> J[Auto-Grading Engine]
    J --> K{Question Type}
    
    K -->|MCQ| L[Instant Score]
    K -->|Subjective| M[Manual Review]
    
    L --> N[Results Database]
    M --> N
    
    N --> O[Student Dashboard]
    N --> P[Teacher Analytics]
    N --> Q[Performance Reports]
    
    style A fill:#10b981,stroke:#065f46,color:#fff
    style F fill:#4f46e5,stroke:#312e81,color:#fff
    style N fill:#f59e0b,stroke:#92400e,color:#fff
```

---

## 13. State Management Architecture

```mermaid
graph TB
    subgraph "Global State"
        A[AuthProvider Context]
        B[User Session]
        C[User Role]
    end
    
    subgraph "Page-Level State"
        D[Questions State]
        E[Tests State]
        F[Classroom State]
        G[Paper State]
    end
    
    subgraph "Component State"
        H[Form State]
        I[UI State]
        J[Filter State]
    end
    
    subgraph "Server State"
        K[Supabase Queries]
        L[API Responses]
    end
    
    A --> B
    A --> C
    
    B --> D
    B --> E
    B --> F
    B --> G
    
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I
    H --> J
    
    K --> D
    K --> E
    K --> F
    K --> G
    
    L --> D
    L --> E
    
    style A fill:#4f46e5,stroke:#312e81,color:#fff
    style K fill:#10b981,stroke:#065f46,color:#fff
```

---

## 14. Build & Deployment Pipeline

```mermaid
flowchart LR
    A[Developer] --> B[Git Push]
    B --> C[GitHub Repository]
    
    C --> D{CI/CD Trigger}
    
    D --> E[Install Dependencies]
    E --> F[Run Tests]
    F --> G{Tests Pass?}
    
    G -->|No| H[Notify Developer]
    H --> A
    
    G -->|Yes| I[Build Production]
    I --> J[Optimize Assets]
    J --> K[Generate Bundle]
    
    K --> L{Deploy Target}
    
    L -->|Vercel| M[Vercel Deployment]
    L -->|Other| N[Custom Server]
    
    M --> O[Edge Network]
    N --> O
    
    O --> P[Live Application]
    
    style A fill:#10b981,stroke:#065f46,color:#fff
    style G fill:#f59e0b,stroke:#92400e,color:#fff
    style P fill:#4f46e5,stroke:#312e81,color:#fff
```

---

## 15. Error Handling & Logging Flow

```mermaid
sequenceDiagram
    participant U as User Action
    participant C as Component
    participant API as API Layer
    participant DB as Database
    participant EH as Error Handler
    participant L as Logger
    participant UI as UI Feedback
    
    U->>C: Trigger Action
    C->>API: API Request
    API->>DB: Database Query
    
    alt Success
        DB-->>API: Data
        API-->>C: Response
        C-->>UI: Success Message
        UI-->>U: Display Result
    else Error
        DB-->>API: Error
        API->>EH: Handle Error
        EH->>L: Log Error
        L->>L: Store Log
        EH-->>API: Formatted Error
        API-->>C: Error Response
        C-->>UI: Error Message
        UI-->>U: Display Error
    end
```

---

## Legend

### Color Coding
- 🟦 **Blue (#4f46e5)**: Core Application Components
- 🟩 **Green (#10b981)**: Authentication & Success States
- 🟧 **Orange (#f59e0b)**: Data & Processing
- 🟪 **Purple (#8b5cf6)**: External Services
- 🟥 **Red (#ef4444)**: Error States & Admin Functions

### Diagram Types Used
- **Flowchart**: Process flows and decision trees
- **Sequence Diagram**: Interaction between components over time
- **Entity Relationship**: Database schema and relationships
- **Graph**: System architecture and hierarchies

---

## Usage Notes

All diagrams in this document are created using **Mermaid** syntax and can be:
- Rendered in GitHub, GitLab, and most modern markdown viewers
- Exported as SVG/PNG using Mermaid CLI or online editors
- Embedded in documentation websites
- Modified easily by editing the code blocks

To edit these diagrams, use the [Mermaid Live Editor](https://mermaid.live/) or any compatible markdown editor.
