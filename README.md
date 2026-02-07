# 🐪 CAMEL Agentic Browser & Jira Framework

A premium, state-of-the-art agentic framework for autonomous web exploration and Jira project management. Powered by **CAMEL-AI** and scaled for the enterprise.

## 🚀 Features

- **Autonomous Agentic Browser**: A high-fidelity operator interface designed for monitoring AI-driven web tasks.
- **Smart Jira Automation**: Seamlessly create, update, and manage Jira tickets based on complex requirements.
- **Advanced PM Agent**: A specialized agent that decomposes vague user requests into actionable technical tasks.
- **Centralized Config System**: Enterprise-ready configuration for Azure OpenAI 5.1 and toolkits.

## 🛠️ Technology Stack

- **AI Orchestration**: [CAMEL-AI](https://www.camel-ai.org/)
- **Frontend**: React + Vite + Lucide Icons
- **Design System**: Custom Layered Glassmorphism (Vanilla CSS)
- **Backend**: Python 3.11+
- **API**: Azure OpenAI GPT-5.1 & Jira REST API

## 📦 Project Structure

```bash
├── agents/          # Specialized ChatAgents
├── config/          # Centralized settings & model factories
├── frontend/        # React-based Operator Interface
├── prompts/         # AI personality & system messages
├── tools/           # Custom Toolkits (Jira, Browser)
└── tests/           # Integrated test suites
```

## 🚦 Getting Started

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run integration tests
export PYTHONPATH=$PYTHONPATH:.
python3 tests/test_pm_agent.py
```

### 2. Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

---

Developed with ❤️ by the Agentic Development Team.
