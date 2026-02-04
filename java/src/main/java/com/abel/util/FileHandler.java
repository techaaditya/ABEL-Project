package com.abel.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileHandler {
    
    // FILE HANDLING: Static utility method to read files
    public static String readString(String relativePath) throws IOException {
        Path path = Paths.get(System.getProperty("user.dir"), relativePath);
        if (!Files.exists(path)) {
            // EXCEPTION HANDLING: Checking existence first
            return "Default System Prompt (File Not Found)";
        }
        return Files.readString(path);
    }
}
