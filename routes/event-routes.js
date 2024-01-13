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
  app.post("/api/event", upload.single("image"), async function (req, res) {
    console.log("EVENT POST: ", req.file);

    if (req.file) {
      const cloudinaryResponse = await cloudinary.v2.uploader.upload(
        req.file.path
      );

      // console.log("HERE: ", cloudinaryResponse)

      const newImageObject = {
        fileName: cloudinaryResponse.original_filename,
        url: cloudinaryResponse.secure_url,
        imageId: cloudinaryResponse.public_id,
        width: cloudinaryResponse.width,
        height: cloudinaryResponse.height,
        OrganizationId: req.body.orgId,
      };

      const dbImage = await db.Image.create(newImageObject, (err, image) => {
        if (err) {
          res.json(err.message);
        }
      });

      const dbEvent = await db.Event.create(
        formatDataForDB(req.body, dbImage.id)
      );

      const valuesToSendToClient = {
        ...dbEvent.dataValues,
        Image: dbImage.dataValues,
      };

      try {
        res.json(valuesToSendToClient);
      } catch (error) {
        console.log("E: ", error);
      }
    }
  });

  app.put("/api/event/", upload.single("image"), async (req, res) => {
    // console.log("EVENT PUT BODY: ", req.body);
    console.log("EVENT PUT FILE: ", req.file);

    const dbEvent = await db.Event.update(formatDataForDB(req.body), {
      where: { id: req.body.id },
    });

    const valuesToSendToClient = {
      ...dbEvent.dataValues,
    };

    console.log("dbEvent: ", dbEvent[0]);

    try {
      res.json(valuesToSendToClient);
    } catch (error) {
      console.log("E: ", error);
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
