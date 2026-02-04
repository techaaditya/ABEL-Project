package com.abel.interfaces;

import java.util.List;

// ABSTRACTION: Interface for Graph operations
public interface GraphConnector extends AutoCloseable {
    List<String> retrieveContext(String query);
}
