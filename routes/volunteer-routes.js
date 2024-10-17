let db = require("../models");
const transporter = require("../config/nodemailer");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

let formatDataForDB = (requestBody, imageIdFromDb) => ({
  position: requestBody.position,
  frequency: requestBody.frequency,
  description: requestBody.description,
  primaryContact: requestBody.primaryContact,
  primaryContactEmail: requestBody.primaryContactEmail,
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

  // POST A NEW VOLUNTEER POSITION
  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.post(
    "/api/volunteer",
    isAuthenticated,
    upload.single("image"),
    async function (req, res) {
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
    }
  );

  // UPDATE A VOLUNTEER POSITION
  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.put(
    "/api/volunteer",
    isAuthenticated,
    upload.single("image"),
    async function (req, res) {
      let volunteerPositionRes;
      let afterUpdate;

      const updateThePosition = async (requestBody, imageId) => {
        const updateRes = await db.VolunteerPosition.update(
          formatDataForDB(requestBody, imageId),
          {
            where: { id: requestBody.id },
          }
        );

        if (updateRes[0] == 1) {
          volunteerPositionRes = await getTheUpdatedVolunteerPosition;
        }
      };

      const getTheUpdatedVolunteerPosition = async () => {
        const dbVolunteerPositionPostModification =
          await db.VolunteerPosition.findOne({
            where: { id: req.body.id, OrganizationId: req.body.orgId },
            include: [db.Image],
          });

        return dbVolunteerPositionPostModification;
      };

      // IS A NEW IMAGE INCLUDED IN THE REVISION?
      switch (typeof req.file == "undefined") {
        case true:
          // NO IMAGE IS INCLUDED IN THE REVISION

          afterUpdate = await updateThePosition(req.body);
          try {
            res.json(afterUpdate);
          } catch (error) {
            throw error;
          }

          break;
        case false:
          // AN IMAGE IS INCLUDED IN THE REVISION
          const imageRes = await uploadImageAndAddImageToDb(
            req.file,
            req.body.orgId
          );

          afterUpdate = await updateThePosition(req.body, imageRes.id);

          try {
            res.json(afterUpdate);
          } catch (error) {
            throw error;
          }

        default:
          break;
      }
    }
  );

  // CHANGE THE PUBLISHED STATUS OF A POSITION
  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.put("/api/volunteer/publish", isAuthenticated, async (req, res) => {
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

  // GET POSITIONS FROM AN ORGANIZATION REGARDLESS OF PUBLISHED STATUS
  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/api/volunteer/org/:orgId", isAuthenticated, async (req, res) => {
    const dbVolunteerPositions = await db.VolunteerPosition.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
      include: [db.Image],
    });

    res.json(dbVolunteerPositions);
  });

  // GET PUBLISHED POSITIONS FROM AN ORGANIZATION
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

  // GET SPECIFIC POSITION BY NAME FROM SPECIFIED ORGANIZATION
  app.get(
    "/api/volunteer/published/position/:positionName/:orgId",
    async (req, res) => {
      const positionName = req.params.positionName.replace(/-/g, " ");
      const orgId = req.params.orgId;

      const dbPublishedVolunteerPosition = await db.VolunteerPosition.findOne({
        where: {
          position: positionName,
          OrganizationId: orgId,
          published: true,
        },
        include: [db.Image],
      });

      res.json(dbPublishedVolunteerPosition);
    }
  );

  app.put("/api/volunteer/submit/:id", async (req, res) => {
    console.log("Body: ", req.body);
    console.log("Position ID: ", req.params.id);

    const dbPosition = await db.VolunteerPosition.findOne({
      where: {
        id: req.params.id,
      },
    });

    let mailOptions = {
      from: "luke@grahamwebworks.com",
      to: dbPosition.primaryContactEmail,
      subject: `Volunteer Submission for ${dbPosition.position}`,
      text: `Someone filled out the volunteer form for the ${
        dbPosition.position
      } position. Woohoo!  Here's their info:
      
      Name: ${req.body.name},
      Email: ${req.body.email},
      Message: ${req.body.message ? req.body.message : ""}
      
      
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent", info.response);
      }
    });

    res.json({
      message: "Message sent!",
    });
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
