let db = require("../models");

module.exports = (app) => {
  app.post("/api/event", async function (req, res) {
    console.log("EVENT POST: ", req.body);

    db.Event.create({
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      repeatsEveryXDays: req.body.repeatsEveryXDays,
      location: req.body.location,
      description: req.body.description,
      OrganizationId: req.body.orgId,
    }).then((dbEvent) => {
      res.json(dbEvent);
    });
  });

  app.get("/api/event/org/:orgId", async (req, res) => {
    const dbEvent = await db.Event.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
    });

    res.json(dbEvent);
  });
};
