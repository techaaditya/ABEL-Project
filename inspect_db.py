from neo4j import GraphDatabase

# Stack Overflow Sandbox Credentials
uri = "bolt://13.219.228.76:7687"
user = "neo4j"
password = "fighter-transmission-states"

driver = GraphDatabase.driver(uri, auth=(user, password))

def inspect():
    with driver.session() as session:
        print("--- Node Labels ---")
        result = session.run("CALL db.labels()")
        labels = [r[0] for r in result]
        print(labels)

        print("\n--- Properties for 'Question' nodes (limit 1) ---")
        if 'Question' in labels:
            result = session.run("MATCH (n:Question) RETURN keys(n) AS props LIMIT 1")
            for r in result:
                print(r["props"])
        else:
            print("Node 'Question' not found in database.")

        print("\n--- Relationship Types ---")
        result = session.run("CALL db.relationshipTypes()")
        print([r[0] for r in result])

inspect()
driver.close()
