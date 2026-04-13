const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static("public"));

// ============================
// 🔥 TELEGRAM CONFIG
// ============================
const TELEGRAM_TOKEN = "ISI_TOKEN_KAMU";
const CHAT_ID = "ISI_CHAT_ID_KAMU";

// ============================
// 🧠 AI ENGINE
// ============================
function aiEngine(data) {
  let bias = data.type;
  let entry = parseFloat(data.entry);

  let sl = bias === "BUY" ? entry - 50 : entry + 50;
  let tp = bias === "BUY" ? entry + 100 : entry - 100;

  let confidence = Math.random() * 100;

  if (confidence < 60) {
    return {
      type: "NO TRADE",
      time: new Date().toLocaleString()
    };
  }

  return {
    type: bias,
    entry: entry.toFixed(2),
    sl: sl.toFixed(2),
    tp: tp.toFixed(2),
    confidence: confidence.toFixed(1) + "%",
    time: new Date().toLocaleString()
  };
}

// ============================
// 📡 SIGNAL STORAGE
// ============================
let signal = {
  type: "WAITING",
  entry: "-",
  sl: "-",
  tp: "-",
  confidence: "-",
  time: "-"
};

// ============================
// 📡 TELEGRAM SENDER
// ============================
async function sendTelegram(signal) {
  try {
    const message = `
🚀 SIGNAL ETHUSD

Type: ${signal.type}
Entry: ${signal.entry}
SL: ${signal.sl}
TP: ${signal.tp}
Confidence: ${signal.confidence}
Time: ${signal.time}
    `;

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });

  } catch (err) {
    console.log("Telegram error:", err.message);
  }
}

// ============================
// 📡 WEBHOOK TRADINGVIEW
// ============================
app.post("/webhook", (req, res) => {
  const data = req.body;

  signal = aiEngine(data);

  console.log("Signal baru:", signal);

  if (signal.type !== "NO TRADE") {
    sendTelegram(signal);
  }

  res.send("OK");
});

// ============================
// 📊 API FRONTEND
// ============================
app.get("/signal", (req, res) => {
  res.json(signal);
});

// ============================
app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});
