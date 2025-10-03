# System Design - PostBoy API Testing Platform

**Version:** 3.0.0  
**Framework:** Next.js 15.5.4 (App Router + Turbopack)  
**AI Integration:** Google Gemini 2.0 Flash  
**Last Updated:** October 3, 2025

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Modules](#core-modules)
5. [User Journey & Workflows](#user-journey--workflows)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [State Management](#state-management)
9. [Data Flow](#data-flow)
10. [AI Integration](#ai-integration)
11. [API Design](#api-design)
12. [Security & Authentication](#security--authentication)
13. [Performance Optimization](#performance-optimization)
14. [Deployment Architecture](#deployment-architecture)
15. [Monitoring & Observability](#monitoring--observability)
16. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**PostBoy** is a next-generation API testing platform built with cutting-edge web technologies. It combines the power of Next.js 15.5.4, AI-driven features, and real-time collaboration to provide developers with an intuitive, powerful tool for API development and testing.

### Key Features (Implemented)

#### ✅ Core Platform
- **Multi-Workspace Management**: Isolated environments for different projects
- **Collection Organization**: Hierarchical request organization
- **Request Playground**: Multi-tab interface with auto-save
- **HTTP Method Support**: GET, POST, PUT, PATCH, DELETE
- **Real-time Response Viewer**: Monaco Editor integration
- **Request History**: 24-hour auto-expiring history tracking
- **Environment Variables**: Dynamic variable substitution

#### ✅ AI-Powered Features (New!)
- **Smart Request Naming**: AI generates meaningful request names based on URL and method
- **JSON Body Generation**: AI creates request bodies from natural language prompts
- **API Documentation Generator**: Automatically creates comprehensive markdown documentation
- **Intelligent Suggestions**: Context-aware recommendations

#### ✅ Collaboration & Access Control
- **Role-Based Permissions**: ADMIN, EDITOR, VIEWER roles
- **Workspace Invitations**: Secure invite system with time-limited tokens
- **OAuth Authentication**: Google and GitHub integration
- **Session Management**: Secure token-based authentication

#### ✅ Developer Experience
- **Keyboard Shortcuts**: Ctrl+G (send request), Ctrl+S (save)
- **Auto-Save**: Debounced automatic saving (2s delay)
- **Toast Notifications**: Real-time feedback for all actions
- **Dark Mode**: VS Code-style dark theme
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Client Layer (Browser)"]
        UI["Next.js UI<br/>React 19 + TypeScript"]
        StateManagement["State Management<br/>Zustand + TanStack Query"]
        MonacoEditor["Monaco Editor<br/>Code/Response Viewer"]
    end

    subgraph SERVER["⚙️ Next.js Server (App Router)"]
        ServerComponents["Server Components<br/>(RSC)"]
        ServerActions["Server Actions<br/>(API Logic)"]
        AuthAPI["Auth API<br/>(Better Auth)"]
        AIAPI["AI API Routes<br/>(Gemini Integration)"]
    end

    subgraph DATA["🗄️ Data Layer"]
        Prisma["Prisma ORM"]
        PostgreSQL["PostgreSQL Database"]
        Redis["Redis Cache<br/>(Future)"]
    end

    subgraph EXTERNAL["🌍 External Services"]
        GoogleOAuth["Google OAuth"]
        GitHubOAuth["GitHub OAuth"]
        GeminiAI["Google Gemini<br/>2.0 Flash"]
        TargetAPIs["Target APIs<br/>(User Testing)"]
    end

    UI --> StateManagement
    StateManagement --> ServerActions
    UI --> ServerComponents
    ServerComponents --> ServerActions
    ServerActions --> Prisma
    ServerActions --> AIAPI
    AIAPI --> GeminiAI
    AuthAPI --> GoogleOAuth
    AuthAPI --> GitHubOAuth
    AuthAPI --> Prisma
    Prisma --> PostgreSQL
    ServerActions --> Redis
    
    style CLIENT fill:#e1f5ff
    style SERVER fill:#fff3e0
    style DATA fill:#f3e5f5
    style EXTERNAL fill:#e8f5e9
```

### Request Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Zustand
    participant ServerAction
    participant Prisma
    participant PostgreSQL
    participant TargetAPI
    participant AI

    User->>UI: Fill Request Details
    UI->>Zustand: Update Local State
    Note over UI,Zustand: Debounced Auto-Save (2s)
    Zustand->>ServerAction: Save Request
    ServerAction->>Prisma: Update Database
    Prisma->>PostgreSQL: Commit Transaction
    PostgreSQL-->>Prisma: Success
    Prisma-->>ServerAction: Request Saved
    ServerAction-->>UI: Toast: Saved

    User->>UI: Click "Send Request"
    UI->>ServerAction: Execute Request
    ServerAction->>TargetAPI: HTTP Request
    TargetAPI-->>ServerAction: HTTP Response
    ServerAction->>Prisma: Save RequestRun
    ServerAction->>Prisma: Save RequestHistory
    ServerAction-->>UI: Response Data
    UI->>Zustand: Update Response State
    UI->>User: Display Response

    User->>UI: Generate Docs
    UI->>ServerAction: Generate Documentation
    ServerAction->>Prisma: Fetch Request Details
    ServerAction->>AI: Generate Docs (Gemini)
    AI-->>ServerAction: Documentation JSON
    ServerAction-->>UI: Formatted Docs
    UI->>User: Display/Download Markdown
```

---

## Technology Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.5.4 | React framework with App Router |
| **Build Tool** | Turbopack | Built-in | Ultra-fast bundler |
| **Language** | TypeScript | 5.x | Type safety |
| **UI Library** | React | 19.1.0 | Component library |
| **Styling** | Tailwind CSS | 4.0 | Utility-first CSS |
| **Components** | shadcn/ui | Latest | Pre-built components |
| **State (Client)** | Zustand | 5.0.8 | Lightweight state management |
| **State (Server)** | TanStack Query | 5.90.2 | Server state & caching |
| **HTTP Client** | Axios | 1.12.2 | API requests |
| **Code Editor** | Monaco Editor | 4.7.0 | VS Code editor |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Icons** | Lucide React | 0.544.0 | Icon library |
| **Date Handling** | date-fns | 4.1.0 | Date formatting |

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | Server runtime |
| **Database** | PostgreSQL | 16+ | Primary database |
| **ORM** | Prisma | 6.16.2 | Database toolkit |
| **Authentication** | Better Auth | 1.3.23 | OAuth & session management |
| **AI SDK** | Vercel AI SDK | 5.0.60 | AI integration framework |
| **AI Model** | Google Gemini | 2.0 Flash | AI model |
| **Validation** | Zod | 4.1.11 | Schema validation |
| **Forms** | React Hook Form | 7.63.0 | Form management |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Git** | Version control |
| **Docker** | Containerization (PostgreSQL) |
| **Prisma Studio** | Database GUI |

---

## Core Modules

### 1. Authentication Module

**Location**: `src/lib/auth.ts`, `src/app/api/auth/*`

**Features**:
- OAuth 2.0 integration (Google, GitHub)
- Session-based authentication
- Automatic session renewal
- Secure cookie management

**Tech Stack**:
- Better Auth for OAuth
- Session tokens in httpOnly cookies
- CSRF protection

**User Flow**:
```mermaid
sequenceDiagram
    User->>LoginPage: Click "Login with Google"
    LoginPage->>BetterAuth: Initiate OAuth
    BetterAuth->>Google: Redirect to OAuth
    Google->>BetterAuth: OAuth Callback
    BetterAuth->>Database: Create User/Session
    BetterAuth->>LoginPage: Redirect with Session
    LoginPage->>User: Logged In
```

---

### 2. Workspace Module

**Location**: `src/modules/Workspace/`, `src/modules/collections/`

**Features**:
- Multi-tenant workspace isolation
- Role-based access control (RBAC)
- Workspace invitation system
- Collection management

**Components**:
- `TabbedSidebar`: Workspace navigation
- `WorkspaceSelector`: Switch between workspaces
- `MemberManagement`: Invite and manage members
- `CollectionFolder`: Organize requests

**State Management**:
```typescript
// Zustand Store
interface WorkspaceStore {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace) => void;
}
```

---

### 3. Request Playground Module

**Location**: `src/modules/request/`

**Features**:
- Multi-tab request editing
- Auto-save functionality (debounced)
- Monaco Editor for JSON/code
- Request execution engine
- Response viewer

**Key Components**:
- `RequestPlayground`: Main container
- `RequestBar`: URL input + method selector + send button
- `RequestTabs`: Tab management
- `BodyEditor`: JSON body editor with AI generation
- `HeaderEditor`: HTTP headers editor
- `ResponseViewer`: Display response with syntax highlighting

**State Management**:
```typescript
// Zustand Store
interface RequestPlaygroundStore {
  tabs: RequestTab[];
  activeTabId: string;
  addTab: (tab: RequestTab) => void;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
  closeTab: (id: string) => void;
  markUnsaved: (id: string, unsaved: boolean) => void;
}
```

**Auto-Save Flow**:
```mermaid
sequenceDiagram
    User->>UI: Edit Request
    UI->>Zustand: Update State
    Note over Zustand: Debounce Timer (2s)
    Zustand->>ServerAction: Save Request
    ServerAction->>Database: Update
    Database-->>Zustand: Success
    Zustand->>UI: Show "Saved" Indicator
```

---

### 4. AI Module (New!)

**Location**: `src/modules/ai/`, `src/lib/ai-agents.ts`, `src/app/api/ai/*`

**Features**:
- **Smart Request Naming**: Generate 3 suggestions based on URL/method
- **JSON Body Generation**: AI creates JSON from natural language
- **API Documentation Generator**: Creates comprehensive markdown docs

**AI Endpoints**:

1. **Suggest Request Name**
   - **Route**: `/api/ai/suggest-name`
   - **Input**: `{ workspaceName, method, url, description }`
   - **Output**: `{ suggestions: [{ name, reasoning, confidence }] }`

2. **Generate JSON Body**
   - **Route**: `/api/ai/generate-json`
   - **Input**: `{ prompt, method, endpoint, context }`
   - **Output**: `{ jsonBody: {...}, explanation, suggestions }`

3. **Generate Documentation**
   - **Route**: `/api/ai/generate-docs`
   - **Input**: `{ requestId }`
   - **Output**: `{ documentation: {...}, metadata: {...} }`

**AI Agent Implementation**:
```typescript
// src/lib/ai-agents.ts
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

const model = google("gemini-2.0-flash");

export async function generateApiDocumentation(params: ApiDocGenerationParams) {
  const result = await generateObject({
    model,
    schema: ApiDocSchema,
    prompt: `Generate comprehensive API documentation for ${params.url}...`,
    temperature: 0.3,
  });

  return result.object;
}
```

**Documentation Generator Flow**:
```mermaid
sequenceDiagram
    User->>DocsModal: Select Request
    User->>DocsModal: Click "Generate"
    DocsModal->>AIAPI: POST /api/ai/generate-docs
    AIAPI->>Database: Fetch Request Details
    Database-->>AIAPI: Request Data (URL, headers, body)
    AIAPI->>Gemini: Generate Documentation
    Note over Gemini: Analyzes request structure
    Gemini-->>AIAPI: Documentation JSON
    AIAPI-->>DocsModal: Formatted Documentation
    DocsModal->>DocsPreview: Show Preview
    User->>DocsPreview: Download Markdown
```

---

### 5. Request History Module

**Location**: `src/modules/history/`, `src/lib/request-history.ts`

**Features**:
- Auto-expiring 24-hour history
- Real-time updates with Zustand
- Detailed history modal
- Performance metrics (response time, size)

**Data Flow**:
```mermaid
graph LR
    A[Execute Request] --> B[Save to RequestHistory]
    B --> C[Trigger Zustand Refetch]
    C --> D[TanStack Query Invalidate]
    D --> E[UI Updates Instantly]
    
    F[Cron Job Every Hour] --> G[Cleanup Expired Entries]
    G --> H[DELETE WHERE expiresAt < NOW]
```

**Components**:
- `HistoryList`: Shows grouped history (Today, Earlier)
- `HistoryCard`: Individual history entry
- `HistoryDetailModal`: Full request/response details
- `HistoryStats`: Metrics dashboard

**Real-Time Updates**:
```typescript
// Zustand Store
interface HistoryStore {
  shouldRefetch: boolean;
  triggerRefetch: () => void;
  resetRefetch: () => void;
}

// After request execution
const { triggerRefetch } = useHistoryStore();
await saveRequestToHistory(data);
triggerRefetch(); // Instantly updates UI
```

---

### 6. Documentation Generator Module

**Location**: `src/modules/docs/`

**Features**:
- AI-powered documentation generation
- Markdown export
- In-memory session storage (not persisted)
- Preview before download

**Components**:
- `DocsGeneratorModal`: Main generator interface
- `DocsPreview`: Documentation preview with download
- `DocsStore`: Zustand store for session docs

**Workflow**:
1. User selects workspace → collection → request
2. AI analyzes request details (URL, method, headers, body, parameters)
3. Gemini generates comprehensive documentation:
   - Endpoint description
   - Authentication requirements
   - Headers documentation
   - Request body schema with examples
   - Response status codes
   - Error codes
   - cURL examples
   - Best practices
4. User previews documentation
5. User downloads as Markdown file

**Markdown Output Example**:
```markdown
# Create User Account

> Creates a new user account with the provided information.

**Generated:** October 3, 2025 at 2:30 PM

---

## Endpoint

```
POST https://api.example.com/users
```

## Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Content-Type | string | ✓ | application/json |
| Authorization | string | ✓ | Bearer token |

## Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Responses

### 201 - User Created Successfully
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 400 - Invalid Request
### 401 - Unauthorized
### 500 - Internal Server Error
```

---

## User Journey & Workflows

### New User Onboarding

```mermaid
flowchart TD
    Start([User Visits Site]) --> Login{Logged In?}
    Login -->|No| OAuth[Click OAuth Login]
    OAuth --> Google[Login with Google/GitHub]
    Google --> CreateUser[Create User Account]
    CreateUser --> CreateWorkspace[Auto-create Default Workspace]
    CreateWorkspace --> Welcome[Welcome Screen]
    
    Login -->|Yes| Dashboard[Dashboard]
    Welcome --> Dashboard
    Dashboard --> CreateCollection[Create First Collection]
    CreateCollection --> AddRequest[Add First Request]
    AddRequest --> TestAPI[Test API]
    TestAPI --> ViewHistory[View History]
    ViewHistory --> GenerateDocs[Generate Documentation]
    GenerateDocs --> End([Productive User])
```

### API Testing Workflow

```mermaid
flowchart LR
    A[Select Workspace] --> B[Browse Collections]
    B --> C[Click Request]
    C --> D[Request Opens in Tab]
    D --> E{Edit Request}
    E -->|Headers| F[Add/Edit Headers]
    E -->|Body| G[Edit JSON Body]
    E -->|Params| H[Add Query Params]
    F --> I[Auto-Save]
    G --> I
    H --> I
    I --> J[Click Send]
    J --> K[Execute Request]
    K --> L[View Response]
    L --> M[Check History]
    M --> N{Generate Docs?}
    N -->|Yes| O[AI Generates Docs]
    N -->|No| P[Continue Testing]
    O --> Q[Download Markdown]
```

### Collaboration Workflow

```mermaid
sequenceDiagram
    participant Owner
    participant System
    participant NewMember

    Owner->>System: Create Workspace Invite
    System->>System: Generate Unique Token
    System-->>Owner: Invite Link
    Owner->>NewMember: Share Link
    NewMember->>System: Click Invite Link
    System->>System: Verify Token Not Expired
    System->>System: Add to Workspace (Role: EDITOR)
    System-->>NewMember: Access Granted
    NewMember->>System: View Collections
    NewMember->>System: Edit Requests
    Owner->>System: Monitor Activity
```

---

## Frontend Architecture

### Component Hierarchy

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                 # Login page
│   ├── (workspace)/
│   │   ├── layout.tsx                   # Workspace layout
│   │   └── page.tsx                     # Main workspace page
│   └── api/
│       ├── auth/[...all]/route.ts       # Better Auth routes
│       ├── ai/
│       │   ├── suggest-name/route.ts    # AI name suggestions
│       │   ├── generate-json/route.ts   # AI JSON generation
│       │   └── generate-docs/route.ts   # AI documentation
│       └── history/route.ts             # Request history API
│
├── modules/
│   ├── Layout/
│   │   ├── Store/                       # Workspace store
│   │   └── components/                  # Layout components
│   ├── Workspace/
│   │   └── components/
│   │       └── Sidebar/                 # TabbedSidebar
│   ├── collections/
│   │   ├── actions/                     # Server actions
│   │   ├── components/                  # Collection components
│   │   └── hooks/                       # React Query hooks
│   ├── request/
│   │   ├── components/
│   │   │   ├── request-bar.tsx         # URL bar + send button
│   │   │   ├── body-editor.tsx         # JSON body editor
│   │   │   ├── header-editor.tsx       # Headers editor
│   │   │   └── response-viewer.tsx     # Response display
│   │   ├── hooks/                       # Request execution hooks
│   │   └── store/                       # Request playground store
│   ├── ai/
│   │   ├── hooks/                       # AI hooks
│   │   ├── service/                     # AI API client
│   │   └── types/                       # AI TypeScript types
│   ├── docs/
│   │   ├── components/
│   │   │   ├── docs-generator-modal.tsx
│   │   │   └── docs-preview.tsx
│   │   ├── hooks/                       # useCollectionsForDocs
│   │   └── store/                       # Docs session store
│   └── history/
│       ├── action/                      # Save history action
│       ├── component/
│       │   ├── history-list.tsx
│       │   └── history-detail-modal.tsx
│       └── store/                       # History refetch store
│
├── hooks/
│   └── use-request-history.ts           # History React Query hook
│
├── lib/
│   ├── auth.ts                          # Better Auth config
│   ├── db.ts                            # Prisma client
│   ├── ai-agents.ts                     # AI agent functions
│   └── request-history.ts               # History CRUD functions
│
└── components/
    └── ui/                              # shadcn/ui components
```

### Key Design Patterns

#### 1. Server Actions Pattern
```typescript
// Server Action (runs on server)
'use server'

export async function createCollection(workspaceId: string, name: string) {
  const collection = await db.collection.create({
    data: { name, workspaceId }
  });
  
  return { success: true, collection };
}

// Client Component
import { createCollection } from '@/modules/collections/actions';

const { mutateAsync } = useMutation({
  mutationFn: (data) => createCollection(data.workspaceId, data.name)
});
```

#### 2. React Query Pattern
```typescript
// Hook
export function useCollections(workspaceId: string) {
  return useQuery({
    queryKey: ['collections', workspaceId],
    queryFn: async () => getCollections(workspaceId),
    enabled: !!workspaceId,
  });
}

// Component
const { data, isLoading } = useCollections(workspace.id);
```

#### 3. Zustand Store Pattern
```typescript
// Store
export const useRequestPlaygroundStore = create<RequestPlaygroundStore>((set) => ({
  tabs: [],
  activeTabId: '',
  
  addTab: (tab) => set((state) => ({
    tabs: [...state.tabs, tab]
  })),
  
  updateTab: (id, data) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, ...data } : t)
  })),
}));

// Component
const { tabs, addTab } = useRequestPlaygroundStore();
```

---

## Backend Architecture

### Server Actions Structure

```typescript
// src/modules/collections/actions/index.ts
'use server'

import db from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function getCollections(workspaceId: string) {
  // Authentication
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  
  // Authorization (check workspace membership)
  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id, workspaceId }
  });
  if (!member) throw new Error('Forbidden');
  
  // Query
  const collections = await db.collection.findMany({
    where: { workspaceId },
    include: { _count: { select: { requests: true } } }
  });
  
  return { success: true, collections };
}
```

### API Route Structure

```typescript
// src/app/api/ai/generate-docs/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate
    if (!body.requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }
    
    // Fetch data
    const requestData = await db.request.findUnique({
      where: { id: body.requestId },
      include: { collection: { include: { workspace: true } } }
    });
    
    // Call AI
    const { generateApiDocumentation } = await import('@/lib/ai-agents');
    const result = await generateApiDocumentation(requestData);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

## State Management

### State Architecture

```mermaid
graph TB
    subgraph CLIENT["Client State (Zustand)"]
        WS[Workspace Store]
        RP[Request Playground Store]
        HS[History Store]
        DS[Docs Store]
    end

    subgraph SERVER["Server State (TanStack Query)"]
        Collections[Collections Query]
        Requests[Requests Query]
        History[History Query]
        Environments[Environments Query]
    end

    subgraph PERSISTENCE["Persistence Layer"]
        Database[(PostgreSQL)]
    end

    WS -->|Selected Workspace| Collections
    RP -->|Tab Changes| Requests
    HS -->|Trigger Refetch| History
    Collections -->|Fetched Data| Database
    Requests -->|Save Changes| Database
    History -->|Query History| Database
```

### Zustand Stores

#### 1. Workspace Store
```typescript
interface WorkspaceStore {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  selectedWorkspace: null,
  setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),
}));
```

#### 2. Request Playground Store
```typescript
interface RequestPlaygroundStore {
  tabs: RequestTab[];
  activeTabId: string;
  unsavedChanges: Map<string, boolean>;
  
  addTab: (tab: RequestTab) => void;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  markUnsaved: (id: string, unsaved: boolean) => void;
}
```

#### 3. History Store
```typescript
interface HistoryStore {
  shouldRefetch: boolean;
  triggerRefetch: () => void;
  resetRefetch: () => void;
}

// Usage: Trigger instant refetch after saving history
const { triggerRefetch } = useHistoryStore();
await saveRequestToHistory(data);
triggerRefetch();
```

#### 4. Docs Store (Session-only)
```typescript
interface DocsStore {
  generatedDocs: GeneratedDoc[];
  addGeneratedDoc: (doc: Omit<GeneratedDoc, 'id' | 'generatedAt'>) => string;
  removeGeneratedDoc: (id: string) => void;
  clearAllDocs: () => void;
  getDocById: (id: string) => GeneratedDoc | undefined;
}

// Note: Docs are NOT persisted to database (per requirements)
```

---

## Data Flow

### Request Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant RequestBar
    participant Zustand
    participant useRunRequest
    participant ServerAction
    participant Axios
    participant TargetAPI
    participant Database

    User->>RequestBar: Click "Send"
    RequestBar->>Zustand: Get Tab Data
    Zustand-->>RequestBar: Tab State
    RequestBar->>useRunRequest: Execute Request
    useRunRequest->>ServerAction: POST /api/request/run
    ServerAction->>Axios: HTTP Request
    Axios->>TargetAPI: Actual API Call
    TargetAPI-->>Axios: Response
    Axios-->>ServerAction: Response Data
    ServerAction->>Database: Save RequestRun
    ServerAction->>Database: Save RequestHistory
    ServerAction-->>useRunRequest: Result
    useRunRequest->>Zustand: Update Response
    Zustand->>RequestBar: Trigger Re-render
    RequestBar->>User: Show Response
```

### Auto-Save Flow

```mermaid
sequenceDiagram
    participant User
    participant Input
    participant Zustand
    participant Debounce
    participant ServerAction
    participant Database

    User->>Input: Type/Edit
    Input->>Zustand: Update State
    Zustand->>Debounce: Start 2s Timer
    Note over Debounce: Wait 2 seconds
    
    alt User continues editing
        User->>Input: More Changes
        Input->>Zustand: Update State
        Zustand->>Debounce: Reset Timer
    else Timer completes
        Debounce->>ServerAction: Save Request
        ServerAction->>Database: Update
        Database-->>ServerAction: Success
        ServerAction-->>Zustand: Saved
        Zustand->>Input: Show "Saved" Indicator
    end
```

---

## AI Integration

### AI Architecture

```mermaid
graph LR
    subgraph CLIENT["Client Components"]
        A[Body Editor]
        B[Request Name Modal]
        C[Docs Generator]
    end

    subgraph AI_SERVICE["AI Service Layer"]
        D[suggestRequestName]
        E[generateJsonBody]
        F[generateApiDocs]
    end

    subgraph API_ROUTES["API Routes"]
        G[/api/ai/suggest-name]
        H[/api/ai/generate-json]
        I[/api/ai/generate-docs]
    end

    subgraph AI_AGENTS["AI Agents"]
        J[Gemini 2.0 Flash]
        K[Structured Output]
        L[Zod Validation]
    end

    A --> E
    B --> D
    C --> F
    D --> G
    E --> H
    F --> I
    G --> J
    H --> J
    I --> J
    J --> K
    K --> L
```

### AI Implementation Details

#### 1. Request Name Suggestions

```typescript
// src/lib/ai-agents.ts
export async function suggestRequestName({
  workspaceName,
  method,
  url,
  description,
}: RequestSuggestionParams) {
  const RequestNameSchema = z.object({
    suggestions: z.array(
      z.object({
        name: z.string(),
        reasoning: z.string(),
        confidence: z.number().min(0).max(1),
      })
    ).length(3),
  });

  const result = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: RequestNameSchema,
    prompt: `Generate 3 meaningful names for this API request:
      Method: ${method}
      URL: ${url}
      Workspace: ${workspaceName}
      Description: ${description || 'Not provided'}`,
    temperature: 0.7,
  });

  return { success: true, data: result.object };
}
```

#### 2. JSON Body Generation

```typescript
export async function generateJsonBody({
  prompt,
  method,
  endpoint,
  context,
}: JsonBodyGenerationParams) {
  const JsonBodySchema = z.object({
    jsonBody: z.string(),
    explanation: z.string(),
    suggestions: z.array(z.string()),
  });

  const result = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: JsonBodySchema,
    prompt: `Create a JSON request body for:
      Method: ${method}
      Endpoint: ${endpoint}
      User Request: ${prompt}
      Context: ${context}`,
    temperature: 0.3,
  });

  return {
    success: true,
    data: {
      ...result.object,
      jsonBody: JSON.parse(result.object.jsonBody),
    },
  };
}
```

#### 3. API Documentation Generation

```typescript
export async function generateApiDocumentation(params: ApiDocGenerationParams) {
  const ApiDocSchema = z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string(),
    endpoint: z.object({
      method: z.string(),
      url: z.string(),
      baseUrl: z.string().optional(),
    }),
    headers: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
      example: z.string().optional(),
    })),
    requestBody: z.object({
      contentType: z.string(),
      description: z.string(),
      schema: z.string(),
      example: z.string(),
    }).optional(),
    responses: z.array(z.object({
      statusCode: z.number(),
      description: z.string(),
      example: z.string().optional(),
    })),
    examples: z.array(z.object({
      title: z.string(),
      description: z.string(),
      request: z.string(),
      response: z.string().optional(),
    })).optional(),
    errorCodes: z.array(z.object({
      code: z.number(),
      message: z.string(),
      description: z.string(),
    })).optional(),
  });

  const result = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: ApiDocSchema,
    prompt: `Generate professional API documentation for:
      Name: ${params.requestName}
      Method: ${params.method}
      URL: ${params.url}
      Headers: ${JSON.stringify(params.headers)}
      Body: ${JSON.stringify(params.body)}`,
    temperature: 0.3,
  });

  return { success: true, data: result.object };
}
```

### AI Cost Optimization

- **Model**: Gemini 2.0 Flash (cost-effective, fast)
- **Temperature**: Low (0.3-0.7) for consistent results
- **Structured Output**: Zod schemas ensure valid responses
- **Caching**: Session-based docs storage (no database writes)

---

## API Design

### REST API Endpoints

#### Authentication
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/github` - GitHub OAuth
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout user

