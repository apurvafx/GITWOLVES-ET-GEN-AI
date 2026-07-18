import os
import secrets
from database import get_db_connection
from search_engine import index_document, hybrid_search

# set up path to seed documents
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")
SEED_FILES = {
    "oem_pump_manual.txt": os.path.join(SEED_DIR, "oem_pump_manual.txt"),
    "sop_isolation_procedure.txt": os.path.join(SEED_DIR, "sop_isolation_procedure.txt"),
    "oisd_safety_standard.txt": os.path.join(SEED_DIR, "oisd_safety_standard.txt"),
    "incident_report_june.txt": os.path.join(SEED_DIR, "incident_report_june.txt")
}

# evaluation benchmark (queries and ground truths)
BENCHMARK = [
    {
        "query": "What is the maximum operating pressure limit of PUMP-101A?",
        "expected_doc": "oem_pump_manual.txt"
    },
    {
        "query": "How do I safely isolate electrical VALVE-102?",
        "expected_doc": "sop_isolation_procedure.txt"
    },
    {
        "query": "What does standard OISD-GDN-115 say about double block and bleed?",
        "expected_doc": "oisd_safety_standard.txt"
    },
    {
        "query": "Why did the refinery feed pump fail in June 2026?",
        "expected_doc": "incident_report_june.txt"
    },
    {
        "query": "what is the vibration warning limit velocity for API 610 pumps?",
        "expected_doc": "oem_pump_manual.txt"
    },
    # ambiguous query (asks for VALVE-102 tolerances, which do not exist in the SOP)
    {
        "query": "What are the standard mechanical tolerances for VALVE-102 isolation pins?",
        "expected_doc": "sop_isolation_procedure.txt"
    },
    # out-of-domain shift logging query (not mentioned in the logs)
    {
        "query": "Operator names and shift handover log for PUMP-101A shutdown",
        "expected_doc": "incident_report_june.txt"
    }
]

# database setup for test company
def setup_evaluation_data() -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    company_id = "test_company_eval"
    company_name = "Evaluation Test Corp"
    
    # reset previous test entries
    cursor.execute("DELETE FROM companies WHERE id = ?", (company_id,))
    
    # insert test company
    cursor.execute(
        "INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)",
        (company_id, company_name, "2026-07-18T00:00:00")
    )
    conn.commit()
    conn.close()
    
    print(f"Company '{company_name}' initialized in database.")
    
    # load and index files
    for filename, filepath in SEED_FILES.items():
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Missing file: {filepath}")
            
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # save raw doc metadata
        conn = get_db_connection()
        cursor = conn.cursor()
        doc_id = f"doc_{secrets.token_hex(4)}"
        cursor.execute(
            "INSERT INTO documents (id, filename, content, company_id, uploaded_at) VALUES (?, ?, ?, ?, ?)",
            (doc_id, filename, content, company_id, "2026-07-18T00:00:00")
        )
        conn.commit()
        conn.close()
        
        # chunk and save chunks with embeddings
        index_document(doc_id, filename, content, company_id)
        print(f"Indexed document: {filename}")
        
    return company_id

# run evaluation loop and calculate metrics
def run_evaluation(company_id: str):
    print("\n" + "="*50)
    print("RUNNING SEARCH ENGINE EVALUATION METRICS")
    print("="*50)
    
    total_queries = len(BENCHMARK)
    hits_at_1 = 0
    hits_at_3 = 0
    reciprocal_ranks = []
    
    for i, q_meta in enumerate(BENCHMARK):
        query = q_meta["query"]
        expected_doc = q_meta["expected_doc"]
        
        print(f"\nQuery #{i+1}: '{query}'")
        print(f"Expected Source: {expected_doc}")
        
        # search top 3 chunks
        results = hybrid_search(query, company_id, top_k=3)
        
        # find matching rank
        rank = 0
        found = False
        for idx, res in enumerate(results):
            if res["filename"] == expected_doc:
                rank = idx + 1
                found = True
                break
                
        if found:
            print(f"-> SUCCESS: Found at Rank {rank} (Score: {results[rank-1]['score']:.4f})")
            reciprocal_ranks.append(1.0 / rank)
            if rank == 1:
                hits_at_1 += 1
            if rank <= 3:
                hits_at_3 += 1
        else:
            print("-> FAILURE: Correct document not in top 3 results.")
            reciprocal_ranks.append(0.0)
            for r in results:
                print(f"   [Retrieved: {r['filename']} (Score: {r['score']:.4f})]")
                
    # calculate final hit rate and mrr
    hit_rate_1 = (hits_at_1 / total_queries) * 100
    hit_rate_3 = (hits_at_3 / total_queries) * 100
    mrr = sum(reciprocal_ranks) / total_queries
    
    print("\n" + "="*50)
    print("FINAL EVALUATION METRICS REPORT")
    print("="*50)
    print(f"Total Test Queries Run  : {total_queries}")
    print(f"Hit Rate @ Rank 1 (HR@1): {hit_rate_1:.1f}%")
    print(f"Hit Rate @ Top 3 (HR@3) : {hit_rate_3:.1f}%")
    print(f"Mean Reciprocal Rank    : {mrr:.4f}")
    print("="*50)

if __name__ == "__main__":
    # check for active api key
    api_key_status = "ACTIVE" if os.environ.get("GEMINI_API_KEY") else "MISSING (Using local TF-IDF keyword match only)"
    print(f"Gemini API Status: {api_key_status}")
    
    try:
        test_company = setup_evaluation_data()
        run_evaluation(test_company)
    except Exception as e:
        print(f"\nEvaluation failed with error: {e}")
