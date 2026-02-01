require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// TELEGRAM BOT
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// DB OKUMA
function readDB() {
  return JSON.parse(fs.readFileSync("data.json", "utf8"));
}

const userState = {};

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const db = readDB();

  const keyboard = Object.keys(db).map((key) => [
    { text: db[key].name, callback_data: `DIZI_${key}` },
  ]);

  bot.sendMessage(chatId, "🎬 Dizi seç:", {
    reply_markup: { inline_keyboard: keyboard },
  });
});

// callback
bot.on("callback_query", (q) => {
  const chatId = q.message.chat.id;
  const db = readDB();
  const data = q.data;

  if (data.startsWith("DIZI_")) {
    const dizi = data.replace("DIZI_", "");
    userState[chatId] = { dizi };

    const seasons = Object.keys(db[dizi].seasons).map((s) => [
      { text: `Sezon ${s}`, callback_data: `SEZON_${s}` },
    ]);

    bot.editMessageText("📀 Sezon seç:", {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: { inline_keyboard: seasons },
    });
  }

  else if (data.startsWith("SEZON_")) {
    const sezon = data.replace("SEZON_", "");
    userState[chatId].sezon = sezon;

    const { dizi } = userState[chatId];

    const bolumler = Object.keys(db[dizi].seasons[sezon]).map((b) => [
      { text: `Bölüm ${b}`, callback_data: `BOLUM_${b}` },
    ]);

    bot.editMessageText("▶️ Bölüm seç:", {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: { inline_keyboard: bolumler },
    });
  }

  else if (data.startsWith("BOLUM_")) {
    const bolum = data.replace("BOLUM_", "");
    const { dizi, sezon } = userState[chatId];

    const link = db[dizi].seasons[sezon][bolum];

    bot.editMessageText(`🔗 İzleme Linki:\n${link}`, {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Ana Menü", callback_data: "HOME" }],
        ],
      },
    });
  }

  else if (data === "HOME") {
    const keyboard = Object.keys(db).map((key) => [
      { text: db[key].name, callback_data: `DIZI_${key}` },
    ]);

    bot.editMessageText("🎬 Dizi seç:", {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: { inline_keyboard: keyboard },
    });
  }
});

// EXPRESS ROUTE
app.get("/", (req, res) => {
  res.send("Telegram bot çalışıyor 🚀");
});

// PORT DINLE
app.listen(PORT, () => {
  console.log("WEB SERVER AÇIK | PORT:", PORT);
});

// ADMIN PANEL
require("./admin")(bot);
