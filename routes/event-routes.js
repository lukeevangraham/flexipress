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
    published: String(requestBody.published) === "true",
    OrganizationId: requestBody.orgId,
  };

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
    try {
      let imageId = null;

      if (req.file) {
        const imageRes = await uploadImageAndAddImageToDb(
          req.file,
          req.body.orgId,
        );
        imageId = imageRes.id;
      }

      const dbEvent = await db.Event.create(formatDataForDB(req.body, imageId));

      if (req.body.ministryId) {
        await dbEvent.addMinistries(
          req.body.ministryId.split(",").map((id) => parseInt(id)),
        );
      }

      // CONSISTENCY FIX: Fetch the full list just like the PUT route does
      const allEvents = await fetchOrgEventList(req.body.orgId);
      res.json(allEvents);
    } catch (error) {
      console.error("POST Error: ", error);
      res.status(500).json({ error: "Failed to create event." });
    }
  });

  app.put(
    "/api/event/",
    isAuthenticated,
    upload.single("image"),
    async (req, res) => {
      // 1. GATEKEEPER: Check for the "undefined" string or missing ID
      if (!req.body.id || req.body.id === "undefined") {
        console.error("PUT request received without a valid ID.");
        return res
          .status(400)
          .json({ error: "Valid Event ID is required for update." });
      }

      // HELPER: Get a single event
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
        // 2. SANITIZE embedCode: Ensure it's not the string "undefined"
        const data = formatDataForDB(requestBody, imageId);
        if (data.embedCode === "undefined") data.embedCode = null;

        await db.Event.update(data, {
          where: { id: requestBody.id },
        });

        // Fetch the instance to update associations
        let eventRes = await getTheUpdatedEvent();
        if (eventRes && requestBody.ministryId) {
          const ministryIds = requestBody.ministryId
            .split(",")
            .map((id) => parseInt(id));
          await eventRes.setMinistries(ministryIds);
        }
        return eventRes;
      };

      // --- LOGIC START ---
      const isNewImage = typeof req.file !== "undefined";

      try {
        if (!isNewImage) {
          await updateTheEvent(req.body);
        } else {
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

        const allEvents = await getFullEventList();
        res.json(allEvents);
      } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update event." });
      }
    },
  );

  app.put("/api/event/publish", async (req, res) => {
    try {
      // 1. Perform the update
      await db.Event.update(
        { published: req.body.published },
        { where: { id: req.body.eventId } },
      );

      // 2. Fetch the fresh version of that event
      // This ensures the frontend gets the latest timestamps and state
      const updatedEvent = await db.Event.findOne({
        where: { id: req.body.eventId },
        include: ["Image", "Ministries"], // Optional: Include associations if your UI needs them
      });

      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(updatedEvent);
    } catch (error) {
      console.error("Publish Error: ", error);
      res.status(500).json({ error: "Failed to update publish status" });
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
      const eventId = req.params.id;

      // FALLBACK: Try multiple common Passport/Session locations for the orgId
      const userOrgId = req.user?.orgId || req.user?.OrganizationId;

      // SAFETY GATE: If we can't find an OrgID, don't even try the DB query
      if (!userOrgId) {
        console.error(
          "Delete blocked: No Organization ID found in user session.",
        );
        return res
          .status(401)
          .json({ error: "User session missing Organization identity." });
      }

      const event = await db.Event.findOne({
        where: {
          id: eventId,
          OrganizationId: userOrgId,
        },
        include: [db.Image, db.Ministry],
      });

      if (!event) return res.status(404).json({ error: "Event not found" });

      const imageToDelete = event.Image;

      // 1. MUST UNLINK MINISTRIES FIRST (Clears the junction table)
      await event.setMinistries([]);

      // 2. DELETE THE EVENT
      await db.Event.destroy({ where: { id: eventId } });

      // 3. CLEAN UP IMAGE
      if (imageToDelete && imageToDelete.imageId) {
        await cloudinary.v2.uploader.destroy(imageToDelete.imageId);
        await db.Image.destroy({ where: { id: imageToDelete.id } });
      }

      res.json({ message: "Successfully deleted" });
    } catch (error) {
      console.error("Delete Error: ", error);
      res.status(500).json({ error: error.message });
    }
  });
};
