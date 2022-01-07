require("dotenv").config();
const Telegraf = require("telegraf");
const app = new Telegraf(process.env.BOT_KEY, {
  username: process.env.BOT_NAME,
});
const request = require("request");

(async function () {
  app.command("start", (ctx) => {
    ctx.reply("Welcome to Yu-Gi-Oh! Bot.\nLost? Use /help");
  });

  app.command("help", (ctx) => {
    ctx.reply(
      "To search: /card [name].\nTo send a feedback: /feedback [suggestion].\nUse the complete name of the card (in lower case and without typo):\n/card exodia the forbidden one"
    );
  });

  app.command("card", (ctx) => {
    var key = ctx.message.text.replace(/[^\s]+ /, "").trim();

    request(
      "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=" + key,
      { json: true },
      (err, res, body) => {
        if (err) {
          return console.log(err);
        }
        console.log(res.body.data[0].card_images[0].image_url);
        ctx.replyWithPhoto({
          url: res.body.data[0].card_images[0].image_url,
          filename: res.body.data[0].name,
        });
      }
    );
  });

  app.on("inline_query", (ctx) => {
    const result = [];

    if (
      ctx.inlineQuery.query != undefined &&
      ctx.inlineQuery.query.length >= 3
    ) {
      request(
        "https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=" +
          ctx.inlineQuery.query,
        { json: true },
        (err, res, body) => {
          if (err) {
            return;
          } else if (res.body.data != undefined) {
            res.body.data.forEach((element) => {
              let name = element.name;
              let card_id = element.id;
              let image = element.card_images[0].image_url;
              let thumb = element.card_images[0].image_url_small;
              if (result.length < 50) {
                result.push({
                  photo_url: image,
                  type: "photo",
                  title: name,
                  id: card_id,
                  thumb_url: thumb,
                });
              }
            });
            // Using context shortcut
            ctx.answerInlineQuery(result);
          }
        }
      );
    } else {
      // Do Nothing
      return;
    }
  });

  if (app.state.started) {
    await app.stop();
  }
  await app.startPolling();
})();
