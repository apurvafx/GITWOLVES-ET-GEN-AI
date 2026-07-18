import os
from database import get_db_connection
from graph_parser import process_document_graph

# set up path to seed documents
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")
SEED_FILES = [
    "oem_pump_manual.txt",
    "sop_isolation_procedure.txt",
    "oisd_safety_standard.txt",
    "incident_report_june.txt"
]

def run_test():
    company_id = "test_company_eval"
    
    # clear old graph data for clean run
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM graph_nodes WHERE company_id = ?", (company_id,))
    cursor.execute("DELETE FROM graph_edges WHERE company_id = ?", (company_id,))
    conn.commit()
    conn.close()
    
    print("Old graph data cleared.")
    
    # parse each file using gemini
    for filename in SEED_FILES:
        filepath = os.path.join(SEED_DIR, filename)
        print(f"\nProcessing file: {filename}...")
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        process_document_graph(content, company_id)
        
    # print final graph database content
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n" + "="*50)
    print("SAVED GRAPH NODES IN DATABASE")
    print("="*50)
    cursor.execute("SELECT id, name, type FROM graph_nodes WHERE company_id = ?", (company_id,))
    nodes = cursor.fetchall()
    for n in nodes:
        print(f"[{n['type'].upper()}] ID: {n['id']} | Name: {n['name']}")
        
    print("\n" + "="*50)
    print("SAVED GRAPH EDGES IN DATABASE")
    print("="*50)
    cursor.execute("SELECT source_id, target_id, rel_type FROM graph_edges WHERE company_id = ?", (company_id,))
    edges = cursor.fetchall()
    for e in edges:
        print(f"{e['source_id']} --({e['rel_type']})--> {e['target_id']}")
    
    conn.close()

if __name__ == "__main__":
    print("Starting Knowledge Graph parser test...")
    run_test()
