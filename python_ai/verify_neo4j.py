import os
import sys
# Add current directory to path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_engine import GraphRAG

def verify_neo4j():
    print("============================================")
    print("      NEO4J CONNECTION VERIFICATION")
    print("============================================")
    
    # 1. Initialize
    print("\n[STEP 1] Initializing GraphRAG Engine...")
    try:
        rag = GraphRAG()
        print(">> GraphRAG initialized.")
    except Exception as e:
        print(f"!! Failed to initialize GraphRAG: {e}")
        return

    # 2. Test Driver Connectivity
    print("\n[STEP 2] Verifying Driver Connectivity...")
    try:
        rag.driver.verify_connectivity()
        print(">> Connectivity Verified! (Handshake successful)")
    except Exception as e:
        print(f"!! Connectivity Verification Failed: {e}")
        print("   Check your NEO4J_URI, USERNAME, and PASSWORD in .env or rag_engine.py")
        return

    # 3. Test Simple Query
    print("\n[STEP 3] Running Test Query (RETURN 1)...")
    try:
        with rag.driver.session() as session:
            result = session.run("RETURN 1 AS val")
            record = result.single()
            if record and record["val"] == 1:
                print(">> Test Query Successful.")
            else:
                print("!! Test Query returned unexpected result.")
                
            # 4. Check Database Content Stats
            print("\n[STEP 4] Checking Database Content...")
            count_result = session.run("MATCH (n) RETURN count(n) AS count")
            total_nodes = count_result.single()["count"]
            print(f">> Total Nodes in Database: {total_nodes}")
            
            # Check for specific 'Chunk' nodes used by RAG
            q_result = session.run("MATCH (n:Chunk) RETURN count(n) AS count")
            q_nodes = q_result.single()["count"]
            print(f">> 'Chunk' Nodes (used by RAG): {q_nodes}")
            
            if q_nodes == 0:
                print("\n   [NOTICE] The database seems to have no 'Chunk' nodes.")
                print("   The current 'retrieve_context' function queries for 'Chunk' labels.")
                print("   If you have different data, you may need to update 'rag_engine.py'.")
                
                # Check what labels DO exist
                labels_result = session.run("CALL db.labels()")
                labels = [r["label"] for r in labels_result]
                if labels:
                    print(f"   Available Labels: {', '.join(labels)}")
                else:
                    print("   No labels found.")

    except Exception as e:
        print(f"!! Query Execution Failed: {e}")
        return

    print("\n============================================")
    print("      VERIFICATION COMPLETE")
    print("============================================")

if __name__ == "__main__":
    verify_neo4j()
