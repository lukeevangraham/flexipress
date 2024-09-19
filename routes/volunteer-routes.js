let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

let formatDataForDB = (requestBody, imageIdFromDb) => ({
  position: requestBody.position,
  frequency: requestBody.frequency,
  description: requestBody.description,
  primaryContact: requestBody.primaryContact,
  sponsoringMinistry: requestBody.sponsoringMinistry,
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

  app.post("/api/volunteer", upload.single("image"), async function (req, res) {
    if (req.file) {
      const imageRes = await uploadImageAndAddImageToDb(
        req.file,
        req.body.orgId
      );

      const dbVolunteerPosition = await db.VolunteerPosition.create(
        formatDataForDB(req.body, imageRes.id)
      );

      const valuesToSendToClient = {
        ...dbVolunteerPosition.dataValues,
        Image: imageRes.dataValues,
      };

      try {
        res.json(valuesToSendToClient);
      } catch (error) {
        console.log("E: ", error);
      }
    }
  });

  app.put("/api/volunteer/publish", async (req, res) => {
    const updatePublishResponse = await db.VolunteerPosition.update(
      { published: req.body.published },
      { where: { id: req.body.positionId } }
    );

    try {
      res.json(updatePublishResponse);
    } catch (error) {
      console.log("E: ", error);
    }
  });

  app.get("/api/volunteer/org/:orgId", async (req, res) => {
    const dbVolunteerPositions = await db.VolunteerPosition.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
      include: [db.Image],
    });

    res.json(dbVolunteerPositions);
  });

  app.get("/api/volunteer/published/org/:orgId", async (req, res) => {
    const dbPublishedVolunteerPositions = await db.VolunteerPosition.findAll({
      where: {
        OrganizationId: req.params.orgId,
        published: true,
      },
      include: [db.Image],
    });

    res.json(dbPublishedVolunteerPositions);
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.delete("/api/volunteer/:id", isAuthenticated, async (req, res) => {
    const dbPosition = await db.VolunteerPosition.destroy({
      where: { id: req.params.id },
    });

    try {
      res.json(dbPosition);
    } catch (error) {
      console.log("E: ", error);
    }
  });
};
