package com.abel.interfaces;

// ABSTRACTION: Interface defining the contract for AI operations
public interface AIClient {
    String generateResponse(String userQuery, String context) throws Exception;
}
