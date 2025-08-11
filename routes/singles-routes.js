let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = (app) => {
  // GET HOME INFO SINGLE
  app.get("/api/single/home/:orgId", async (req, res) => {
    try {
      const homeInfo = await db.SingleHome.findOne({
        where: { OrganizationId: req.params.orgId },
      });
      res.json(homeInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve home info." });
    }
  });

  // UPDATE HOME INFO SINGLE
  // Here we've add our isAuthenticated middleware to this route.
  app.put("/api/single/home/:id", isAuthenticated, async (req, res) => {
    try {
      const updatedHomeInfo = await db.SingleHome.update(req.body, {
        where: { id: req.params.id },
      });
      res.json(updatedHomeInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to update home info." });
    }
  });

  // POST A HOME INFO SINGLE
  // Here we've add our isAuthenticated middleware to this route.
  app.post("/api/single/home", isAuthenticated, async (req, res) => {
    console.log("Creating new home info with data:", req.body);

    try {
      const newHomeInfo = await db.SingleHome.create({
        topText: req.body.topText,
        OrganizationId: req.body.orgId,
        UserId: req.body.userId,
      });
      res.json(newHomeInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to create home info." });
    }
  });
};
