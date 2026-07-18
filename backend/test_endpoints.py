import os
import shutil
import time
from fastapi.testclient import TestClient
from main import app
from database import get_db_connection

client = TestClient(app)

# set up path to test manual
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")
TEST_FILE = os.path.join(SEED_DIR, "oem_pump_manual.txt")

def run_integration_test():
    print("="*60)
    print("STARTING DAY 2 END-TO-END ENDPOINTS INTEGRATION TEST")
    print("="*60)
    
    # 1. Register a Test Company
    print("\n[Step 1] Registering test company...")
    reg_response = client.post("/api/auth/register-company", json={
        "company_name": "Test Refinery Corp",
        "admin_username": "admin_refinery",
        "admin_password": "SafePassword123!"
    })
    
    if reg_response.status_code == 201:
        print("-> Success: Company and Admin registered.")
    else:
        print(f"-> Warning/Info: Registration returned status {reg_response.status_code}. Details: {reg_response.json()}")
        
    # 2. Login to get Session Token
    print("\n[Step 2] Logging in as Admin...")
    login_response = client.post("/api/auth/login", json={
        "username": "admin_refinery",
        "password": "SafePassword123!"
    })
    assert login_response.status_code == 200, f"Login failed: {login_response.json()}"
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("-> Success: Auth Token acquired.")
    
    # Clean up old database entries for this test company to ensure a fresh test run
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT company_id FROM users WHERE username = ?", ("admin_refinery",))
    comp_row = cursor.fetchone()
    if comp_row:
        comp_id = comp_row["company_id"]
        cursor.execute("DELETE FROM documents WHERE company_id = ?", (comp_id,))
        cursor.execute("DELETE FROM graph_nodes WHERE company_id = ?", (comp_id,))
        cursor.execute("DELETE FROM graph_edges WHERE company_id = ?", (comp_id,))
        conn.commit()
        print("-> Success: Old test data cleaned from database.")
    conn.close()
    
    # 3. Upload all seed documents to trigger Ingestion, Chunking, Embeddings, and Graph Parser
    print("\n[Step 3] Uploading all seed documents...")
    SEED_FILES = [
        "oem_pump_manual.txt",
        "sop_isolation_procedure.txt",
        "oisd_safety_standard.txt",
        "incident_report_june.txt"
    ]
    
    for filename in SEED_FILES:
        filepath = os.path.join(SEED_DIR, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Missing seed file for test: {filepath}")
            
        with open(filepath, "rb") as f:
            upload_response = client.post(
                "/api/docs/upload",
                files={"file": (filename, f, "text/plain")},
                headers=headers
            )
        assert upload_response.status_code == 201, f"Upload failed for {filename}: {upload_response.json()}"
        print(f"-> Success: Uploaded and parsed {filename}.")
        time.sleep(5)
    
    # 4. Verify documents are listed
    print("\n[Step 4] Querying /api/docs/list...")
    list_response = client.get("/api/docs/list", headers=headers)
    assert list_response.status_code == 200, f"List failed: {list_response.json()}"
    print(f"-> Success: Found {len(list_response.json())} documents in database.")
    
    # 5. Query Graph Network to verify extracted nodes and edges
    print("\n[Step 5] Querying /api/graph/network...")
    graph_response = client.get("/api/graph/network", headers=headers)
    assert graph_response.status_code == 200, f"Graph retrieval failed: {graph_response.json()}"
    graph_data = graph_response.json()
    print(f"-> Success: Knowledge Graph contains {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges.")
    
    # 6. Test RAG Chat Copilot with different queries
    print("\n[Step 6] Running Chat Query Tests...")
    
    queries = [
        {
            "label": "QUERY 1: STANDARD IN-CONTEXT QUERY (Centrifugal Pump Warning)",
            "text": "what is the temperature warning threshold for the centrifugal pump?"
        },
        {
            "label": "QUERY 2: OUT-OF-CONTEXT QUERY (Cake baking)",
            "text": "How do I bake a chocolate cake at home?"
        },
        {
            "label": "QUERY 3: CROSS-DOCUMENT QUERY (OISD and SOP isolation standards)",
            "text": "What does OISD-GDN-115 say about double block and bleed isolation, and how does SOP-OPS-12 relate to it?"
        }
    ]
    
    for q in queries:
        print("\n" + "="*60)
        print(q["label"])
        print("="*60)
        print(f"User Question: '{q['text']}'")
        
        chat_response = client.post(
            "/api/copilot/chat",
            json={"query": q["text"]},
            headers=headers
        )
        assert chat_response.status_code == 200, f"Chat failed: {chat_response.json()}"
        chat_data = chat_response.json()
        
        print("\nCOPILOT RESPONSE:")
        print(chat_data["answer"])
        print("\nCITATIONS:", chat_data["citations"])
        print("ACTIVE GRAPH NODES MAPPED:", chat_data["active_nodes"])
        print("="*60)
        time.sleep(5)

if __name__ == "__main__":
    try:
        run_integration_test()
    except Exception as e:
        print(f"\nIntegration test failed: {e}")
