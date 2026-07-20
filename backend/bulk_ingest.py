import os
import secrets
import time
from datetime import datetime
from database import init_db, get_db_connection
import auth
import search_engine
import graph_parser

def run_bulk_ingestion():
    print("=" * 60, flush=True)
    print("VIGILOPS DATA MODULE BULK INGESTION", flush=True)
    print("=" * 60, flush=True)

    # 1. Initialize DB tables
    init_db()

    # 2. Locate or create default Company & Admin
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT company_id FROM users WHERE username = ?", ("admin_refinery",))
    user_row = cursor.fetchone()
    
    if user_row:
        company_id = user_row["company_id"]
        print(f"-> Existing Refinery Company ID found: {company_id}", flush=True)
    else:
        print("-> Registering default company 'Test Refinery Corp'...", flush=True)
        company_id, _ = auth.create_company_and_admin(
            company_name="Test Refinery Corp",
            admin_username="admin_refinery",
            admin_password="SafePassword123!"
        )
        print(f"-> Company created with ID: {company_id}", flush=True)
    
    conn.close()

    # 3. Locate the data directory (root / data)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    data_dir = os.path.join(project_root, "data")

    if not os.path.exists(data_dir):
        print(f"ERROR: Data directory not found at {data_dir}", flush=True)
        return

    # Find all .md and .txt files recursively
    file_paths = []
    for root, _, files in os.walk(data_dir):
        for f in files:
            if f.endswith(".md") or f.endswith(".txt"):
                file_paths.append(os.path.join(root, f))

    file_paths.sort()
    total_files = len(file_paths)
    print(f"-> Found {total_files} document files in data/ folder.\n", flush=True)

    # 4. Ingest files into SQLite Database & Gemini Graph Engine
    success_count = 0
    skipped_count = 0

    for idx, filepath in enumerate(file_paths, 1):
        filename = os.path.basename(filepath)
        relative_path = os.path.relpath(filepath, data_dir)
        
        # Check if already indexed for this company
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM documents WHERE filename = ? AND company_id = ?", (filename, company_id))
        existing_doc = cursor.fetchone()
        conn.close()

        if existing_doc:
            print(f"[{idx}/{total_files}] Skipping '{relative_path}' (Already indexed in DB).", flush=True)
            skipped_count += 1
            continue

        print(f"[{idx}/{total_files}] Processing '{relative_path}'...", flush=True)

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                text_content = f.read()

            doc_id = f"doc_{secrets.token_hex(4)}"
            uploaded_at = datetime.utcnow().isoformat()

            # Insert into documents table
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO documents (id, filename, content, company_id, uploaded_at) VALUES (?, ?, ?, ?, ?)",
                (doc_id, filename, text_content, company_id, uploaded_at)
            )
            conn.commit()
            conn.close()

            # Generate RAG Chunks & Embeddings
            search_engine.index_document(doc_id, filename, text_content, company_id)

            # Call Gemini to parse Knowledge Graph Nodes & Edges
            graph_parser.process_document_graph(text_content, company_id)

            print(f"   -> Successfully indexed '{filename}' (RAG + Operations Matrix).", flush=True)
            success_count += 1

            # Respect Gemini 3.1 Flash-Lite 15 RPM free tier rate limit
            if idx < total_files:
                time.sleep(4)

        except Exception as e:
            print(f"   -> Error ingesting '{filename}': {e}", flush=True)

    print("\n" + "=" * 60, flush=True)
    print(f"BULK INGESTION COMPLETE! Indexed: {success_count} | Skipped: {skipped_count} | Total: {total_files}", flush=True)
    print("=" * 60, flush=True)

if __name__ == "__main__":
    run_bulk_ingestion()
