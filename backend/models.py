from pydantic import BaseModel, Field

class RegisterCompanyRequest(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=100)
    admin_username: str = Field(..., min_length=3, max_length=50)
    admin_password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

class CreateEmployeeRequest(BaseModel):
    employee_username: str = Field(..., min_length=3, max_length=50)
    employee_password: str = Field(..., min_length=6)

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1)

class AddNodeRequest(BaseModel):
    id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    type: str = Field(..., min_length=1)

class AddEdgeRequest(BaseModel):
    source_id: str = Field(..., min_length=1)
    target_id: str = Field(..., min_length=1)
    rel_type: str = Field(default="CONNECTED_TO")
