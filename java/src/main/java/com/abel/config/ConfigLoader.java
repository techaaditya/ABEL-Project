package com.abel.config;

import io.github.cdimascio.dotenv.Dotenv;

// ENCAPSULATION: Hides the details of configuration loading
public class ConfigLoader {
    private static ConfigLoader instance;
    private final Dotenv dotenv;

    private ConfigLoader() {
        System.out.println("Loading configuration...");
        // Try loading from parent directory first (standard dev setup)
        Dotenv temp = null;
        try {
            temp = Dotenv.configure().directory("../").load();
            System.out.println("Loaded .env from parent directory.");
        } catch (Exception e) {
            System.out.println(".env not found in parent directory, trying current directory...");
            try {
                // Fallback to current directory
                temp = Dotenv.configure().ignoreIfMissing().load();
            } catch (Exception ex) {
                System.err.println("Warning: No .env file found.");
            }
        }
        this.dotenv = temp;
    }

    public static synchronized ConfigLoader getInstance() {
        if (instance == null) {
            instance = new ConfigLoader();
        }
        return instance;
    }

    public String get(String key) {
        return dotenv.get(key);
    }
    
    public String get(String key, String defaultValue) {
        return dotenv.get(key, defaultValue);
    }
}
