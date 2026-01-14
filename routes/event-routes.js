const { Op } = require("sequelize");
let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

let formatDataForDB = (requestBody, imageIdFromDb) => ({
  name: requestBody.name,
  startDate: requestBody.startDate,
  endDate: requestBody.endDate,
  repeatsEveryXDays: requestBody.repeatsEveryXDays
    ? requestBody.repeatsEveryXDays
    : null,
  location: requestBody.location,
  description: requestBody.description,
  embedCode: requestBody.embedCode,
  published: requestBody.published,
  OrganizationId: requestBody.orgId,
  ImageId: imageIdFromDb,
});

module.exports = (app, cloudinary, upload) => {
  let uploadImageAndAddImageToDb = async (file, orgId) => {
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(file.path);

    const newImageObject = {
      fileName: cloudinaryResponse.original_filename,
      url: cloudinaryResponse.secure_url,
      imageId: cloudinaryResponse.public_id,
      width: cloudinaryResponse.width,
      height: cloudinaryResponse.height,
      OrganizationId: orgId,
    };

    const dbImage = await db.Image.create(newImageObject, (err, image) => {
      if (err) {
        res.json(err.message);
      }
    });

    return dbImage;
  };

  app.post("/api/event", upload.single("image"), async function (req, res) {
    if (req.file) {
      const imageRes = await uploadImageAndAddImageToDb(
        req.file,
        req.body.orgId
      );

      const dbEvent = await db.Event.create(
        formatDataForDB(req.body, imageRes.id)
      );

      const dbEventWithMins = await dbEvent.addMinistries(
        req.body.ministryId.split(",").map((id) => parseInt(id))
      );

      const valuesToSendToClient = {
        ...dbEvent.dataValues,
        Image: imageRes.dataValues,
        Ministries: req.body.ministryId
          .split(",")
          .map((id) => ({ id: parseInt(id) })), // Mock ministry objects with only IDs
      };

      try {
        res.json(valuesToSendToClient);
      } catch (error) {
        console.log("E: ", error);
      }
    }
  });

  app.put(
    "/api/event/",
    isAuthenticated,
    upload.single("image"),
    async (req, res) => {
      let valuesToSendToClient = {};
      let eventRes;
      let dbEvent;

      let afterUpdate;

      const updateTheEvent = async (requestBody, imageId) => {
        const updatedEvent = await db.Event.update(
          formatDataForDB(requestBody, imageId),
          {
            where: { id: requestBody.id },
          }
        );

        if (updatedEvent[0] == 1) {
          eventRes = await getTheUpdatedEvent();

          const setMinsResponse = await eventRes.setMinistries(
            req.body.ministryId.split(",").map((id) => parseInt(id))
          );

          if (setMinsResponse.length > 0) {
            const dbEventWithMins = await getTheUpdatedEvent();

            return dbEventWithMins;
          } else {
            return eventRes;
          }
        }
      };

      const getTheUpdatedEvent = async () => {
        const dbEventPostMofidication = await db.Event.findOne({
          where: { id: req.body.id, OrganizationId: req.body.orgId },
          include: [{ model: db.Image }, { model: db.Ministry }],
        });

        return dbEventPostMofidication;
      };

      // IS A NEW IMAGE IS INCLUDED IN THE REVISION?
      switch (typeof req.file == "undefined") {
        case true:
          // NO IMAGE IS INCLUDED IN THE REVISION

          afterUpdate = await updateTheEvent(req.body);

          try {
            res.json(afterUpdate);
          } catch (error) {
            console.log("E: ", error);
          }

          break;

        case false:
          // AN IMAGE IS INCLUDED IN THE REVISION
          const imageRes = await uploadImageAndAddImageToDb(
            req.file,
            req.body.orgId
          );

          afterUpdate = await updateTheEvent(req.body, imageRes.id);

          try {
            res.json(afterUpdate);
          } catch (error) {
            console.log("E: ", error);
          }

          break;

        default:
          break;
      }
    }
  );

  app.put("/api/event/publish", async (req, res) => {
    const updatePublishResponse = await db.Event.update(
      { published: req.body.published },
      { where: { id: req.body.eventId } }
    );

    try {
      res.json(updatePublishResponse);
    } catch (error) {
      console.log("E: ", error);
    }
  });

  // GET EVENTS BY ORG ID WITH OPTIONAL PUBLISHED FILTER
  app.get("/api/events/org/:orgId", async (req, res) => {
    try {
      // 1. Destructure the published status from req.query
      const { published } = req.query;

      // 2. Build a dynamic 'where' object
      const whereClause = {
        OrganizationId: req.params.orgId,
      };

      // 3. Only add 'published' to the filter if it exists in the query string
      if (published !== undefined) {
        // Convert string "true"/"false" to boolean if DB uses booleans
        whereClause.published = published === "true";
      }

      const dbEvent = await db.Event.findAll({
        where: whereClause,
        include: [{ model: db.Image }, { model: db.Ministry }],
      });

      res.json(dbEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET A SINGLE EVENT BY ORG AND SLUG (Public Scoped Route)
  app.get("/api/event/org/:orgId/slug/:slug", async (req, res) => {
    try {
      const dbEvent = await db.Event.findOne({
        where: {
          OrganizationId: req.params.orgId, // Multi-tenant safety
          slug: req.params.slug, // URL-friendly identifier
          published: true, // Only live events
        },
        include: [{ model: db.Image }, { model: db.Ministry }],
      });

      if (!dbEvent) {
        return res
          .status(404)
          .json({ message: "Event not found for this organization." });
      }

      res.json(dbEvent);
    } catch (error) {
      console.error("Fetch Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ALLOWS THE HOME SINGLE TO ADJUST WHETHER AN EVENT IS FEATURED ON THE HOME PAGE
  app.patch("/api/events/:id/feature", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { isFeaturedOnHome } = req.body;

      // 1. Update the record in the db
      const updateResult = await db.Event.update(
        { isFeaturedOnHome },
        { where: { id } }
      );

      // 2. Check if the update was successful
      if (updateResult[0] === 1) {
        // 3. Fetch the updated event
        const updatedEvent = await db.Event.findOne({ where: { id } });
        // 4. Send the updated event back to the client
        res.json(updatedEvent);
      } else {
        res.status(404).json({ error: "Event not found or no changes made." });
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the event." });
    }
  });

  app.delete("/api/event/:id", isAuthenticated, async (req, res) => {
    const dbEvent = await db.Event.destroy({
      where: {
        id: req.params.id,
      },
    });

    try {
      res.json(dbEvent);
    } catch (error) {
      console.log("E: ", error);
    }
  });
};
