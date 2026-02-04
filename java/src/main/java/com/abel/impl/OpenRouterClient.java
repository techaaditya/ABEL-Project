package com.abel.impl;

import com.abel.config.ConfigLoader;
import com.abel.interfaces.AIClient;
import com.abel.util.FileHandler;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.io.IOException;
import okhttp3.*;

// INHERITANCE: Implementing the AIClient interface
public class OpenRouterClient implements AIClient {

    private final String apiKey;
    private final String modelName;
    private final OkHttpClient client;
    private final Gson gson;
    
    public OpenRouterClient() {
        ConfigLoader config = ConfigLoader.getInstance();
        this.apiKey = config.get("OPENROUTER_API_KEY");
        
        if (this.apiKey == null || this.apiKey.isEmpty()) {
            System.err.println("CRITICAL ERROR: OPENROUTER_API_KEY is missing in .env configuration!");
        } else {
            String masked = this.apiKey.substring(0, Math.min(this.apiKey.length(), 8)) + "...";
            System.out.println("AI Client initialized with Key: " + masked);
        }

        this.modelName = "meta-llama/llama-3.3-70b-instruct";
        this.client = new OkHttpClient();
        this.gson = new Gson();
    }

    @Override
    public String generateResponse(String userQuery, String context) throws Exception {
        // FILE HANDLING: Reading the system prompt from a file
        String systemPromptTemplate = FileHandler.readString("data/system_prompt.txt");
        String systemPrompt = systemPromptTemplate.replace("{{CONTEXT}}", context.isEmpty() ? "No context available." : context);

        // Building JSON Payload for OpenRouter (OpenAI Compatible)
        JsonObject jsonBody = new JsonObject();
        jsonBody.addProperty("model", this.modelName);
        
        JsonArray messages = new JsonArray();
        
        JsonObject sysMsg = new JsonObject();
        sysMsg.addProperty("role", "system");
        sysMsg.addProperty("content", systemPrompt);
        messages.add(sysMsg);

        JsonObject userMsg = new JsonObject();
        userMsg.addProperty("role", "user");
        userMsg.addProperty("content", userQuery);
        messages.add(userMsg);

        jsonBody.add("messages", messages);

        Request request = new Request.Builder()
                .url("https://openrouter.ai/api/v1/chat/completions")
                .addHeader("Authorization", "Bearer " + this.apiKey.trim())
                .addHeader("Content-Type", "application/json")
                .addHeader("HTTP-Referer", "http://localhost:8000") // Required by OpenRouter for best practices
                .addHeader("X-Title", "Abel Project")
                .post(RequestBody.create(gson.toJson(jsonBody), MediaType.get("application/json")))
                .build();

        // EXCEPTION HANDLING: Network calls might fail
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No error body";
                System.err.println("OpenRouter API Error: " + errorBody);
                throw new IOException("Unexpected code " + response + " Body: " + errorBody);
            }
            
            // Parsing Response
            String responseBody = response.body().string();
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
            return jsonResponse.getAsJsonArray("choices")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("message")
                    .get("content").getAsString();
        }
    }
}
