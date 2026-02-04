package com.abel;

import com.abel.impl.Neo4jConnector;
import com.abel.impl.OpenRouterClient;
import com.abel.interfaces.AIClient;
import com.abel.interfaces.GraphConnector;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class Main {
    
    // CLASSES AND OBJECTS: Organizing components
    private static GraphConnector graphDb;
    private static AIClient aiClient;
    private static final Gson gson = new Gson();

    public static void main(String[] args) throws IOException {
        System.out.println("Starting Java RAG Backend...");
        
        // Initialize Components
        graphDb = new Neo4jConnector();
        aiClient = new OpenRouterClient();

        // Simple HTTP Server (Replacing FastAPI)
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/chat", new ChatHandler());
        server.setExecutor(null); // creates a default executor
        server.start();
        
        System.out.println("Server started on port 8000");
    }

    // Inner Class for handling requests
    static class ChatHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    // 1. Parse Request
                    InputStreamReader reader = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8);
                    JsonObject request = gson.fromJson(reader, JsonObject.class);
                    String userMessage = request.get("message").getAsString();

                    System.out.println("Received: " + userMessage);

                    // 2. Business Logic (RAG Pipeline)
                    
                    // Retrieval
                    List<String> contextList = graphDb.retrieveContext(userMessage);
                    String contextBlob = String.join("\n\n", contextList);
                    
                    System.out.println("Context Found: " + contextList.size() + " chunks");
                    if (!contextList.isEmpty()) {
                        System.out.println("--- [DEBUG] Context Used for RAG ---");
                        System.out.println(contextBlob);
                        System.out.println("------------------------------------");
                    }

                    // Generation
                    String reply = aiClient.generateResponse(userMessage, contextBlob);

                    // 3. Send Response
                    JsonObject response = new JsonObject();
                    response.addProperty("reply", reply);
                    response.addProperty("context_used", contextBlob);

                    String jsonResponse = gson.toJson(response);
                    
                    exchange.getResponseHeaders().set("Content-Type", "application/json");
                    byte[] responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
                    exchange.sendResponseHeaders(200, responseBytes.length);
                    
                    OutputStream os = exchange.getResponseBody();
                    os.write(responseBytes);
                    os.close();

                } catch (Exception e) {
                    // EXCEPTION HANDLING: Global handler for the endpoint
                    e.printStackTrace();
                    String error = "{\"reply\": \"Error processing request: " + e.getMessage() + "\"}";
                    exchange.sendResponseHeaders(500, error.length());
                    OutputStream os = exchange.getResponseBody();
                    os.write(error.getBytes());
                    os.close();
                }
            } else {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            }
        }
    }
}
