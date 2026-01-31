require("dotenv").config();
const fs = require("fs");

module.exports = (bot) => {
  bot.onText(/\/add (.+)/, (msg, match) => {
    if (msg.from.id != process.env.ADMIN_ID) return;

    const [dizi, sezon, bolum, link] = match[1].split("|");

    const db = JSON.parse(fs.readFileSync("data.json"));

    if (!db[dizi]) db[dizi] = { name: dizi, seasons: {} };
    if (!db[dizi].seasons[sezon]) db[dizi].seasons[sezon] = {};

    db[dizi].seasons[sezon][bolum] = link;

    fs.writeFileSync("data.json", JSON.stringify(db, null, 2));

    bot.sendMessage(msg.chat.id, "✅ Link eklendi");
  });
};
