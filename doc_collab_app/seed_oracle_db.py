import cx_Oracle
import os

# Connect to the Oracle database
dsn = cx_Oracle.makedsn(
    os.getenv("DB_HOST"),
    os.getenv("DB_PORT"),
    service_name=os.getenv("DB_SERVICE")
)
conn = cx_Oracle.connect(
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    dsn=dsn
)
cursor = conn.cursor()

# Drop tables if they exist
for table in ["comments", "references", "authors", "documents"]:
    try:
        cursor.execute(f"DROP TABLE {table} CASCADE CONSTRAINTS")
    except cx_Oracle.DatabaseError:
        pass

# Create tables
cursor.execute('''
CREATE TABLE documents (
    id NUMBER PRIMARY KEY,
    title VARCHAR2(255),
    content CLOB
)
''')

cursor.execute('''
CREATE TABLE authors (
    doc_id NUMBER,
    author VARCHAR2(255),
    FOREIGN KEY (doc_id) REFERENCES documents(id)
)
''')

cursor.execute('''
CREATE TABLE references (
    doc_id NUMBER,
    ref_id NUMBER,
    ref_title VARCHAR2(255),
    FOREIGN KEY (doc_id) REFERENCES documents(id)
)
''')

cursor.execute('''
CREATE TABLE comments (
    id NUMBER PRIMARY KEY,
    doc_id NUMBER,
    text CLOB,
    parent_id NUMBER,
    FOREIGN KEY (doc_id) REFERENCES documents(id)
)
''')

# Insert data into documents
cursor.execute("INSERT INTO documents (id, title, content) VALUES (1, 'Quantum Computing Basics', 'This document explores the principles of quantum mechanics applied to computation.')")
cursor.execute("INSERT INTO documents (id, title, content) VALUES (2, 'Classical Algorithms vs Quantum Algorithms', 'A comparative study of algorithmic efficiency.')")

# Insert data into authors
cursor.execute("INSERT INTO authors (doc_id, author) VALUES (1, 'Alice Newton')")
cursor.execute("INSERT INTO authors (doc_id, author) VALUES (1, 'Bob Schrödinger')")
cursor.execute("INSERT INTO authors (doc_id, author) VALUES (2, 'Carol Turing')")

# Insert data into references
cursor.execute("INSERT INTO references (doc_id, ref_id, ref_title) VALUES (1, 2, 'Classical Algorithms vs Quantum Algorithms')")
cursor.execute("INSERT INTO references (doc_id, ref_id, ref_title) VALUES (2, 1, 'Quantum Computing Basics')")

# Insert data into comments
cursor.execute("INSERT INTO comments (id, doc_id, text, parent_id) VALUES (1, 1, 'Great introduction to quantum concepts!', NULL)")
cursor.execute("INSERT INTO comments (id, doc_id, text, parent_id) VALUES (2, 1, 'Needs more explanation of entanglement.', NULL)")
cursor.execute("INSERT INTO comments (id, doc_id, text, parent_id) VALUES (3, 1, 'Agreed, that section is a bit brief.', 2)")
cursor.execute("INSERT INTO comments (id, doc_id, text, parent_id) VALUES (4, 1, 'I thought the entanglement example was clear.', 2)")

conn.commit()
cursor.close()
conn.close()

print("Database seeded successfully.")
