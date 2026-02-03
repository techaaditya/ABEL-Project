# Project ABEL: Web Edition Setup Guide

## 1. Prerequisites
- XAMPP (Apache + MySQL)
- Python 3.9+
- Neo4j Desktop (with APOC and GDS plugins installed)

## 2. Web Server Setup
1. Move the `abel_project` folder to your XAMPP `htdocs` directory (e.g., `C:\xampp\htdocs\abel_project`).
2. Start **Apache** and **MySQL** in XAMPP Control Panel.
3. Open `http://localhost/phpmyadmin` and import `database_setup.sql` OR run the SQL commands manually to create the `abel_db` database and tables.

## 3. Neo4j Setup
1. Create a new Project and Database in Neo4j Desktop.
2. Install **APOC** and **Graph Data Science Library (GDS)** plugins.
3. Start the database.
4. Open Neo4j Browser and run the commands in `neo4j_setup.cypher`.
5. Update `abel_project/python_ai/rag_engine.py` with your Neo4j password (default is `password`).

## 4. Python AI Service
1. Open a terminal in `abel_project/python_ai/`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Update `abel_project/python_ai/rag_engine.py` with your **Google Gemini API Key**.
4. Start the server:
   ```bash
   python server.py
   ```

## 5. Run the App
1. Open your browser to `http://localhost/abel_project/index.html`.
2. Sign up / Login.
3. Start chatting!

## 6. Integrations
- Run `composer install` in the `abel_project` root to install PHP dependencies for Google Auth and PHPMailer if you plan to use them fully (configured in `composer.json`).
