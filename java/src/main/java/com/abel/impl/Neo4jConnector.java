package com.abel.impl;

import com.abel.config.ConfigLoader;
import com.abel.interfaces.GraphConnector;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;

// INHERITANCE: Implementing the interface
public class Neo4jConnector implements GraphConnector {

    private final Driver driver;

    public Neo4jConnector() {
        ConfigLoader config = ConfigLoader.getInstance();
        String uri = config.get("NEO4J_URI", "neo4j+s://8dba5c30.databases.neo4j.io");
        String user = config.get("NEO4J_USERNAME", "neo4j");
        String password = config.get("NEO4J_PASSWORD");

        // EXCEPTION HANDLING: Try-Catch logic is internal to the driver, 
        // but we handle connection logic here.
        this.driver = GraphDatabase.driver(uri, AuthTokens.basic(user, password));
    }

    @Override
    public List<String> retrieveContext(String query) {
        List<String> results = new ArrayList<>();
        
        // POLYMORPHISM: Using the generic Session interface
        try (Session session = driver.session()) {
            // Equivalent to your Python Cypher query
            String cypher = "MATCH (c:Chunk) " +
                          "WHERE toLower(c.text) CONTAINS toLower($text_query) " +
                          "RETURN c.text AS text, c.fileName AS source " +
                          "LIMIT 5";
            
            Result result = session.run(cypher, Map.of("text_query", query));
            
            while (result.hasNext()) {
                Record record = result.next();
                String text = record.get("text").asString().replace("\n", " ");
                String source = record.get("source").asString();
                results.add("[Source: " + source + "] Snippet: " + text);
            }
        } catch (Exception e) {
            System.err.println("Neo4j Query Failed: " + e.getMessage());
            // EXCEPTION HANDLING: Returning empty list instead of crashing
        }
        return results;
    }

    @Override
    public void close() {
        driver.close();
    }
}
