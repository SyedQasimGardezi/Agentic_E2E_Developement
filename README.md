# 🐪 CAMEL Agentic Browser & Jira Framework

A premium, state-of-the-art agentic framework for autonomous web exploration and Jira project management. Powered by **CAMEL-AI** and scaled for the enterprise.

## Key Features

- **Context-Bound Planning**: Agents analyze repository structure before proposing changes.
- **Unified Ecosystem**: Integrated Jira, GitHub, and Docker environments.
- **Traceable Progress**: Real-time progress tracking for background agent tasks.
- **Smart Jira Automation**: Seamlessly create, update, and manage Jira tickets based on complex requirements

- **GitHub Integration**: Deep repository analysis for understanding codebase structure and dependencies
- **Premium UI**: React-based operator interface with real-time progress tracking

## NEW WORKFLOW: CONTEXT-DRIVEN SPECIFICATION

### Phase 1: Deep Repository Analysis

The Specs Agent now mandates a thorough analysis phase before any ticket is proposed:

1.  **Repository Analysis**: Explores the Git repository structure using GitHub tools
2.  **Integration Mapping**: Identifies all files that will be affected by the change
3.  **Context Gathering**: Reads relevant existing files to understand patterns and conventions
4.  **Comprehensive Specification**: Creates a detailed ticket with:
    - Exact file paths to modify
    - Step-by-step implementation guide
    - Integration safety analysis
    - Testing checklist
    - Breaking change risk assessment

**Example**: "Add user authentication"
- Specs Agent explores `/backend/routes`, `/frontend/src/components`
- Identifies existing auth patterns
- Maps all files that import user-related modules
- Creates ticket with complete context for Developer Agent

### Developer Agent (Implementation)
Receives context-rich tickets from Specs Agent and executes the implementation:
- Knows exactly which files to modify
- Understands integration points
- Follows established patterns
- Runs tests and verifies changes

See `docs/TICKET_TEMPLATE_EXAMPLE.md` for the comprehensive ticket format.

## 🛠️ Technology Stack

- **AI Orchestration**: [CAMEL-AI](https://www.camel-ai.org/)
- **Frontend**: React + Vite + Lucide Icons
- **Design System**: Custom Layered Glassmorphism (Vanilla CSS)
- **Backend**: FastAPI + Python 3.11+
- **Integrations**: Azure OpenAI GPT-5.1, Jira REST API, GitHub API

## 📦 Project Structure

```bash
├── agents/          # Specialized ChatAgents (Specs, Developer)
├── config/          # Centralized settings & model factories
├── docs/            # Documentation & ticket templates
├── frontend/        # React-based Operator Interface
├── models/          # Domain models (Tickets, GitHub, Agent State)
├── prompts/         # AI personality & system messages
├── routes/          # FastAPI endpoints
├── schemas/         # Pydantic request/response models
├── tools/           # Custom Toolkits (Jira, GitHub, Progress Tracking)
└── tests/           # Integrated test suites
```

## 🚦 Getting Started

### 1. Environment Setup

Create a `.env` file with:
```bash
# Azure OpenAI GPT-5.1
GPT51_AZURE_OPENAI_API_KEY=your_key
GPT51_OPENAI_RESOURCE=your_resource
GPT51_OPENAI_MODEL=your_model
GPT51_OPENAI_API_VERSION=2024-08-01-preview

# Jira
JIRA_API_TOKEN=your_token
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your_email
JIRA_PROJECT_KEY=YOUR_KEY

# GitHub
GITHUB_ACCESS_TOKEN=your_github_token
```

### 2. Backend Setup

1. **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    cd frontend && npm install
    ```

2. **Run Backend Server**:

    ```bash
    python3 main.py
    ```

3.  **Run Integration Tests**:

    ```bash
    export PYTHONPATH=$PYTHONPATH:.
    python3 tests/test_specs_agent.py
    ```

### 3. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Access the UI at `http://localhost:5173`

## 🎮 Usage

1. **Connect GitHub Repository**: Click the GitHub button in the top bar
2. **Create Specification**: Chat with Specs Agent about your feature
3. **Review Ticket**: Specs Agent proposes a comprehensive ticket with full context
4. **Approve & Implement**: Developer Agent executes with all necessary information

---

Developed with ❤️ by the Agentic Development Team.