#### AI Endpoints
- `POST /api/ai/suggest-name` - Generate request name suggestions
- `POST /api/ai/generate-json` - Generate JSON body from prompt
- `POST /api/ai/generate-docs` - Generate API documentation

#### History
- `GET /api/history?workspaceId={id}` - Get user history
- `DELETE /api/history?workspaceId={id}` - Clear history

### Server Actions (Direct DB Access)

```typescript
// Workspaces
getWorkspaces(): Promise<{ success: boolean; workspaces: Workspace[] }>
getWorkspace(id: string): Promise<{ success: boolean; workspace: Workspace }>
createWorkspace(data): Promise<{ success: boolean; workspace: Workspace }>
updateWorkspace(id, data): Promise<{ success: boolean; workspace: Workspace }>
deleteWorkspace(id): Promise<{ success: boolean }>

// Collections
getCollections(workspaceId): Promise<{ success: boolean; collections: Collection[] }>
getCollectionsWithRequests(workspaceId): Promise<{ success: boolean; collections: Collection[] }>
createCollection(workspaceId, name): Promise<{ success: boolean; collection: Collection }>
updateCollection(id, name): Promise<{ success: boolean; collection: Collection }>
deleteCollection(id): Promise<{ success: boolean }>

// Requests
getRequests(collectionId): Promise<{ success: boolean; requests: Request[] }>
getRequest(id): Promise<{ success: boolean; request: Request }>
createRequest(data): Promise<{ success: boolean; request: Request }>
updateRequest(id, data): Promise<{ success: boolean; request: Request }>
deleteRequest(id): Promise<{ success: boolean }>

// History
saveRequestToHistory(data): Promise<{ success: boolean; history: RequestHistory }>
```

