import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from rag_engine import GraphRAG

def inspect():
    rag = GraphRAG()
    with rag.driver.session() as session:
        # Check counts for top candidates
        candidates = ["Document", "Chunk", "Concept", "Topic", "Question"]
        for label in candidates:
            count = session.run(f"MATCH (n:{label}) RETURN count(n) as c").single()["c"]
            print(f"Label '{label}': {count} nodes")
            
            if count > 0:
                # Get properties of one node
                props = session.run(f"MATCH (n:{label}) RETURN properties(n) as p LIMIT 1").single()["p"]
                print(f"   Properties: {props.keys()}")
                print(f"   Example: {dict(list(props.items())[:3])}") # Show first 3 props

if __name__ == "__main__":
    inspect()
