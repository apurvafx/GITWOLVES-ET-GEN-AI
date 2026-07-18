from fastapi import FastAPI, Depends, HTTPException, Header, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db_connection
from models import RegisterCompanyRequest, LoginRequest, CreateEmployeeRequest, ChatRequest
import auth
import secrets
from datetime import datetime
import search_engine
import graph_parser

# Initialize Database on Startup
init_db()

app = FastAPI(
    title="Industrial Knowledge Intelligence API",
    description="Multi-tenant Asset & Operations Brain backend",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency injection to authenticate and return the current user."""
    token = credentials.credentials
    user = auth.verify_session(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Dependency injection to enforce admin-only access."""
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user

@app.get("/health")
def health_check():
    """Simple endpoint to verify server is active."""
    return {"status": "healthy", "service": "assetbrain-backend"}

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/register-company", status_code=status.HTTP_201_CREATED)
def register_company(payload: RegisterCompanyRequest):
    """Registers a new company and its first Admin user."""
    try:
        company_id, admin_id = auth.create_company_and_admin(
            company_name=payload.company_name,
            admin_username=payload.admin_username,
            admin_password=payload.admin_password
        )
        return {
            "message": "Company and admin account created successfully.",
            "company_id": company_id,
            "admin_id": admin_id
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    """Authenticates users and returns a session token."""
    user = auth.authenticate_user(payload.username, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create database-backed session token
    token = auth.create_session(user["id"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "role": user["role"],
            "company_id": user["company_id"]
        }
    }

@app.post("/api/auth/create-employee", status_code=status.HTTP_201_CREATED)
def create_employee(payload: CreateEmployeeRequest, admin: dict = Depends(require_admin)):
    """Allows a company Admin to register employee accounts under their company."""
    try:
        employee_id = auth.create_employee(
            employee_username=payload.employee_username,
            employee_password=payload.employee_password,
            company_id=admin["company_id"]
        )
        return {
            "message": "Employee account registered successfully.",
            "employee_id": employee_id
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.get("/api/auth/me")
def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Returns the profile metadata of the current authenticated user."""
    return user

@app.post("/api/auth/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Terminates the current session token."""
    auth.delete_session(credentials.credentials)
    return {"message": "Logged out successfully."}

# --- DOCUMENT & GRAPH API ROUTES ---

@app.post("/api/docs/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    """Uploads a technical document, chunks it, embeds it, and extracts the knowledge graph."""
    if not file.filename.endswith(('.txt', '.md')):
        raise HTTPException(status_code=400, detail="Only plain text (.txt) and markdown (.md) files are supported.")
    
    try:
        # Read file content as text
        contents = await file.read()
        text_content = contents.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")
        
    company_id = admin["company_id"]
    doc_id = f"doc_{secrets.token_hex(4)}"
    uploaded_at = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Save document to DB
        cursor.execute(
            "INSERT INTO documents (id, filename, content, company_id, uploaded_at) VALUES (?, ?, ?, ?, ?)",
            (doc_id, file.filename, text_content, company_id, uploaded_at)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save document metadata: {e}")
    finally:
        conn.close()
        
    try:
        # 2. Chunk and index document embeddings (RAG Search Index)
        search_engine.index_document(doc_id, file.filename, text_content, company_id)
        
        # 3. Call Gemini to extract graph nodes and edges (Knowledge Graph build)
        graph_parser.process_document_graph(text_content, company_id)
        
        return {
            "message": "Document uploaded and indexed successfully.",
            "doc_id": doc_id,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed during AI processing (embeddings or graph): {e}")

@app.get("/api/docs/list")
def list_documents(user: dict = Depends(get_current_user)):
    """Lists all technical manuals and reports uploaded for the user's company."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, filename, uploaded_at FROM documents WHERE company_id = ? ORDER BY uploaded_at DESC",
        (user["company_id"],)
    )
    docs = cursor.fetchall()
    conn.close()
    return [dict(doc) for doc in docs]

@app.get("/api/graph/network")
def get_graph_network(user: dict = Depends(get_current_user)):
    """Returns all nodes and edges in the company's knowledge graph."""
    company_id = user["company_id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch all nodes
    cursor.execute("SELECT id, name, type FROM graph_nodes WHERE company_id = ?", (company_id,))
    nodes = [dict(row) for row in cursor.fetchall()]
    
    # Fetch all edges
    cursor.execute("SELECT source_id, target_id, rel_type FROM graph_edges WHERE company_id = ?", (company_id,))
    edges = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return {"nodes": nodes, "edges": edges}

@app.post("/api/copilot/chat")
def copilot_chat(payload: ChatRequest, user: dict = Depends(get_current_user)):
    """RAG Chat Copilot: searches context, calls Gemini to synthesize an answer, and maps active graph nodes."""
    company_id = user["company_id"]
    
    # 1. Retrieve top 3 matching chunks using Hybrid Search (TF-IDF + Cosine similarity)
    chunks = search_engine.hybrid_search(payload.query, company_id, top_k=3)
    
    if not chunks:
        return {
            "answer": "No documents found. Please upload manuals or operating procedures first.",
            "citations": [],
            "active_nodes": []
        }
        
    # 2. Call Gemini to synthesize a grounded response with citations and active node mapping
    response = search_engine.generate_rag_answer(payload.query, chunks, company_id)
    return response
