import sqlite3
import os
from datetime import datetime

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.db"))

def get_db_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes the database schema if tables do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Companies Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    
    # 2. Users Table (Includes password_plain for Admin inspection)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_plain TEXT,
        salt TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'employee')) NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # Check if password_plain column exists in existing DB
    cursor.execute("PRAGMA table_info(users);")
    columns = [row["name"] for row in cursor.fetchall()]
    if "password_plain" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN password_plain TEXT;")
    
    # 3. Sessions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    
    # 4. Documents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        company_id TEXT NOT NULL,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 5. Document Chunks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doc_chunks (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT,
        company_id TEXT NOT NULL,
        FOREIGN KEY(doc_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 6. Graph Nodes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('asset', 'document', 'procedure', 'regulation', 'incident')) NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 7. Graph Edges
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_edges (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        rel_type TEXT NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(source_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY(target_id) REFERENCES graph_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 8. Graph Proposals (GitHub-style Pull Requests for Node & Edge proposals)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_proposals (
        id TEXT PRIMARY KEY,
        proposal_type TEXT CHECK(proposal_type IN ('node', 'edge')) NOT NULL,
        item_data TEXT NOT NULL,
        proposed_by TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL,
        company_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)

    # 9. Digital LOTO Permits (Step 7)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS loto_permits (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        isolation_steps TEXT NOT NULL, -- JSON list of isolation details
        requested_by TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'released')) NOT NULL,
        company_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # Check if database has any users. If completely empty, seed from database_seed.json if available
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    
    if user_count == 0:
        import json
        seed_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database_seed.json")
        if os.path.exists(seed_file):
            print("Found database_seed.json. Seeding database state...", flush=True)
            try:
                with open(seed_file, "r", encoding="utf-8") as f:
                    seed_data = json.load(f)
                
                # Ingest tables in dependency order
                for row in seed_data.get("companies", []):
                    cursor.execute("INSERT OR IGNORE INTO companies (id, name, created_at) VALUES (?, ?, ?);",
                                   (row["id"], row["name"], row["created_at"]))
                for row in seed_data.get("users", []):
                    cursor.execute("INSERT OR IGNORE INTO users (id, username, password_hash, password_plain, salt, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?);",
                                   (row["id"], row["username"], row["password_hash"], row.get("password_plain"), row["salt"], row["role"], row["company_id"]))
                for row in seed_data.get("documents", []):
                    cursor.execute("INSERT OR IGNORE INTO documents (id, filename, content, company_id, uploaded_at) VALUES (?, ?, ?, ?, ?);",
                                   (row["id"], row["filename"], row["content"], row["company_id"], row["uploaded_at"]))
                for row in seed_data.get("doc_chunks", []):
                    cursor.execute("INSERT OR IGNORE INTO doc_chunks (id, doc_id, content, embedding, company_id) VALUES (?, ?, ?, ?, ?);",
                                   (row["id"], row["doc_id"], row["content"], row.get("embedding"), row["company_id"]))
                for row in seed_data.get("graph_nodes", []):
                    cursor.execute("INSERT OR IGNORE INTO graph_nodes (id, name, type, company_id) VALUES (?, ?, ?, ?);",
                                   (row["id"], row["name"], row["type"], row["company_id"]))
                for row in seed_data.get("graph_edges", []):
                    cursor.execute("INSERT OR IGNORE INTO graph_edges (id, source_id, target_id, rel_type, company_id) VALUES (?, ?, ?, ?, ?);",
                                   (row["id"], row["source_id"], row["target_id"], row["rel_type"], row["company_id"]))
                for row in seed_data.get("graph_proposals", []):
                    cursor.execute("INSERT OR IGNORE INTO graph_proposals (id, proposal_type, item_data, proposed_by, status, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
                                   (row["id"], row["proposal_type"], row["item_data"], row["proposed_by"], row["status"], row["company_id"], row["created_at"]))
                for row in seed_data.get("loto_permits", []):
                    cursor.execute("INSERT OR IGNORE INTO loto_permits (id, asset_id, isolation_steps, requested_by, status, company_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);",
                                   (row["id"], row["asset_id"], row["isolation_steps"], row["requested_by"], row["status"], row["company_id"], row["created_at"]))
                print("Database tables fully seeded from JSON blueprint state.", flush=True)
            except Exception as e:
                print(f"Error seeding database from JSON: {e}", flush=True)
        else:
            # Fallback to single user seeding if seed file is missing
            import hashlib
            import secrets
            
            company_id = secrets.token_hex(8)
            admin_id = secrets.token_hex(8)
            created_at = datetime.utcnow().isoformat()
            
            password = "SafePassword123!"
            salt = os.urandom(16).hex()
            pwd_bytes = password.encode('utf-8')
            salt_bytes = bytes.fromhex(salt)
            pwd_hash = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000).hex()
            
            cursor.execute(
                "INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)",
                (company_id, "Test Refinery Corp", created_at)
            )
            cursor.execute(
                "INSERT INTO users (id, username, password_hash, password_plain, salt, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (admin_id, "admin_refinery", pwd_hash, password, salt, 'admin', company_id)
            )
            print("Demo credentials 'admin_refinery' auto-seeded successfully.", flush=True)
    
    conn.commit()
    conn.close()
    print("Database schema initialized successfully.")

if __name__ == "__main__":
    init_db()
