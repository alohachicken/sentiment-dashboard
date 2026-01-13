\# Sentiment Dashboard (Vercel + Render)



A full-stack sentiment analysis app.



\## Live Demo

Frontend: https://sentiment-dashboard-neon.vercel.app  

Backend: https://sentiment-dashboard-cx9c.onrender.com  



\## Features

\- Analyze text sentiment

\- Stores analysis history

\- Pie chart sentiment breakdown

\- Bar chart of last 10 compound scores



\## Tech Stack

Frontend:

\- React (Vite)

\- Chart.js



Backend:

\- FastAPI

\- VADER Sentiment



\## Local Development



\### Backend

```bash

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

