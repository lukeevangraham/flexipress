let db = require("../models");

module.exports = (app) => {
  app.post("/api/event", async function (req, res) {
    console.log("EVENT POST: ", req.body);

    db.Event.create({
      name: req.body.name,
    }).then((dbEvent) => {
      console.log("RES: ", dbEvent);
      res.json(dbEvent);
    });
  });
};