---

## Security & Authentication

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NextAuth
    participant OAuth
    participant Database

    User->>NextAuth: Click "Login with Google"
    NextAuth->>OAuth: Redirect to OAuth Provider
    OAuth->>User: Authorization Screen
    User->>OAuth: Approve
    OAuth->>NextAuth: OAuth Callback
    NextAuth->>Database: Find or Create User
    Database-->>NextAuth: User Data
    NextAuth->>Database: Create Session
    NextAuth->>User: Set httpOnly Cookie
    User->>NextAuth: Subsequent Requests
    NextAuth->>Database: Validate Session
    Database-->>NextAuth: Session Valid
    NextAuth-->>User: Authenticated
```

### Security Measures

#### 1. Authentication
- ✅ OAuth 2.0 (Google, GitHub)
- ✅ Session-based authentication
- ✅ httpOnly cookies (XSS protection)
- ✅ Secure cookie flags
- ✅ CSRF protection

#### 2. Authorization
- ✅ Role-based access control (ADMIN, EDITOR, VIEWER)
- ✅ Workspace isolation (users can only access their workspaces)
- ✅ Server-side permission checks in Server Actions
- ✅ API route authentication middleware

#### 3. Data Protection
- ✅ Prisma ORM (SQL injection prevention)
- ✅ Input validation (Zod schemas)
- ✅ Output sanitization
- ✅ HTTPS only in production
- ✅ Environment variable encryption

#### 4. Rate Limiting (Future)
- ⏳ API rate limiting per user
- ⏳ AI request throttling
- ⏳ Login attempt limiting

---

## Performance Optimization

### Frontend Performance

#### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

#### 2. React Query Caching
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

#### 3. Debounced Auto-Save
```typescript
const debouncedSave = useMemo(
  () => debounce((data) => saveRequest(data), 2000),
  []
);
```

#### 4. Optimistic Updates
```typescript
const { mutate } = useMutation({
  mutationFn: updateRequest,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['request', id]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['request', id]);
    
    // Optimistically update
    queryClient.setQueryData(['request', id], newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['request', id], context.previous);
  },
});
```

### Backend Performance

#### 1. Database Indexes
```prisma
@@index([userId, executedAt])    // Fast user history queries
@@index([workspaceId, executedAt]) // Fast workspace queries
@@index([expiresAt])              // Fast cleanup queries
```

#### 2. N+1 Query Prevention
```typescript
// ❌ Bad: N+1 queries
const collections = await db.collection.findMany();
for (const collection of collections) {
  const requests = await db.request.findMany({ where: { collectionId: collection.id } });
}

