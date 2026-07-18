import os
import json
import math
import re
import google.generativeai as genai
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

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Splits text into overlapping chunks of character length chunk_size.
    Prevents sentences from being abruptly cut off at boundaries.
    """
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = min(start + chunk_size, text_len)
        # Try to expand end to the next whitespace to avoid cutting off words
        if end < text_len:
            while end < text_len and not text[end].isspace():
                end += 1
        
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
        if start >= text_len or end >= text_len:
            break
            
    return [c for c in chunks if c]

def get_gemini_embedding(text: str) -> list[float]:
    """
    Calls the Google Gemini Embedding API to generate a 768-dimensional vector.
    Falls back to a zero-vector if the API key is missing or calls fail.
    """
    if not api_key:
        # Fallback for local testing without API Key
        return [0.0] * 768
    
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document"
        )
        return response['embedding']
    except Exception as e:
        print(f"Warning: Gemini embedding failed: {e}. Falling back to zero-vector.")
        return [0.0] * 768

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Computes the cosine similarity between two float vectors."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def compute_tfidf_scores(query: str, chunks: list[str]) -> list[float]:
    """
    Calculates TF-IDF scores locally for each chunk based on the query.
    Enforces exact matching for technical terms, asset codes, and regulations.
    """
    def tokenize(text):
        return re.findall(r'\b\w+-?\w*\b', text.lower())

    query_tokens = tokenize(query)
    if not query_tokens:
        return [0.0] * len(chunks)

    # Tokenize all chunks
    chunk_tokens = [tokenize(c) for c in chunks]
    num_chunks = len(chunks)

    # Calculate Document Frequency (DF) for each query term
    df = {}
    for term in query_tokens:
        df[term] = sum(1 for tokens in chunk_tokens if term in tokens)

    # Calculate TF-IDF score for each chunk
    scores = []
    for tokens in chunk_tokens:
        chunk_score = 0.0
        total_words = len(tokens)
        if total_words == 0:
            scores.append(0.0)
            continue

        for term in query_tokens:
            # Term Frequency (TF)
            tf = tokens.count(term) / total_words
            # Inverse Document Frequency (IDF)
            term_df = df.get(term, 0)
            idf = math.log((1 + num_chunks) / (1 + term_df)) + 1
            # Accumulate TF-IDF
            chunk_score += tf * idf
            
        scores.append(chunk_score)
        
    return scores

def index_document(doc_id: str, filename: str, content: str, company_id: str):
    """
    Chunks a document, generates Gemini embeddings for each chunk,
    and saves them directly into the SQLite database.
    """
    chunks = chunk_text(content)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"{doc_id}_c{i}"
        embedding = get_gemini_embedding(chunk)
        embedding_json = json.dumps(embedding)
        
        cursor.execute(
            """
            INSERT INTO doc_chunks (id, doc_id, content, embedding, company_id) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (chunk_id, doc_id, chunk, embedding_json, company_id)
        )
        
    conn.commit()
    conn.close()

def hybrid_search(query: str, company_id: str, top_k: int = 3) -> list[dict]:
    """
    Performs a hybrid search combining local TF-IDF and Gemini Cosine Similarity.
    Formula: Score = 0.7 * SemanticScore + 0.3 * KeywordScore
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Retrieve all chunks and metadata for the company
    cursor.execute(
        """
        SELECT c.id, c.content, c.embedding, d.filename 
        FROM doc_chunks c
        JOIN documents d ON c.doc_id = d.id
        WHERE c.company_id = ?
        """,
        (company_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []
        
    chunks = [row['content'] for row in rows]
    
    # 2. Compute Semantic Similarity (Cosine on Embeddings)
    query_embedding = get_gemini_embedding(query)
    semantic_scores = []
    for row in rows:
        if row['embedding']:
            chunk_embedding = json.loads(row['embedding'])
            sim = cosine_similarity(query_embedding, chunk_embedding)
        else:
            sim = 0.0
        semantic_scores.append(sim)
        
    # 3. Compute Keyword Similarity (TF-IDF)
    keyword_scores = compute_tfidf_scores(query, chunks)
    
    # Min-max normalization for Keyword Scores (to scale them between 0 and 1)
    min_kw = min(keyword_scores)
    max_kw = max(keyword_scores)
    if max_kw > min_kw:
        normalized_kw = [(x - min_kw) / (max_kw - min_kw) for x in keyword_scores]
    else:
        normalized_kw = [1.0 if x > 0 else 0.0 for x in keyword_scores]
        
    # 4. Combine scores: Score = 0.7 * Semantic + 0.3 * Keyword
    results = []
    for i, row in enumerate(rows):
        combined_score = 0.7 * semantic_scores[i] + 0.3 * normalized_kw[i]
        results.append({
            "chunk_id": row['id'],
            "content": row['content'],
            "filename": row['filename'],
            "score": combined_score,
            "semantic_score": semantic_scores[i],
            "keyword_score": normalized_kw[i]
        })
        
    # Sort descending by combined score and slice top_k
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

def generate_rag_answer(query: str, retrieved_chunks: list[dict], company_id: str) -> dict:
    """
    Synthesizes an answer using the retrieved chunks and gemini-3.5-flash.
    Returns: {"answer": str, "citations": list[str], "active_nodes": list[str]}
    """
    if not api_key:
        return {
            "answer": "Offline mode: Gemini API key is missing. Cannot synthesize RAG response.",
            "citations": [],
            "active_nodes": []
        }
    
    # 1. Format context from chunks
    context_blocks = []
    citations = []
    for chunk in retrieved_chunks:
        filename = chunk["filename"]
        if filename not in citations:
            citations.append(filename)
        context_blocks.append(f"--- Document: {filename} ---\n{chunk['content']}\n")
    
    context = "\n".join(context_blocks)
    
    # 2. System Instructions and Prompt
    prompt = f"""
    You are an expert industrial plant safety and operations assistant.
    Answer the user's query using ONLY the provided document context below. 
    If the context does not contain the answer, reply: "I cannot find sufficient information in the loaded manuals."
    Do not invent or extrapolate safety values, limits, or parameters.
    
    Format your response in clean markdown. When referring to equipment tags, valves, procedures, or standards, use their exact normalized IDs in uppercase (e.g. PUMP-101A, VALVE-102, OISD-GDN-115) to help the user locate them.
    
    Context:
    {context}
    
    User Query: {query}
    """
    
    try:
        model = genai.GenerativeModel("gemini-3.1-flash-lite")
        response = model.generate_content(prompt)
        answer = response.text
        
        # 3. Scan the SQLite database to see which node IDs appear in the answer
        active_nodes = []
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM graph_nodes WHERE company_id = ?", (company_id,))
        nodes = [row['id'] for row in cursor.fetchall()]
        conn.close()
        
        # Match node IDs (substring match)
        for node_id in nodes:
            if node_id.upper() in answer.upper():
                active_nodes.append(node_id)
                
        return {
            "answer": answer,
            "citations": citations,
            "active_nodes": active_nodes,
            "retrieved_chunks": [{
                "filename": chunk["filename"],
                "content": chunk["content"]
            } for chunk in retrieved_chunks]
        }
    except Exception as e:
        print(f"Error during RAG synthesis: {e}")
        return {
            "answer": f"Error generating answer: {e}",
            "citations": citations,
            "active_nodes": [],
            "retrieved_chunks": []
        }
