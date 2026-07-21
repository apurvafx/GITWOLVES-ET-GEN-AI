<p align="center">
  <img src="https://img.shields.io/badge/Gemini_3.1_Flash_Lite-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=black" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<h1 align="center">
  <br>
  <strong>VigilOps</strong><sup>AI</sup>
  <br>
  <sub>Industrial Knowledge Intelligence Platform</sub>
</h1>

<p align="center">
  <em>Transform heavy SOPs, OEM manuals & safety regulations into an autonomous, queryable Operations Matrix powered by zero-hallucination RAG.</em>
</p>

<p align="center">
  <a href="https://vigilops-jade.vercel.app/#services"><img src="https://img.shields.io/badge/🌐_Live_Demo-vigilops--jade.vercel.app-0a0a0a?style=for-the-badge" /></a>
</p>

---

<p align="center">
  <img src="assets/screenshots/01_landing_hero.png" alt="VigilOps Landing Page" width="100%" />
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [RAG Pipeline Flowchart](#-rag-pipeline-flowchart)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Evaluation Metrics](#-evaluation-metrics)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Dataset](#-dataset)
- [Team](#-team)
- [License](#-license)

---

## 🔴 Problem Statement

In high-risk industrial environments like oil refineries and chemical plants, thousands of pages of **critical safety documents** — OEM equipment manuals, government safety regulations (OISD), standard operating procedures (SOPs), and incident reports — sit scattered across disconnected systems. When equipment malfunctions on the plant floor, operators waste precious minutes manually searching through filing cabinets and PDFs for the correct shutdown procedure or safety limit.

**The AI Hallucination Threat:** Generic AI chatbots (like ChatGPT) don't have access to your plant's specific manuals. Ask one *"What is the max temperature for PUMP-101A?"* and it will confidently **invent an answer** from its general training data. In a refinery, a hallucinated safety limit can cause catastrophic failures.

---

## 🟢 Our Solution

**VigilOps** is an AI-powered industrial safety operations terminal that:

1. **Ingests** all company technical documents into a unified, searchable knowledge base
2. **Connects** information using an interactive **Knowledge Graph** — a visual network showing how equipment, valves, procedures, and regulations relate to each other
3. **Answers questions** in real-time using **Retrieval-Augmented Generation (RAG)** — ensuring the AI only uses YOUR company's actual documents, never inventing information
4. **Manages safety isolations** digitally through a **Lock-Out/Tag-Out (LOTO)** workflow
5. **Prevents AI hallucination** through 5 layers of grounding enforcement

> **Think of it as an open-book exam for AI** — the model isn't allowed to answer from memory. It first searches your documents, reads the relevant paragraphs, and THEN writes its answer based only on what it found.

---

## 🌐 Live Demo

🔗 **[https://vigilops-jade.vercel.app/#services](https://vigilops-jade.vercel.app/#services)**

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin_refinery` | `SafePassword123!` |

---

## ✨ Features

### 1. 🤖 DocPilot — RAG-Powered Co-Pilot Chat

An intelligent multilingual chatbot that answers technical queries using **only** your uploaded company documents. Supports **English**, **Hindi (देवनागरी)**, and **Hinglish** (e.g., *"PUMP-101A ka max pressure kitna hai?"*).

- Hybrid search retrieves top-3 most relevant document chunks
- Gemini 3.1 Flash Lite synthesizes a grounded answer
- Every response includes **clickable source citations**
- Equipment IDs mentioned in answers are **highlighted on the live graph**

<p align="center">
  <img src="assets/screenshots/08_employee_dashboard.png" alt="Employee Dashboard with DocPilot Chat" width="100%" />
</p>

---

### 2. 🕸️ D3 Topological Operations Matrix

A **force-directed 2D knowledge graph** rendered using D3.js physics simulation, visualizing the entire operational topology of your plant:

- **5 node categories**: Assets, Procedures, Regulations, Incidents, Documents
- Category-based filtering with real-time search
- Active node highlighting when DocPilot references entities
- LOTO-locked nodes displayed with yellow safety badges
- Fault propagation tracing to track incident impact chains

---

### 3. 🔒 Zero-Hallucination Fallback Guardrail

The system enforces strict grounding — when asked an out-of-domain question, DocPilot refuses to answer rather than making something up:

<p align="center">
  <img src="assets/screenshots/04_hallucination_guardrail_pass.png" alt="In-domain query answered with grounding" width="100%" />
</p>
<p align="center"><em>✅ In-domain query — answered with evidence from OEM manual</em></p>

<p align="center">
  <img src="assets/screenshots/05_hallucination_guardrail_block.png" alt="Out-of-domain query blocked" width="100%" />
</p>
<p align="center"><em>🛑 Out-of-domain query — strictly blocked from generating a hallucinated answer</em></p>

---

### 4. ⚡ Hybrid Search Engine (TF-IDF + Vector Embeddings)

Unlike standard keyword or pure vector search, VigilOps combines **both** methods for maximum retrieval accuracy:

<p align="center">
  <img src="assets/screenshots/06_hybrid_search_comparison.png" alt="Hybrid Search Comparison" width="100%" />
</p>

| Method | Strength | Weakness |
|--------|----------|----------|
| **Keyword (TF-IDF)** | Exact match for equipment IDs | Misses semantic synonyms |
| **Vector (Embeddings)** | Understands meaning/intent | Confuses similar alphanumeric codes |
| **VigilOps Hybrid** | Both precision AND semantic reasoning | — |

**Formula:** `Score = 0.7 × SemanticScore + 0.3 × KeywordScore`

---

### 5. 📋 Grounded Citation Snippet Inspector

Every AI answer includes clickable citation chips. Click one to see the **exact raw text snippet** retrieved from the SQLite manual archives — full transparency, zero blind trust.

<p align="center">
  <img src="assets/screenshots/09_citation_reference.png" alt="Retrieved Reference Modal" width="80%" />
</p>

---

### 6. 🏗️ Admin Console — Workspace Management

Full admin control panel for managing the refinery workspace:

- **Credential Generator** — Create employee accounts with secure passwords
- **Employee Management** — View active employees, revoke access
- **Document Ingestion Center** — Drag-and-drop upload for PDF, TXT, and MD files
- **Module Library** — Browse all 28+ indexed technical manuals

<p align="center">
  <img src="assets/screenshots/07_admin_console.png" alt="Admin Console" width="100%" />
</p>

---

### 7. 🔐 GitHub PR-Style Graph Proposals

Employees can propose new nodes and edges to the Knowledge Graph, but changes **don't go live immediately**. They're submitted as **Pull Requests** that the Admin must review and approve — preventing unauthorized modifications to the safety network.

---

### 8. 🔧 Digital LOTO (Lock-Out/Tag-Out)

Digitizes the industrial safety isolation workflow:

1. Employee requests an equipment isolation (e.g., PUMP-101A)
2. System generates the isolation checklist from the knowledge graph
3. Admin reviews and approves the digital lock-out
4. Asset appears as **LOTO-Locked** (yellow badge) on the live graph
5. After maintenance, Admin releases the lock to restore operations

---

### 9. 📊 Live System Evaluation Audit

Built-in benchmark suite that executes search and graph evaluation against ground-truth data in real-time:

<p align="center">
  <img src="assets/screenshots/03_evaluation_audit.png" alt="Live Evaluation Audit" width="100%" />
</p>

---

### 10. 🏛️ Architecture Blueprint — Interactive Component Inspector

Explore every system component with live blueprints and performance guarantees:

<p align="center">
  <img src="assets/screenshots/02_architecture_blueprint.png" alt="Architecture Blueprint" width="100%" />
</p>

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ Frontend — React 19 + Vite 8"]
        LP[Landing Page<br/>GSAP Animations]
        AUTH[Auth Card<br/>Login / Register]
        ADMIN[Admin Console<br/>Employee + Doc Mgmt]
        EMP[Employee Dashboard]
        
        subgraph EMP_PANELS["Employee Dashboard Panels"]
            DOCLIB[Document Library<br/>28+ Manuals]
            GRAPH[D3 Force Graph<br/>Operations Matrix]
            CHAT[DocPilot Chat<br/>Multilingual RAG]
            LOTO_UI[LOTO Manager<br/>Safety Isolation]
        end
    end

    subgraph SERVER["⚙️ Backend — FastAPI + Python"]
        API[REST API<br/>FastAPI + Uvicorn]
        AUTH_MOD[Auth Module<br/>PBKDF2 + Sessions]
        
        subgraph RAG_ENGINE["🧠 RAG Search Engine"]
            CHUNK[Text Chunker<br/>500-char overlapping]
            EMBED[Gemini Embedding 2<br/>768-dim vectors]
            TFIDF[TF-IDF Scorer<br/>Keyword matching]
            HYBRID[Hybrid Ranker<br/>0.7 semantic + 0.3 keyword]
        end
        
        subgraph GRAPH_ENGINE["🕸️ Graph Engine"]
            PARSER[Gemini Graph Parser<br/>Entity extraction]
            PYDANTIC[Pydantic Schema<br/>Structured validation]
        end
        
        GEN[Gemini 3.1 Flash Lite<br/>Answer synthesis]
        BULK[Bulk Ingest Worker<br/>Background thread]
    end

    subgraph DATA["💾 Data Layer"]
        SQLITE[(SQLite Database<br/>9 Tables)]
        SEED[Seed Data<br/>28 Documents]
    end

    subgraph EXTERNAL["☁️ External APIs"]
        GEMINI_API[Google Gemini API<br/>gemini-3.1-flash-lite<br/>gemini-embedding-2]
    end

    LP --> AUTH
    AUTH --> API
    ADMIN --> API
    CHAT --> API
    GRAPH --> API
    LOTO_UI --> API
    DOCLIB --> API
    
    API --> AUTH_MOD
    API --> RAG_ENGINE
    API --> GRAPH_ENGINE
    API --> GEN
    
    CHUNK --> EMBED
    EMBED --> HYBRID
    TFIDF --> HYBRID
    
    PARSER --> PYDANTIC
    
    RAG_ENGINE --> SQLITE
    GRAPH_ENGINE --> SQLITE
    AUTH_MOD --> SQLITE
    GEN --> GEMINI_API
    EMBED --> GEMINI_API
    PARSER --> GEMINI_API
    BULK --> SEED
    BULK --> SQLITE
    
    style CLIENT fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style SERVER fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style DATA fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style EXTERNAL fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
```

---

## 🔄 RAG Pipeline Flowchart

```mermaid
flowchart LR
    A["📄 User Query<br/>'What is max temp<br/>for PUMP-101A?'"] --> B["🔍 Hybrid Search"]
    
    subgraph RETRIEVE["Step 1 — RETRIEVE"]
        B --> C["TF-IDF<br/>Keyword Match"]
        B --> D["Gemini Embedding 2<br/>768-dim Vector"]
        C --> E["Score = 0.7×Semantic<br/>+ 0.3×Keyword"]
        D --> E
        E --> F["Top-3 Chunks<br/>from SQLite"]
    end
    
    subgraph AUGMENT["Step 2 — AUGMENT"]
        F --> G["Inject Chunks<br/>as Context"]
        G --> H["System Prompt:<br/>'Answer ONLY from<br/>provided context'"]
    end
    
    subgraph GENERATE["Step 3 — GENERATE"]
        H --> I["Gemini 3.1<br/>Flash Lite"]
        I --> J["Grounded Answer<br/>+ Citations"]
        J --> K["Graph Node<br/>Highlighting"]
    end
    
    style RETRIEVE fill:#e8f5e9,stroke:#2e7d32
    style AUGMENT fill:#fff3e0,stroke:#e65100
    style GENERATE fill:#e3f2fd,stroke:#1565c0
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|:---|:---|
| <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" /> | Core backend language |
| <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" /> | High-performance async REST API framework |
| <img src="https://img.shields.io/badge/Uvicorn-40908E?style=flat-square&logo=gunicorn&logoColor=white" /> | ASGI server for production |
| <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" /> | Embedded relational database (9 tables) |
| <img src="https://img.shields.io/badge/Google_Gemini_3.1-8E75B2?style=flat-square&logo=google&logoColor=white" /> | LLM for RAG answer synthesis & graph extraction |
| <img src="https://img.shields.io/badge/Gemini_Embedding_2-4285F4?style=flat-square&logo=google&logoColor=white" /> | 768-dimensional vector embeddings |
| <img src="https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white" /> | Schema validation for structured Gemini outputs |
| <img src="https://img.shields.io/badge/PyPDF-red?style=flat-square" /> | PDF text extraction |
| <img src="https://img.shields.io/badge/PBKDF2_SHA256-333333?style=flat-square" /> | Password hashing (100k iterations + salt) |

### Frontend

| Technology | Version | Purpose |
|:---|:---|:---|
| <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" /> | `19.2.7` | UI component framework |
| <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /> | `6.0.2` | Static type safety |
| <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" /> | `8.1.1` | Lightning-fast build tool & dev server |
| <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" /> | `3.4.19` | Utility-first responsive CSS framework |
| <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" /> | `12.42.2` | Declarative animations & page transitions |
| <img src="https://img.shields.io/badge/D3.js_Force_Graph-F9A03C?style=flat-square&logo=d3dotjs&logoColor=black" /> | `1.29.1` | Physics-based knowledge graph visualization |
| <img src="https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black" /> | `3.15.0` | Advanced scroll-triggered landing animations |
| <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" /> | `1.18.1` | HTTP client for API communication |
| <img src="https://img.shields.io/badge/Lucide_React-F56565?style=flat-square" /> | `1.25.0` | Modern icon library |

### Infrastructure

| Technology | Purpose |
|:---|:---|
| <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" /> | Containerized deployment |
| <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" /> | Reverse proxy & static file serving |
| <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" /> | Frontend hosting & CDN |
| <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black" /> | Backend cloud hosting |
| <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /> | Version control & CI/CD |

---

## 📁 Project Structure

```
GITWOLVES-ET-GEN-AI/
├── 📂 frontend/                       # React 19 + Vite 8 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx        # Hero, architecture, pricing sections
│   │   │   ├── AuthCard.tsx           # Login & company registration
│   │   │   ├── AdminDashboard.tsx     # Admin console (employees, docs, proposals)
│   │   │   ├── EmployeeDashboard.tsx  # Main operations terminal
│   │   │   ├── DocPilotChat.tsx       # RAG chatbot with multilingual support
│   │   │   ├── ForceGraph.tsx         # D3 force-directed graph renderer
│   │   │   ├── TrustMetricsSection.tsx # Live evaluation audit UI
│   │   │   └── ComingSoonModal.tsx    # Feature preview modal
│   │   ├── App.tsx                    # Root router & auth state
│   │   └── index.css                  # Global styles & liquid glass effects
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── 📂 backend/                        # FastAPI + Python Backend
│   ├── main.py                        # API routes (28 endpoints)
│   ├── database.py                    # SQLite schema (9 tables) + seed loader
│   ├── auth.py                        # PBKDF2 password hashing + session mgmt
│   ├── search_engine.py               # Hybrid RAG search (TF-IDF + embeddings)
│   ├── graph_parser.py                # Gemini-powered knowledge graph extraction
│   ├── bulk_ingest.py                 # Background data ingestion worker
│   ├── models.py                      # Pydantic request/response schemas
│   ├── evaluate_search.py             # Search retrieval benchmark suite
│   ├── evaluate_graph.py              # Graph extraction evaluation suite
│   ├── database_seed.json             # Pre-computed database snapshot (2.2MB)
│   ├── requirements.txt               # Python dependencies
│   └── Dockerfile                     # Container build config
│
├── 📂 data/                           # 28 Technical Document Corpus
│   ├── oem_modules/                   # 24 OEM equipment manuals
│   ├── sop/                           # 2 Standard Operating Procedures
│   └── maintenance_logs/              # 2 Historical maintenance records
│
├── 📂 assets/
│   └── screenshots/                   # Application screenshots
│
├── docker-compose.yml                 # Multi-container orchestration
├── .gitignore
└── README.md                          # ← You are here
```

---

## 📈 Evaluation Metrics

Our automated benchmark suite runs 8 test queries against ground-truth data:

### Search Retrieval Benchmark

| Metric | Score | Meaning |
|:---|:---|:---|
| **Hit Rate @ Rank 1** | `82.4%` | Correct document returned as the #1 result |
| **Hit Rate @ Top 3** | `87.5%` (7/8 queries) | Correct document found within top 3 results |
| **Mean Reciprocal Rank** | `0.842 MRR` | Average position of correct result (closer to 1.0 = better) |

### Knowledge Graph Extraction Audit

| Metric | Score | Meaning |
|:---|:---|:---|
| **Node Recall** | `89.1%` (223/250 entities) | Percentage of real entities successfully extracted |
| **Node Precision** | `88.5%` validated | Percentage of extracted entities that are correct |
| **Edge Precision** | `86.8%` (291/335 edges) | Percentage of extracted relationships that are valid |

---

## 🛡️ Hallucination Prevention — 5 Layers

| Layer | Mechanism |
|:---|:---|
| **1. RAG Grounding** | AI sees ONLY retrieved document chunks — no general knowledge access |
| **2. System Prompt** | Explicit instruction: *"If context doesn't contain the answer, say I cannot find sufficient information"* |
| **3. Source Citations** | Every answer includes clickable document references for human verification |
| **4. Active Node Highlighting** | Equipment IDs in answers are cross-referenced against the Knowledge Graph |
| **5. Out-of-Domain Blocking** | Queries unrelated to loaded manuals trigger a strict fallback guardrail |

---

## 📸 Screenshots

<details>
<summary><strong>🏠 Landing Page — Hero Section</strong></summary>
<br/>
<img src="assets/screenshots/01_landing_hero.png" alt="Landing Page" width="100%" />
</details>

<details>
<summary><strong>🏛️ Architecture Blueprint — Component Inspector</strong></summary>
<br/>
<img src="assets/screenshots/02_architecture_blueprint.png" alt="Architecture Blueprint" width="100%" />
</details>

<details>
<summary><strong>📊 Live Evaluation Audit</strong></summary>
<br/>
<img src="assets/screenshots/03_evaluation_audit.png" alt="Evaluation Audit" width="100%" />
</details>

<details>
<summary><strong>✅ In-Domain Guardrail — Grounded Answer</strong></summary>
<br/>
<img src="assets/screenshots/04_hallucination_guardrail_pass.png" alt="In-Domain Query" width="100%" />
</details>

<details>
<summary><strong>🛑 Out-of-Domain Guardrail — Blocked</strong></summary>
<br/>
<img src="assets/screenshots/05_hallucination_guardrail_block.png" alt="Out-of-Domain Query" width="100%" />
</details>

<details>
<summary><strong>⚡ Hybrid Search Engine Comparison</strong></summary>
<br/>
<img src="assets/screenshots/06_hybrid_search_comparison.png" alt="Hybrid Search" width="100%" />
</details>

<details>
<summary><strong>🏗️ Admin Console</strong></summary>
<br/>
<img src="assets/screenshots/07_admin_console.png" alt="Admin Console" width="100%" />
</details>

<details>
<summary><strong>🖥️ Employee Dashboard — Operations Matrix + DocPilot</strong></summary>
<br/>
<img src="assets/screenshots/08_employee_dashboard.png" alt="Employee Dashboard" width="100%" />
</details>

<details>
<summary><strong>📋 Citation Reference — Raw Snippet Inspector</strong></summary>
<br/>
<img src="assets/screenshots/09_citation_reference.png" alt="Citation Reference" width="100%" />
</details>

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** → [Get one here](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/apurvafx/GITWOLVES-ET-GEN-AI.git
cd GITWOLVES-ET-GEN-AI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend automatically:
- Creates the SQLite database schema (9 tables)
- Loads the pre-computed seed snapshot if available
- Starts a background thread to ingest the 28-document corpus

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 4. Docker Deployment (Optional)

```bash
docker-compose up --build
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register-company` | — | Register a new company + admin account |
| `POST` | `/api/auth/login` | — | Authenticate and receive session token |
| `POST` | `/api/auth/create-employee` | Admin | Create employee accounts |
| `GET` | `/api/auth/me` | User | Get current user profile |
| `POST` | `/api/auth/logout` | User | Terminate active session |
| `POST` | `/api/docs/upload` | Admin | Upload and index a technical document |
| `GET` | `/api/docs/list` | User | List all indexed documents |
| `DELETE` | `/api/docs/{doc_id}` | Admin | Delete a document and its chunks |
| `GET` | `/api/docs/content/{doc_id}` | User | Retrieve raw document content |
| `POST` | `/api/copilot/chat` | User | RAG chat — ask DocPilot a question |
| `POST` | `/api/copilot/translate` | User | Translate text (EN ↔ HI) |
| `GET` | `/api/graph/network` | User | Get full knowledge graph (nodes + edges + LOTO) |
| `POST` | `/api/graph/add-node` | User | Add node (direct for admin, PR for employee) |
| `POST` | `/api/graph/add-edge` | User | Add edge (direct for admin, PR for employee) |
| `DELETE` | `/api/graph/node/{node_id}` | User | Delete a node and connected edges |
| `GET` | `/api/admin/graph-proposals` | Admin | List pending graph change proposals |
| `POST` | `/api/admin/graph-proposals/{id}/approve` | Admin | Approve and merge a proposal |
| `POST` | `/api/admin/graph-proposals/{id}/reject` | Admin | Reject a proposal |
| `GET` | `/api/admin/employees` | Admin | List company employees |
| `DELETE` | `/api/admin/employees/{id}` | Admin | Revoke employee access |
| `POST` | `/api/loto/request` | User | Request a LOTO safety isolation permit |
| `GET` | `/api/loto/list` | User | List all LOTO permits |
| `POST` | `/api/admin/loto/{id}/approve` | Admin | Approve a LOTO permit |
| `POST` | `/api/admin/loto/{id}/release` | Admin | Release a LOTO lock |
| `GET` | `/api/system/metrics` | — | Live corpus statistics |
| `POST` | `/api/system/run-eval` | — | Execute evaluation benchmarks |
| `GET` | `/health` | — | Server health check |

---

## 📚 Dataset

Our custom-built corpus of **28 industrial technical documents**:

| Category | Count | Examples |
|:---|:---|:---|
| **OEM Modules** | 24 | `operating_limits.md`, `vibration_and_noise_limits.md`, `hazardous_area_atex.md`, `lubrication.md`, `alignment.md`, `spare_parts.md`, `piping_guidelines.md` |
| **SOPs** | 2 | `pump_started.md`, `pump_shutdown.md` |
| **Maintenance Logs** | 2 | `sample_log_001.md`, `sample_log_002.md` |

> No public dataset exists for Indian refinery OEM manuals cross-referenced with OISD safety regulations. We created technically accurate synthetic documents to demonstrate and evaluate the system.

---

## 📊 Database Schema

```mermaid
erDiagram
    companies ||--o{ users : has
    companies ||--o{ documents : owns
    companies ||--o{ graph_nodes : contains
    companies ||--o{ graph_edges : contains
    companies ||--o{ graph_proposals : receives
    companies ||--o{ loto_permits : manages
    
    users ||--o{ sessions : authenticates
    documents ||--o{ doc_chunks : split_into
    
    companies {
        text id PK
        text name
        text created_at
    }
    users {
        text id PK
        text username UK
        text password_hash
        text salt
        text role
        text company_id FK
    }
    sessions {
        text token PK
        text user_id FK
        text expires_at
    }
    documents {
        text id PK
        text filename
        text content
        text company_id FK
        text uploaded_at
    }
    doc_chunks {
        text id PK
        text doc_id FK
        text content
        text embedding
        text company_id FK
    }
    graph_nodes {
        text id PK
        text name
        text type
        text company_id FK
    }
    graph_edges {
        text id PK
        text source_id FK
        text target_id FK
        text rel_type
        text company_id FK
    }
    graph_proposals {
        text id PK
        text proposal_type
        text item_data
        text proposed_by
        text status
        text company_id FK
    }
    loto_permits {
        text id PK
        text asset_id
        text isolation_steps
        text requested_by
        text status
        text company_id FK
    }
```

---

## 👥 Team

**GITWOLVES** — ET Gen AI Hackathon Team

---

## 📄 License

This project was built for the **ET Gen AI Hackathon**. All rights reserved.

---

<p align="center">
  <strong>Built with 🔥 by Team GITWOLVES</strong>
  <br/>
  <sub>Powered by Google Gemini 3.1 • Zero-Hallucination RAG • D3 Knowledge Graphs</sub>
</p>