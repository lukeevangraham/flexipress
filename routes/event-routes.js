let db = require("../models");

let formatDataForDB = (requestBody, imageIdFromDb) => ({
  name: requestBody.name,
  startDate: requestBody.startDate,
  endDate: requestBody.endDate,
  repeatsEveryXDays: requestBody.repeatsEveryXDays
    ? requestBody.repeatsEveryXDays
    : null,
  location: requestBody.location,
  description: requestBody.description,
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
    console.log("EVENT POST: ", req.file);

    if (req.file) {
      const imageRes = await uploadImageAndAddImageToDb(
        req.file,
        req.body.orgId
      );

      const dbEvent = await db.Event.create(
        formatDataForDB(req.body, imageRes.id)
      );

      const valuesToSendToClient = {
        ...dbEvent.dataValues,
        Image: imageRes.dataValues,
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
      const updateRes = await db.Event.update(
        formatDataForDB(requestBody, imageId),
        {
          where: { id: requestBody.id },
        }
      );
      // return updateRes;

      if (updateRes[0] == 1) {
        eventRes = await getTheUpdatedEvent();

        return eventRes;
      }
    };

    const getTheUpdatedEvent = async () => {
      const dbEventPostMofidication = await db.Event.findOne({
        where: { id: req.body.id, OrganizationId: req.body.orgId },
        include: [db.Image],
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

  app.get("/api/event/org/:orgId", async (req, res) => {
    const dbEvent = await db.Event.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
      include: [db.Image],
    });

    res.json(dbEvent);
  });
};
