// Run these commands in Neo4j Browser

// 1. Create Constraints
CREATE CONSTRAINT FOR (c:Concept) REQUIRE c.name IS UNIQUE;

// 2. Create Vector Index
CREATE VECTOR INDEX chunk_embeddings IF NOT EXISTS FOR (c:Chunk) ON (c.embedding)
OPTIONS {indexConfig: {`vector.dimensions`: 384, `vector.similarity_function`: 'cosine'}};
