let db = require("../models");

let isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = (app) => {
  app.get("/api/ministries/:orgId", isAuthenticated, async (req, res) => {
    try {
      const ministries = await db.Ministry.findAll({
        where: {
          OrganizationId: req.params.orgId,
        },
      });
      res.json(ministries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ministries/add/:orgId", isAuthenticated, async (req, res) => {
    console.log("Adding a new ministry for orgId:", req.params.orgId);

    console.log("Body: ", req.body);

    try {
      const newMinistry = await db.Ministry.create({
        name: req.body.name,
        description: req.body.description,
        primaryContact: req.body.primaryContact,
        primaryContactEmail: req.body.primaryContactEmail,
        OrganizationId: req.params.orgId,
      });
      res.json(newMinistry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
