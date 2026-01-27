const { Op } = require("sequelize");
let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

let formatDataForDB = (requestBody, imageIdFromDb) => {
  const data = {
    name: requestBody.name,
    slug:
      requestBody.slug ||
      requestBody.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, ""),
    startDate: requestBody.startDate,
    endDate: requestBody.endDate,
    repeatsEveryXDays: requestBody.repeatsEveryXDays || null,
    location: requestBody.location,
    description: requestBody.description,
    embedCode: requestBody.embedCode,
    published: requestBody.published,
    OrganizationId: requestBody.orgId,
  };

  // Only include ImageId in the update object if a new one was actually uploaded
  if (imageIdFromDb) {
    data.ImageId = imageIdFromDb;
  }

  return data;
};

module.exports = (app, cloudinary, upload) => {
  // SHARED HELPER: This is the single source of truth for an Org's event list
  const fetchOrgEventList = async (orgId, queryParams = {}) => {
    const { published, featured, ministryId } = queryParams;

    const whereClause = {
      OrganizationId: orgId,
      [Op.or]: [
        { endDate: { [Op.gte]: new Date() } },
        { repeatsEveryXDays: { [Op.gt]: 0 } },
      ],
    };

    if (published !== undefined) whereClause.published = published === "true";
    if (featured !== undefined)
      whereClause.isFeaturedOnHome = featured === "true";

    const ministryInclude = {
      model: db.Ministry,
      ...(ministryId && { where: { id: ministryId } }),
    };

    return await db.Event.findAll({
      where: whereClause,
      include: [{ model: db.Image }, ministryInclude],
      order: [["updatedAt", "DESC"]],
    });
  };

  let uploadImageAndAddImageToDb = async (file, orgId) => {
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(file.path, {
      // 1. Keep the new account organized
      folder: "flexipress_events",

      // 2. Limit resolution (Resize to 1200px wide ONLY if the original is larger)
      width: 1200,
      crop: "limit",

      // 3. Auto-Optimization
      // fetch_format: "auto" picks WebP/AVIF for modern browsers
      // quality: "auto" uses AI to compress the file size without losing detail
      fetch_format: "auto",
      quality: "auto",
    });

    const newImageObject = {
      fileName: cloudinaryResponse.original_filename,
      // secure_url will now point to the optimized version if you set it in presets,
      // but Cloudinary also handles the optimization via the URL transformation.
      url: cloudinaryResponse.secure_url,
      imageId: cloudinaryResponse.public_id,
      width: cloudinaryResponse.width,
      height: cloudinaryResponse.height,
      OrganizationId: orgId,
    };

    // Removed the callback (err, image) as db.Image.create returns a promise
    // and we are using async/await.
    try {
      const dbImage = await db.Image.create(newImageObject);
      return dbImage;
    } catch (err) {
      console.error("Database Error saving image:", err);
      throw err; // Throw so the calling route knows the DB save failed
    }
  };

  app.post("/api/event", upload.single("image"), async function (req, res) {
    if (req.file) {
      const imageRes = await uploadImageAndAddImageToDb(
        req.file,
        req.body.orgId,
      );

      const dbEvent = await db.Event.create(
        formatDataForDB(req.body, imageRes.id),
      );

      const dbEventWithMins = await dbEvent.addMinistries(
        req.body.ministryId.split(",").map((id) => parseInt(id)),
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
      let afterUpdate;

      // HELPER: Get a single event (for internal logic)
      const getTheUpdatedEvent = async () => {
        return await db.Event.findOne({
          where: { id: req.body.id, OrganizationId: req.body.orgId },
          include: [{ model: db.Image }, { model: db.Ministry }],
        });
      };

      const getFullEventList = async () => {
        return await fetchOrgEventList(req.body.orgId);
      };

      const updateTheEvent = async (requestBody, imageId) => {
        const updatedEvent = await db.Event.update(
          formatDataForDB(requestBody, imageId),
          { where: { id: requestBody.id } },
        );

        if (updatedEvent[0] == 1) {
          let eventRes = await getTheUpdatedEvent();
          await eventRes.setMinistries(
            req.body.ministryId.split(",").map((id) => parseInt(id)),
          );
          return await getTheUpdatedEvent();
        }
      };

      // --- LOGIC START ---
      const isNewImage = typeof req.file !== "undefined";

      try {
        if (!isNewImage) {
          // CASE: NO NEW IMAGE
          await updateTheEvent(req.body);
        } else {
          // CASE: NEW IMAGE UPLOADED
          const oldEvent = await db.Event.findOne({
            where: { id: req.body.id },
            include: [db.Image],
          });
          const oldImage = oldEvent ? oldEvent.Image : null;

          const imageRes = await uploadImageAndAddImageToDb(
            req.file,
            req.body.orgId,
          );
          await updateTheEvent(req.body, imageRes.id);

          if (oldImage && oldImage.imageId) {
            await cloudinary.v2.uploader.destroy(oldImage.imageId);
            await db.Image.destroy({ where: { id: oldImage.id } });
          }
        }

        // FINAL STEP: Always return the full list so the React frontend doesn't crash
        const allEvents = await getFullEventList();
        res.json(allEvents);
      } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update event." });
      }
    },
  );

  app.put("/api/event/publish", async (req, res) => {
    const updatePublishResponse = await db.Event.update(
      { published: req.body.published },
      { where: { id: req.body.eventId } },
    );

    try {
      res.json(updatePublishResponse);
    } catch (error) {
      console.log("E: ", error);
    }
  });

  // GET EVENTS BY ORG ID WITH OPTIONAL FILTERS
  app.get("/api/events/org/:orgId", async (req, res) => {
    try {
      const events = await fetchOrgEventList(req.params.orgId, req.query);
      res.json(events);
    } catch (error) {
      console.error("Fetch Events Error:", error);
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
        { where: { id } },
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

  // API SEARCH ROUTE
  app.get("/api/search/:orgId/:query", async (req, res) => {
    try {
      const results = await db.Event.findAll({
        where: {
          OrganizationId: req.params.orgId,
          published: true,
          [Op.or]: [
            { name: { [Op.like]: `%${req.params.query}%` } },
            { description: { [Op.like]: `%${req.params.query}%` } },
          ],
        },
        include: [db.Ministry, db.Image], // Include ministry so we can show it in search results
      });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/event/:id", isAuthenticated, async (req, res) => {
    try {
      // 1. Find the event AND the associated image
      const event = await db.Event.findOne({
        where: {
          id: req.params.id,
          OrganizationId: req.user.orgId, // Assuming passport attaches user to req
        },
        include: [db.Image],
      });

      if (!event) return res.status(404).json({ error: "Event not found" });

      const imageToDelete = event.Image;

      // 2. Delete the Event first (so it doesn't show up in the UI)
      await db.Event.destroy({ where: { id: req.params.id } });

      // 3. If there was an image, clean up Cloudinary and the Image table
      if (imageToDelete && imageToDelete.imageId) {
        // imageId is the column where you stored the Cloudinary public_id
        await cloudinary.v2.uploader.destroy(imageToDelete.imageId);
        await db.Image.destroy({ where: { id: imageToDelete.id } });
        console.log(`Cleaned up Cloudinary asset: ${imageToDelete.imageId}`);
      }

      res.json({ message: "Event and associated assets deleted." });
    } catch (error) {
      console.log("Delete Error: ", error);
      res.status(500).json(error);
    }
  });
};