// ✅ Good: Single query with include
const collections = await db.collection.findMany({
  include: { requests: true }
});
```

#### 3. Pagination
```typescript
const { data } = useInfiniteQuery({
  queryKey: ['history'],
  queryFn: ({ pageParam = 0 }) => 
    getHistory({ skip: pageParam * 50, take: 50 }),
  getNextPageParam: (lastPage, pages) => pages.length,
});
```

#### 4. Connection Pooling
```typescript
// Prisma automatically manages connection pooling
const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error'],
});
```

---

## Deployment Architecture

### Production Architecture

```mermaid
graph TB
    subgraph VERCEL["Vercel Platform"]
        Edge["Edge Network<br/>(CDN)"]
        NextApp["Next.js Application<br/>(Serverless Functions)"]
    end

    subgraph DATABASE["Database Layer"]
        PostgreSQL["PostgreSQL<br/>(Supabase/Neon)"]
        Redis["Redis Cache<br/>(Upstash)"]
    end

    subgraph EXTERNAL["External Services"]
        GoogleAI["Google AI API<br/>(Gemini 2.0)"]
        OAuth["OAuth Providers<br/>(Google, GitHub)"]
    end

    Users["Users"] --> Edge
    Edge --> NextApp
    NextApp --> PostgreSQL
    NextApp --> Redis
    NextApp --> GoogleAI
    NextApp --> OAuth

    style VERCEL fill:#000000,color:#ffffff
    style DATABASE fill:#3178c6,color:#ffffff
    style EXTERNAL fill:#4caf50,color:#ffffff
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="https://your-domain.com"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# Optional
REDIS_URL="redis://user:password@host:6379"
```

### Deployment Steps

1. **Build**
   ```bash
   npm run build
   ```

2. **Migrate Database**
   ```bash
   npx prisma migrate deploy
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Setup Cron Jobs** (for history cleanup)
   ```typescript
   // vercel.json
   {
     "crons": [{
       "path": "/api/cron/cleanup-history",
       "schedule": "0 * * * *" // Every hour
     }]
   }
   ```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
