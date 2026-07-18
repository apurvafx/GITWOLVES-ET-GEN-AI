import os
import sys
from search_engine import load_dotenv

# Add backend directory to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from search_engine import hybrid_search, generate_rag_answer
from database import get_db_connection

def main():
    load_dotenv()
    
    # Use the default test company we set up
    company_id = "test_company_eval"
    
    # If the database is empty, remind them
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM documents WHERE company_id = ?", (company_id,))
    doc_count = cursor.fetchone()["count"]
    
    # Fallback to the test_endpoints corporation if test company is empty
    if doc_count == 0:
        cursor.execute("SELECT id FROM companies ORDER BY created_at DESC LIMIT 1")
        last_comp = cursor.fetchone()
        if last_comp:
            company_id = last_comp["id"]
            cursor.execute("SELECT COUNT(*) as count FROM documents WHERE company_id = ?", (company_id,))
            doc_count = cursor.fetchone()["count"]
            
    conn.close()
    
    print("="*60)
    print("🤖 INDUSTRIAL COPILOT INTERACTIVE TERMINAL CHAT")
    print("="*60)
    print(f"Connected to Company ID: {company_id}")
    print(f"Documents indexed in database: {doc_count}")
    print("Type 'exit' or 'quit' to close the chat.")
    print("="*60)
    
    if doc_count == 0:
        print("\n[Warning] No documents found in database. Please run 'backend/test_endpoints.py' first to populate the manuals!")
        
    while True:
        try:
            query = input("\n💬 Ask Copilot: ").strip()
            if not query:
                continue
            if query.lower() in ["exit", "quit"]:
                print("Goodbye!")
                break
                
            print("Searching manuals and generating response...")
            
            # 1. Run hybrid search
            chunks = hybrid_search(query, company_id, top_k=3)
            if not chunks:
                print("❌ No matching text found in uploaded manuals.")
                continue
                
            # 2. Call Gemini-3.1-flash-lite to generate grounded RAG answer
            response = generate_rag_answer(query, chunks, company_id)
            
            print("\n" + "="*50)
            print("🤖 COPILOT RESPONSE:")
            print("="*50)
            print(response["answer"])
            print("\n" + "-"*50)
            print(f"📖 Sources Cited : {response['citations']}")
            print(f"🕸️ Connected Nodes: {response['active_nodes']}")
            print("="*50)
            
        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()
