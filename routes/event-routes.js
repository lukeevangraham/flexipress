let db = require("../models");

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

      const dbEvent = await db.Event.create({
        name: req.body.name,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        repeatsEveryXDays: req.body.repeatsEveryXDays
          ? req.body.repeatsEveryXDays
          : null,
        location: req.body.location,
        description: req.body.description,
        OrganizationId: req.body.orgId,
        ImageId: dbImage.id,
      });

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
