# 🚀 PostBoy - AI-Powered API Testing Platform

> A modern, intelligent API testing platform built with Next.js 15.5.4, featuring AI-driven documentation generation, real-time collaboration, and auto-expiring request history.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-316192?logo=postgresql)](https://www.postgresql.org)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini_2.0-4285F4?logo=google)](https://ai.google.dev)

---

## ✨ Features

### 🤖 AI-Powered Features
- **Smart Request Naming**: AI generates meaningful request names based on URL and HTTP method
- **JSON Body Generation**: Create request bodies from natural language prompts
- **API Documentation Generator**: Automatically creates comprehensive markdown documentation
- **Intelligent Suggestions**: Context-aware recommendations for API testing

### 🎯 Core Functionality
- **Multi-Workspace Management**: Organize projects in isolated workspaces
- **Collection Organization**: Hierarchical request organization
- **Request Playground**: Multi-tab interface with auto-save (2s debounce)
- **HTTP Method Support**: GET, POST, PUT, PATCH, DELETE
- **Real-time Response Viewer**: Monaco Editor integration
- **Request History**: 24-hour auto-expiring history tracking
- **Environment Variables**: Dynamic variable substitution

### 👥 Collaboration & Security
- **Role-Based Access Control**: ADMIN, EDITOR, VIEWER roles
- **Workspace Invitations**: Secure invite system with time-limited tokens
- **OAuth Authentication**: Google and GitHub integration
- **Session Management**: Secure token-based authentication

### 💻 Developer Experience
- **Keyboard Shortcuts**: 
  - `Ctrl+G` - Send request
  - `Ctrl+S` - Save request
- **Auto-Save**: Debounced automatic saving
- **Toast Notifications**: Real-time feedback
- **Dark Mode**: VS Code-style dark theme
- **Responsive Design**: Works on all devices

---

## 📚 Documentation

### 📖 Comprehensive Guides

- **[Database Design](./docs/database-design-v2.md)** - Complete database schema, ERD diagrams, indexes, and security considerations
- **[System Design](./docs/system-design-v3.md)** - Full system architecture, AI integration, workflows, and deployment strategy

These documents include:
- 📊 Mermaid diagrams (ERD, sequence, flowcharts)
- 🏗️ Architecture patterns and design decisions
- 🔐 Security and authentication flows
- ⚡ Performance optimization strategies
- 🤖 AI integration implementation details
- 🚀 Deployment and monitoring guides

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router + Turbopack)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **State Management**: 
  - Zustand 5.0.8 (Client State)
  - TanStack Query 5.90.2 (Server State)
- **Code Editor**: Monaco Editor 4.7.0
- **HTTP Client**: Axios 1.12.2

### Backend
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 16+
- **ORM**: Prisma 6.16.2
- **Authentication**: Better Auth 1.3.23
- **AI Integration**: 
  - Vercel AI SDK 5.0.60
  - Google Gemini 2.0 Flash

### Developer Tools
- ESLint - Code linting
- Prettier - Code formatting
- Git - Version control
- Docker - PostgreSQL containerization
- Prisma Studio - Database GUI

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm/yarn/pnpm/bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pawandasila/postman.git
   cd postman
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Setup environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/postboy"

   # Authentication
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"

   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # AI Integration
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   ```

4. **Setup database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Open Prisma Studio to view database
   npx prisma studio
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
postman/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   ├── (workspace)/         # Main workspace pages
│   │   └── api/                 # API routes
│   │       ├── auth/            # Better Auth routes
│   │       ├── ai/              # AI integration endpoints
│   │       └── history/         # Request history API
│   ├── modules/                 # Feature modules
│   │   ├── Layout/              # Layout components
│   │   ├── Workspace/           # Workspace management
│   │   ├── collections/         # Collection management
│   │   ├── request/             # Request playground
│   │   ├── ai/                  # AI features
│   │   ├── docs/                # Documentation generator
│   │   └── history/             # Request history
│   ├── components/              # Shared components
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utilities & configs
│       ├── auth.ts              # Better Auth config
│       ├── db.ts                # Prisma client
│       ├── ai-agents.ts         # AI agent functions
│       └── utils.ts             # Helper functions
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── docs/                        # Documentation
│   ├── database-design-v2.md   # Database design doc
│   └── system-design-v3.md     # System design doc
├── public/                      # Static assets
└── package.json                 # Dependencies
```

---

## 🔑 Key Features Explained

### 🤖 AI Documentation Generator

Generate professional API documentation with a single click:

1. Select a workspace, collection, and request
2. Click "Generate Documentation"
3. AI analyzes the request (URL, headers, body, parameters)
4. Comprehensive markdown documentation is generated
5. Download as `.md` file

**Generated documentation includes:**
- Endpoint description
- Authentication requirements
- Headers documentation
- Request body schema with examples
- Response status codes
- Error codes
- cURL examples
- Best practices

### ⏱️ Auto-Expiring Request History

Track all your API requests with automatic cleanup:

- **24-hour retention**: History automatically expires after 24 hours
- **Real-time updates**: Instant UI refresh after request execution
- **Detailed metrics**: Response time, status code, data size
- **Workspace isolation**: Each workspace has separate history
- **Performance optimized**: Strategic database indexes for fast queries

### 💾 Auto-Save

Never lose your work:

- **2-second debounce**: Auto-saves 2 seconds after you stop typing
- **Visual indicator**: Shows "Saving..." and "Saved" status
- **No interruptions**: Saves in the background without disrupting workflow

---

## 🎯 Usage Examples

### Making Your First Request

1. **Login** with Google or GitHub
2. **Create a workspace** (e.g., "My Project")
3. **Create a collection** (e.g., "User API")
4. **Add a request**:
   - Method: `POST`
   - URL: `https://api.example.com/users`
   - Headers: `Content-Type: application/json`
   - Body: `{ "name": "John Doe", "email": "john@example.com" }`
5. **Click "Send"** or press `Ctrl+G`
6. **View response** in the Monaco Editor
7. **Check history** in the sidebar

### Generating API Documentation

1. Click the **"Docs"** button in the sidebar
2. Select your **workspace**, **collection**, and **request**
3. Click **"Generate Documentation"**
4. Wait for AI to analyze (3-5 seconds)
5. Preview the documentation
6. Click **"Download Markdown"**

### Using AI JSON Generator

1. In the request body editor, click **"Generate with AI"**
2. Enter a natural language prompt:
   - "Create a user with name, email, and age"
   - "E-commerce order with items array and shipping address"
3. AI generates the JSON structure
4. Review and edit as needed

---

## 🔐 Authentication Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Add callback URL:
   - `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env`

4. **Deploy**
   - Vercel will automatically build and deploy

5. **Setup Cron Jobs** (for history cleanup)
   
   Create `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/cleanup-history",
       "schedule": "0 * * * *"
     }]
   }
   ```

### Deploy to Other Platforms

See the [System Design Documentation](./docs/system-design-v3.md#deployment-architecture) for detailed deployment guides.

---

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - Authentication (Better Auth)
- **Session** - Session management
- **Workspace** - Multi-tenant workspaces
- **WorkspaceMember** - RBAC (ADMIN/EDITOR/VIEWER)
- **Collection** - Request organization
- **Request** - API requests
- **RequestRun** - Execution history
- **RequestHistory** - Auto-expiring 24h history
- **Environment** - Environment variables
- **WebSocketPreset** - WebSocket testing

See [Database Design](./docs/database-design-v2.md) for complete schema, ERD diagrams, and relationships.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Vercel](https://vercel.com) - Deployment platform
- [Prisma](https://www.prisma.io) - Database toolkit
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Google AI](https://ai.google.dev) - AI integration
- [Better Auth](https://better-auth.vercel.app) - Authentication

---

## 📧 Contact

**Developer**: Pawan Dasila  
**Repository**: [github.com/Pawandasila/postman](https://github.com/Pawandasila/postman)

---

## 🗺️ Roadmap

### ✅ Completed (v1.0 - October 2025)
- Multi-workspace management
- Collection organization
- Request playground with auto-save
- AI-powered documentation generator
- Smart request naming
- JSON body generation
- 24-hour auto-expiring history
- OAuth authentication (Google, GitHub)
- RBAC system

### 🚧 In Progress
- Request scheduling (cron-based execution)
- Mock server (built-in API mocking)

### 🔮 Planned Features
- **Q4 2025**: Test automation, request suites
- **Q1 2026**: Real-time collaboration, version control
- **Q2 2026**: GraphQL support, gRPC testing, performance testing
- **Q3 2026**: SSO integration, audit logs, advanced analytics

See [System Design - Future Roadmap](./docs/system-design-v3.md#future-roadmap) for detailed plans.

---

<div align="center">

**Built with ❤️ using Next.js 15.5.4 and Google Gemini 2.0**

⭐ Star this repository if you find it helpful!

</div>
