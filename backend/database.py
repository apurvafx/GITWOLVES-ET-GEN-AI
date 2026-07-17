import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.db")

def get_db_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
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
    
    # 2. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'employee')) NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 3. Sessions Table (Secure token-based auth without JWT dependency)
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
    
    # 5. Document Chunks (for RAG indexing)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doc_chunks (
        id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        content TEXT NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(doc_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 6. Graph Nodes (Entities)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('asset', 'document', 'procedure', 'regulation', 'incident')) NOT NULL,
        company_id TEXT NOT NULL,
        FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
    """)
    
    # 7. Graph Edges (Relationships)
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
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
