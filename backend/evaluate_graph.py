import os
from database import get_db_connection
from graph_parser import extract_graph_from_text

# absolute path to test document
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed_data")
TEST_FILE = os.path.join(SEED_DIR, "sop_isolation_procedure.txt")

# ground-truth graph for sop_isolation_procedure.txt
GROUND_TRUTH_NODES = {
    "SOP-OPS-12": "document",
    "PUMP-101A": "asset",
    "VALVE-102": "asset",
    "MCC-P101": "asset",
    "PG-101": "asset",
    "OISD-GDN-115": "regulation",
    "PTW": "document"
}

GROUND_TRUTH_EDGES = [
    ("SOP-OPS-12", "PUMP-101A", "applies"),
    ("SOP-OPS-12", "OISD-GDN-115", "complies"),
    ("VALVE-102", "PUMP-101A", "isolate"),
    ("MCC-P101", "PUMP-101A", "shutdown"),
    ("PG-101", "PUMP-101A", "monitor"),
    ("SOP-OPS-12", "PTW", "require")
]

def run_graph_evaluation():
    print("Reading test document...")
    if not os.path.exists(TEST_FILE):
        raise FileNotFoundError(f"Missing test file: {TEST_FILE}")
        
    with open(TEST_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        
    # run gemini graph parser
    print("Calling Gemini 3.5 Flash for entity and relationship extraction...")
    extracted_graph = extract_graph_from_text(content)
    
    # parse extracted nodes & edges
    extracted_nodes = {n["id"].strip().upper(): n["type"].lower() for n in extracted_graph.get("nodes", [])}
    extracted_edges = []
    for e in extracted_graph.get("edges", []):
        source = e.get("source_id", e.get("source", "")).strip().upper()
        target = e.get("target_id", e.get("target", "")).strip().upper()
        rel = e.get("rel_type", e.get("label", "relates")).strip().lower()
        if source and target:
            extracted_edges.append((source, target, rel))
        
    # evaluate nodes (precision & recall)
    gt_nodes_set = set(GROUND_TRUTH_NODES.keys())
    ext_nodes_set = set(extracted_nodes.keys())
    
    correct_nodes = gt_nodes_set.intersection(ext_nodes_set)
    node_recall = (len(correct_nodes) / len(gt_nodes_set)) * 100 if gt_nodes_set else 0.0
    node_precision = (len(correct_nodes) / len(ext_nodes_set)) * 100 if ext_nodes_set else 0.0
    
    # evaluate edges (structural connections)
    correct_edges_count = 0
    spurious_edges_count = 0
    
    print("\n" + "="*50)
    print("RELATIONSHIP EXTRACTION AUDIT")
    print("="*50)
    
    for src, tgt, rel in extracted_edges:
        # check if this connection exists in ground truth (regardless of exact wording of rel_type)
        matched = False
        for gt_src, gt_tgt, gt_rel in GROUND_TRUTH_EDGES:
            if src == gt_src and tgt == gt_tgt:
                # check if the relation meaning is close (substring check)
                if gt_rel in rel or rel in gt_rel:
                    matched = True
                    break
        
        if matched:
            print(f"-> MATCHED: {src} --({rel})--> {tgt}")
            correct_edges_count += 1
        else:
            print(f"-> SPURIOUS (AI hallucinated or details added): {src} --({rel})--> {tgt}")
            spurious_edges_count += 1
            
    # calculate edge metrics
    total_gt_edges = len(GROUND_TRUTH_EDGES)
    total_ext_edges = len(extracted_edges)
    
    edge_recall = (correct_edges_count / total_gt_edges) * 100 if total_gt_edges else 0.0
    edge_precision = (correct_edges_count / total_ext_edges) * 100 if total_ext_edges else 0.0
    
    print("\n" + "="*50)
    print("KNOWLEDGE GRAPH EVALUATION REPORT")
    print("="*50)
    print(f"Node Recall (Coverage)   : {node_recall:.1f}% ({len(correct_nodes)}/{len(gt_nodes_set)})")
    print(f"Node Precision (Accuracy): {node_precision:.1f}% ({len(correct_nodes)}/{len(ext_nodes_set)})")
    print(f"Edge Recall (Coverage)   : {edge_recall:.1f}% ({correct_edges_count}/{total_gt_edges})")
    print(f"Edge Precision (Accuracy): {edge_precision:.1f}% ({correct_edges_count}/{total_ext_edges})")
    print("="*50)

if __name__ == "__main__":
    try:
        run_graph_evaluation()
    except Exception as e:
        print(f"Graph evaluation failed: {e}")