console.log('🔍 AI Request:', {
  userId: session.user.id,
  type: 'suggest-name',
  method: params.method,
  url: params.url,
  timestamp: new Date().toISOString(),
});

console.log('✅ Docs generated:', {
  requestId: params.requestId,
  duration: `${duration}ms`,
  tokensUsed: result.usage.tokens,
});
```

### Error Tracking

```typescript
try {
  const result = await generateApiDocumentation(params);
  return result;
} catch (error) {
  console.error('❌ Error generating documentation:', {
    error: error.message,
    stack: error.stack,
    params,
  });
  
  // Send to error tracking service (Sentry, etc.)
  throw error;
}
```

### Performance Metrics

- **Request Execution Time**: Tracked in RequestHistory
- **AI Generation Time**: Logged in console
- **Database Query Time**: Prisma query logging
- **API Response Time**: Monitored via Vercel Analytics

---

## Future Roadmap

### Phase 1: Enhanced Testing (Q4 2025)
- ✅ Request History (COMPLETED)
- ✅ AI Documentation (COMPLETED)
- ⏳ Request Scheduling (cron-based execution)
- ⏳ Mock Server (built-in API mocking)
- ⏳ Test Automation (test suites and runners)

### Phase 2: Collaboration (Q1 2026)
- ⏳ Real-time Collaboration (multiple users editing)
- ⏳ Comments & Annotations
- ⏳ Version Control (request versioning)
- ⏳ Change Tracking

### Phase 3: Advanced Features (Q2 2026)
- ⏳ GraphQL Support
- ⏳ gRPC Testing
- ⏳ Performance Testing (load testing)
- ⏳ API Monitoring (uptime tracking)

### Phase 4: Enterprise Features (Q3 2026)
- ⏳ SSO Integration
- ⏳ Audit Logs
- ⏳ Advanced Analytics
- ⏳ Custom Domains
- ⏳ White-labeling

---

## Conclusion

PostBoy represents a modern approach to API testing, combining:

✅ **Cutting-edge Technology**: Next.js 15.5.4, Turbopack, React 19  
✅ **AI-Powered Features**: Gemini 2.0 Flash integration  
✅ **Developer Experience**: Auto-save, keyboard shortcuts, real-time updates  
✅ **Collaboration**: Multi-tenant, role-based access  
✅ **Performance**: Optimized queries, caching, debouncing  
✅ **Security**: OAuth, session management, data isolation  

The system is designed to scale horizontally, support enterprise features, and provide a seamless developer experience comparable to industry-leading tools like Postman and Insomnia.

---

**Document Version:** 3.0.0  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026  
**Maintainer:** PostBoy Development Team
