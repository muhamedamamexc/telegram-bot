console.log("BOT BAŞLADI");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const data = () => JSON.parse(fs.readFileSync("data.json"));

let userState = {};

bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  const db = data();

  const keyboard = Object.keys(db).map(key => ([
    { text: db[key].name, callback_data: `dizi_${key}` }
  ]));

  bot.sendMessage(chatId, "🎬 Dizi seç:", {
    reply_markup: { inline_keyboard: keyboard }
  });
});

bot.on("callback_query", query => {
  const chatId = query.message.chat.id;
  const db = data();
  const dataKey = query.data;

  // Dizi
  if (dataKey.startsWith("dizi_")) {
    const dizi = dataKey.split("_")[1];
    userState[chatId] = { dizi };

    const seasons = Object.keys(db[dizi].seasons).map(s => ([
      { text: `Sezon ${s}`, callback_data: `sezon_${s}` }
    ]));

    bot.editMessageText("📀 Sezon seç:", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: seasons }
    });
  }

  // Sezon
  if (dataKey.startsWith("sezon_")) {
    const sezon = dataKey.split("_")[1];
    userState[chatId].sezon = sezon;

    const { dizi } = userState[chatId];
    const bolumler = Object.keys(db[dizi].seasons[sezon]).map(b => ([
      { text: `Bölüm ${b}`, callback_data: `bolum_${b}` }
    ]));

    bot.editMessageText("▶️ Bölüm seç:", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: { inline_keyboard: bolumler }
    });
  }

  // Bölüm
  if (dataKey.startsWith("bolum_")) {
    const bolum = dataKey.split("_")[1];
    const { dizi, sezon } = userState[chatId];

    const link = db[dizi].seasons[sezon][bolum];

    bot.editMessageText(`🔗 İzleme Linki:\n${link}`, {
      chat_id: chatId,
      message_id: query.message.message_id
    });
  }
});
