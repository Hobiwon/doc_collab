# app.py
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import cx_Oracle
import os

app = Flask(__name__)
CORS(app)

# Oracle DB config (assumed set via environment variables)
dsn = cx_Oracle.makedsn(os.getenv("DB_HOST"), os.getenv("DB_PORT"), service_name=os.getenv("DB_SERVICE"))
conn = cx_Oracle.connect(user=os.getenv("DB_USER"), password=os.getenv("DB_PASS"), dsn=dsn)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q')
    cur = conn.cursor()
    cur.execute("SELECT id, title FROM documents WHERE LOWER(title) LIKE :1", ('%' + query.lower() + '%',))
    results = cur.fetchall()
    return jsonify([{"id": row[0], "title": row[1]} for row in results])

@app.route('/api/document/<doc_id>', methods=['GET'])
def load_document(doc_id):
    cur = conn.cursor()

    cur.execute("SELECT content FROM documents WHERE id = :1", (doc_id,))
    lob = cur.fetchone()[0]
    content = lob.read() if lob else ""
    if isinstance(content, bytes):
        content = content.decode('utf-8')

    cur.execute("SELECT author FROM authors WHERE doc_id = :1", (doc_id,))
    authors = [row[0] for row in cur.fetchall()]

    cur.execute('SELECT ref_id, ref_title FROM references WHERE doc_id = :1', (doc_id,))
    references = [{"id": row[0], "title": row[1]} for row in cur.fetchall()]

    cur.execute("SELECT id, text, parent_id FROM comments WHERE doc_id = :1", (doc_id,))
    comments = []
    for row in cur.fetchall():
        text = row[1].read() if row[1] else ""
        if isinstance(text, bytes):
            text = text.decode('utf-8')
        comments.append({"id": row[0], "text": text, "parent_id": row[2]})

    return jsonify({
        "content": content,
        "authors": authors,
        "references": references,
        "comments": comments
    })

@app.route('/api/document/<doc_id>/comment', methods=['POST'])
def post_comment(doc_id):
    data = request.json
    text = data.get('text')
    parent_id = data.get('parent_id')
    cur = conn.cursor()
    cur.execute("INSERT INTO comments (doc_id, text, parent_id) VALUES (:1, :2, :3)", (doc_id, text, parent_id))
    conn.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
