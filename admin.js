// admin.js
const fs = require("fs");

module.exports = function (bot) {
  const ADMIN_ID = String(process.env.ADMIN_ID);
  const state = {};

  function readDB() {
    return JSON.parse(fs.readFileSync("data.json", "utf8"));
  }

  function writeDB(db) {
    fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
  }

  // /admin komutu
  bot.onText(/\/admin/, (msg) => {
    if (String(msg.from.id) !== ADMIN_ID) return;

    bot.sendMessage(msg.chat.id, "🛠 Admin Panel", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "➕ Dizi Ekle", callback_data: "A_DIZI" }],
          [{ text: "➕ Sezon Ekle", callback_data: "A_SEZON" }],
          [{ text: "➕ Bölüm + Link", callback_data: "A_BOLUM" }],
        ],
      },
    });
  });

  // Admin butonları
  bot.on("callback_query", (q) => {
    if (String(q.from.id) !== ADMIN_ID) return;

    const chatId = q.message.chat.id;

    if (q.data === "A_DIZI") {
      state[chatId] = "DIZI";
      bot.sendMessage(chatId, "Dizi key yaz (ör: breakingbad)");
    }

    if (q.data === "A_SEZON") {
      state[chatId] = "SEZON";
      bot.sendMessage(chatId, "Dizi|Sezon (ör: breakingbad|1)");
    }

    if (q.data === "A_BOLUM") {
      state[chatId] = "BOLUM";
      bot.sendMessage(chatId, "Dizi|Sezon|Bölüm|Link");
    }
  });

  // Admin yazıları
  bot.on("message", (msg) => {
    if (String(msg.from.id) !== ADMIN_ID) return;
    if (!state[msg.chat.id]) return;

    const db = readDB();
    const text = msg.text;

    if (state[msg.chat.id] === "DIZI") {
      const key = text.trim();
      if (!db[key]) {
        db[key] = { name: key, seasons: {} };
        writeDB(db);
        bot.sendMessage(msg.chat.id, "✅ Dizi eklendi");
      }
    }

    if (state[msg.chat.id] === "SEZON") {
      const [dizi, sezon] = text.split("|");
      if (db[dizi]) {
        db[dizi].seasons[sezon] = {};
        writeDB(db);
        bot.sendMessage(msg.chat.id, "✅ Sezon eklendi");
      }
    }

    if (state[msg.chat.id] === "BOLUM") {
      const [dizi, sezon, bolum, link] = text.split("|");
      if (db[dizi] && db[dizi].seasons[sezon]) {
        db[dizi].seasons[sezon][bolum] = link;
        writeDB(db);
        bot.sendMessage(msg.chat.id, "✅ Bölüm + link eklendi");
      }
    }

    delete state[msg.chat.id];
  });
};
