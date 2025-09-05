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

  app.put("/api/event/", upload.single("image"), async (req, res) => {
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
  });

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

  app.get("/api/event/org/:orgId", async (req, res) => {
    const dbEvent = await db.Event.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
      include: [{ model: db.Image }, { model: db.Ministry }],
    });

    res.json(dbEvent);
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
