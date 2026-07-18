import os
import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Literal
from database import get_db_connection

# Load environment variables from .env
def load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

load_dotenv()

# Configure Gemini SDK
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# Pydantic Schemas for Gemini Structured JSON Output
class NodeSchema(BaseModel):
    id: str = Field(description="Normalized uppercase ID (e.g. PUMP-101A, VALVE-102, OISD-GDN-115)")
    name: str = Field(description="Human readable name of the entity")
    type: Literal['asset', 'document', 'procedure', 'regulation', 'incident'] = Field(description="Category of the entity")

class EdgeSchema(BaseModel):
    source_id: str = Field(description="Source node ID")
    target_id: str = Field(description="Target node ID")
    rel_type: str = Field(description="Relationship type (e.g. isolates, governed-by, failed-in)")

class KnowledgeGraphSchema(BaseModel):
    nodes: List[NodeSchema] = Field(default_factory=list, description="List of all unique entities, assets, procedures, regulations, or incidents extracted from the text.")
    edges: List[EdgeSchema] = Field(default_factory=list, description="List of all directed relationships connecting the extracted nodes. You MUST populate this list with the connections found in the text.")

def extract_graph_from_text(text: str) -> dict:
    """
    Sends the text to gemini-3.5-flash to extract nodes and edges.
    Uses native Pydantic schema enforcement for 100% valid JSON responses.
    """
    if not api_key:
        print("Warning: Gemini API Key missing. Skipping graph extraction.")
        return {"nodes": [], "edges": []}
        
    prompt = f"""
    You are an expert Industrial Knowledge Graph Builder and Ontologist.
    Analyze the provided technical document and extract:
    1. Nodes (Entities): Any equipment tags, instruments, valves, standard procedures, regulations, or incidents.
    2. Edges (Relationships): How these entities connect.

    You MUST extract both the list of nodes AND the list of edges showing how they relate. 
    Rule: Every node in the 'nodes' list MUST be connected to at least one other node via an entry in the 'edges' list. Do not leave nodes unconnected.

    Document content:
    ---
    {text}
    ---
    """
    
    try:
        model = genai.GenerativeModel("gemini-3.5-flash")
        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": KnowledgeGraphSchema
            }
        )
        # Parse and return as dict
        parsed = KnowledgeGraphSchema.model_validate_json(response.text)
        return parsed.model_dump()
    except Exception as e:
        print(f"Error calling Gemini for graph extraction: {e}")
        try:
            print(f"Raw response text: {response.text}")
        except NameError:
            pass
        return {"nodes": [], "edges": []}

def save_graph_to_db(graph_data: dict, company_id: str):
    """
    Saves extracted nodes and edges into SQLite.
    Uses INSERT OR IGNORE to prevent duplicate node keys.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Save Nodes
    for node in graph_data.get("nodes", []):
        node_id = node.get("id").strip().upper()
        name = node.get("name")
        node_type = node.get("type", "asset").lower()
        
        cursor.execute(
            """
            INSERT OR IGNORE INTO graph_nodes (id, name, type, company_id) 
            VALUES (?, ?, ?, ?)
            """,
            (node_id, name, node_type, company_id)
        )
        
    # Save Edges
    for edge in graph_data.get("edges", []):
        source_id = edge.get("source_id").strip().upper()
        target_id = edge.get("target_id").strip().upper()
        rel_type = edge.get("rel_type").strip().lower()
        edge_id = f"{source_id}_{target_id}_{rel_type}"
        
        # Verify source and target nodes exist in db, insert default ones if missing
        cursor.execute("SELECT id FROM graph_nodes WHERE id = ? AND company_id = ?", (source_id, company_id))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT OR IGNORE INTO graph_nodes (id, name, type, company_id) VALUES (?, ?, ?, ?)",
                (source_id, source_id, 'asset', company_id)
            )
            
        cursor.execute("SELECT id FROM graph_nodes WHERE id = ? AND company_id = ?", (target_id, company_id))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT OR IGNORE INTO graph_nodes (id, name, type, company_id) VALUES (?, ?, ?, ?)",
                (target_id, target_id, 'asset', company_id)
            )
            
        cursor.execute(
            """
            INSERT OR IGNORE INTO graph_edges (id, source_id, target_id, rel_type, company_id) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (edge_id, source_id, target_id, rel_type, company_id)
        )
        
    conn.commit()
    conn.close()
    print("Knowledge Graph saved to database.")

def process_document_graph(doc_content: str, company_id: str):
    """Orchestrates extraction and saving of knowledge graph from text."""
    graph_data = extract_graph_from_text(doc_content)
    save_graph_to_db(graph_data, company_id)
