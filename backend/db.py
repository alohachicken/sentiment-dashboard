import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("sentiment.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            label TEXT NOT NULL,
            compound REAL NOT NULL,
            neg REAL NOT NULL,
            neu REAL NOT NULL,
            pos REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
        """)
        conn.commit()

def insert_analysis(item: dict):
    with get_conn() as conn:
        conn.execute("""
        INSERT INTO analyses (id, text, label, compound, neg, neu, pos, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item["text"],
            item["label"],
            item["compound"],
            item["scores"]["neg"],
            item["scores"]["neu"],
            item["scores"]["pos"],
            item["timestamp"],
        ))
        conn.commit()

def get_history(limit: int = 20):
    with get_conn() as conn:
        rows = conn.execute("""
        SELECT id, text, label, compound, neg, neu, pos, timestamp
        FROM analyses
        ORDER BY timestamp DESC
        LIMIT ?
        """, (limit,)).fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "text": r["text"],
            "label": r["label"],
            "compound": r["compound"],
            "scores": {"neg": r["neg"], "neu": r["neu"], "pos": r["pos"], "compound": r["compound"]},
            "timestamp": r["timestamp"],
        })
    return results
