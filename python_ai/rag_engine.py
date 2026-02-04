import os
from dotenv import load_dotenv
from openai import OpenAI
import httpx
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer

# Load environment variables from .env file
load_dotenv()

class GraphRAG:
    def __init__(self):
        # Neo4j Aura Configuration
        neo4j_uri = os.getenv("NEO4J_URI", "neo4j+s://8dba5c30.databases.neo4j.io")
        neo4j_user = os.getenv("NEO4J_USERNAME", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "z51vC138OM37x46eiiPxL0Cm7zi6SovqDlxcEZnX-5M")
        
        self.driver = GraphDatabase.driver(
            neo4j_uri, 
            auth=(neo4j_user, neo4j_password)
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
        self.model_name = "meta-llama/llama-3.3-70b-instruct"

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
                MATCH (c:Chunk)
                WHERE toLower(c.text) CONTAINS toLower($text_query)
                RETURN c.text AS text, c.fileName AS source
                LIMIT 5
                """
                # Using the raw query text for keyword matching
                result = session.run(cypher, text_query=query)
                
                context_lines = []
                for r in result:
                    # Clean up body text slightly
                    text_snippet = r['text'].replace('\n', ' ')
                    context_lines.append(f"[Source: {r['source']}]\nSnippet: {text_snippet}...")
                
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
                max_tokens=1000 # Increased for Reasoning (CoT) + Final Answer
            )
            return response.choices[0].message.content
        except Exception as e:
             return f"Error contacting OpenRouter: {e}"
