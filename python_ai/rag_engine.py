import os
from openai import OpenAI
import httpx
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer

class GraphRAG:
    def __init__(self):
        # Stack Overflow Sandbox Neo4j credentials
        self.driver = GraphDatabase.driver(
            "bolt://13.219.228.76:7687", 
            auth=("neo4j", "fighter-transmission-states")
        )
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Setup OpenRouter (OpenAI Compatible)
        api_key = os.getenv("OPENROUTER_API_KEY", "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") 
        
        # Using verify=False to bypass SSL errors common in some Windows/Corporate environments
        # Note: In production, properly configure your SSL certificates instead.
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            http_client=httpx.Client(verify=False) 
        )
        self.model_name = "openai/gpt-4o"

    def run_gnn_scoring(self):
        # This is your "Training" phase using Neo4j GDS
        with self.driver.session() as session:
            # Drop graph if exists to avoid errors in re-runs
            session.run("CALL gds.graph.drop('abel_graph', false)")
            
            session.run("CALL gds.graph.project('abel_graph', 'Concept', 'RELATED_TO')")
            session.run("CALL gds.pageRank.write('abel_graph', { writeProperty: 'importance_score' })")
            session.run("CALL gds.graph.drop('abel_graph')")

    def retrieve_context(self, query):
        try:
            # Note: The specific Stack Overflow dataset likely doesn't have the 'chunk_embeddings' vector index 
            # or the 'Concept' nodes we set up locally. 
            # We will switch to a keyword-based search on 'Question' nodes which exist in the SO dataset.
            
            with self.driver.session() as session:
                cypher = """
                MATCH (q:Question)
                WHERE toLower(q.title) CONTAINS toLower($text_query)
                RETURN q.title AS title, q.body_markdown AS body, q.link AS url
                LIMIT 5
                """
                # Using the raw query text for keyword matching
                result = session.run(cypher, text_query=query)
                
                context_lines = []
                for r in result:
                    # Clean up body text slightly
                    body_snippet = r['body'].replace('\n', ' ')[:300]
                    context_lines.append(f"[Question: {r['title']}]\nLink: {r['url']}\nSnippet: {body_snippet}...")
                
                return "\n\n".join(context_lines)

        except Exception as e:
            print(f"Neo4j Connection/Query Error: {e}")
            return "" # Return empty context on error so the app doesn't crash

    def generate_answer(self, query, context):
        if not context:
            context = "No specific context available. Answer based on general knowledge."

        system_prompt = f"""
        You are ABEL (Artificial Buddy for Effective Learning).
        Use the following Knowledge Graph context to answer if relevant.
        If the context is empty or irrelevant, you may answer using your general knowledge, 
        but please mention that you are answering without specific project context.
        
        Context:
        {context}
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
             return f"Error contacting OpenRouter: {e}"
