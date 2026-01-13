from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime
import uuid

from backend.db import init_db, insert_analysis, get_history

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sentiment-dashboard-neon.vercel.app",  # <-- your Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



init_db()

analyzer = SentimentIntensityAnalyzer()


class AnalyzeRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"status": "ok", "message": "Sentiment API is running"}


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    text = req.text.strip()
    if not text:
        return {"error": "Text is empty"}

    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    result = {
        "id": str(uuid.uuid4()),
        "text": text,
        "label": label,
        "compound": compound,
        "scores": scores,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

    insert_analysis(result)
    return result


@app.get("/history")
def history(limit: int = 20):
    return get_history(limit)
