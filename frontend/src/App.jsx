import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_BASE;



export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // ------- Charts data prep -------
  const counts = history.reduce(
    (acc, item) => {
      const key = (item.label || "").toLowerCase();
      if (key === "positive") acc.positive += 1;
      else if (key === "negative") acc.negative += 1;
      else acc.neutral += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const pieData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [{ data: [counts.positive, counts.neutral, counts.negative] }],
  };

  const last10 = history.slice(0, 10).reverse();

  const barData = {
    labels: last10.map((x) => new Date(x.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Compound score",
        data: last10.map((x) => x.compound),
      },
    ],
  };

  // ------- API calls -------
  async function fetchHistory() {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/history?limit=20`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load history. Is the backend running?");
    }
  }

  async function analyze() {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please type something first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Analyze failed.");
      } else {
        setResult(data);
        setText("");
        await fetchHistory();
      }
    } catch {
      setError("Request failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  // ------- UI helpers -------
  const labelColor =
    result?.label === "positive"
      ? "#1b7f3a"
      : result?.label === "negative"
      ? "#b00020"
      : "#555";

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 10 }}>Sentiment Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 16,
          alignItems: "center",
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something…"
          style={{
            flex: 1,
            padding: 12,
            fontSize: 16,
            borderRadius: 10,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />

        <button
          onClick={analyze}
          disabled={loading}
          style={{
            padding: "12px 18px",
            fontSize: 16,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: loading ? "#f4f4f4" : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {error && <p style={{ color: "#b00020", marginTop: 10 }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: 16,
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div style={{ fontWeight: 800, color: labelColor, fontSize: 18 }}>
            {result.label.toUpperCase()}
          </div>
          <div style={{ marginTop: 6 }}>Compound: {result.compound}</div>
          <div style={{ marginTop: 8, color: "#444" }}>{result.text}</div>
        </div>
      )}

      <h2 style={{ marginTop: 26 }}>Charts</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Sentiment breakdown</h3>
          <div style={{ height: 260 }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Last 10 compound scores</h3>
          <div style={{ height: 260 }}>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: -1, max: 1 } },
              }}
            />
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: 26 }}>History</h2>

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        {history.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>No history yet.</div>
        ) : (
          history.map((item) => (
            <div key={item.id} style={{ borderTop: "1px solid #eee", padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#777" }}>
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
              <div style={{ marginTop: 6 }}>{item.text}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                compound: {item.compound}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
