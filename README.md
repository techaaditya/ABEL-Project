# ABEL (Artificial Buddy for Effective Learning)

## Project Overview
ABEL is an intelligent learning assistant that combines a **Java-based RAG (Retrieval Augmented Generation) Backend** with a **PHP/JS Frontend**. It uses **Neo4j** for knowledge graph context and **OpenRouter (LLM)** for generating answers.

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript
- **Middleware**: PHP (Session Management, MySQL Logging)
- **Backend (AI & Logic)**: Java (located in `java/` folder)
- **Database**:
  - **Neo4j**: Knowledge Graph for storing and retrieving context.
  - **MySQL**: Storing User Accounts and Chat History.

## Prerequisites
1.  **XAMPP** (Apache Web Server + MySQL)
2.  **Java Development Kit (JDK) 17+**
3.  **Neo4j Desktop** (or AuraDB)
4.  **Maven** (Optional - the project includes a portable wrapper)

## Setup Guide

### 1. Database Setup
**MySQL:**
- Start Apache and MySQL in XAMPP.
- Import `database_setup.sql` into `http://localhost/phpmyadmin` (Database name: `abel_db`).

**Neo4j:**
- Create a project in Neo4j Desktop.
- Run the Cypher commands from `neo4j_setup.cypher` in the Neo4j Browser to set up the schema.

### 2. Configuration
Create a `.env` file in the project root (`c:\xampp\htdocs\abel_project\.env`) with the following credentials:
```ini
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password

# AI Configuration
OPENROUTER_API_KEY=sk-or-v1-your-key...
```

### 3. Java Backend Setup
The backend handles all AI processing. It follows strict OOP principles (Abstraction, Encapsulation, Polymorphism).

**To Start the Backend:**
Open PowerShell in the project root and run:
```powershell
./run_java_backend.ps1
```
*This script will automatically set up Maven (if missing), compile the Java code in the `java/` folder, and start the server on Port 8000.*

### 4. Running the Application
Once the Java backend says `Server started on port 8000`:
1.  Open your browser.
2.  Navigate to: `http://localhost/abel_project/index.html`
3.  Start chatting!

## Key OOP Concepts Implemented
- **Abstraction**: `AIClient` and `GraphConnector` interfaces hide the implementation details of the LLM and Database.
- **Encapsulation**: `ConfigLoader` securely manages environment variables.
- **Polymorphism**: The system is designed to support multiple AI providers or Database engines by swapping implementations of the interfaces.
- **Exception Handling**: Global and local error handling ensures the server remains stable even if the AI service is down.
