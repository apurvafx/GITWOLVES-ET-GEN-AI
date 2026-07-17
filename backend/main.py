from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from models import RegisterCompanyRequest, LoginRequest, CreateEmployeeRequest, ChatRequest
import auth

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

# --- DOCUMENT & GRAPH API PLACEHOLDERS (For Day 2) ---

@app.post("/api/docs/upload")
def upload_document(admin: dict = Depends(require_admin)):
    """Upload pipeline for documents. (Placeholder for Day 2)"""
    return {"message": "Document upload endpoint placeholder."}

@app.get("/api/docs/list")
def list_documents(user: dict = Depends(get_current_user)):
    """List company-specific documents. (Placeholder for Day 2)"""
    return {"message": "List documents endpoint placeholder."}

@app.get("/api/graph/network")
def get_graph_network(user: dict = Depends(get_current_user)):
    """Returns the company's knowledge graph nodes and edges. (Placeholder for Day 2)"""
    return {"message": "Graph network endpoint placeholder."}

@app.post("/api/copilot/chat")
def copilot_chat(payload: ChatRequest, user: dict = Depends(get_current_user)):
    """Processes RAG & Graph queries. (Placeholder for Day 2)"""
    return {"message": "Copilot RAG chat endpoint placeholder."}
