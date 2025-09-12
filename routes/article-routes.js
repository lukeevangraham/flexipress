let db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
var isAuthenticated = require("../config/middleware/isAuthenticated");

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

  app.get(
    "/api/articles/org/:orgId/columns",
    isAuthenticated,
    async (req, res) => {
      res.json(db.Article.rawAttributes);
    }
  );

  app.get("/api/articles/org/:orgId", async (req, res) => {
    const dbArticle = await db.Article.findAll({
      where: {
        OrganizationId: req.params.orgId,
      },
      include: [db.Image, db.Ministry],
      order: [["createdAt", "DESC"]],
    });
    if (dbArticle) {
      res.json(dbArticle);
    } else {
      res.status(404).end();
    }
  });

  app.post(
    "/api/article",
    isAuthenticated,
    upload.single("image"),
    async (req, res) => {
      if (req.file) {
        const imagesRes = await uploadImageAndAddImageToDb(
          req.file,
          req.body.orgId
        );

        req.body.ImageId = imagesRes.id;

        const dbArticle = await db.Article.create(req.body);

        const dbArticleWithMins = await dbArticle.addMinistries(
          req.body.ministries.split(",").map((id) => parseInt(id))
        );

        const valuesToSendToClient = {
          ...dbArticle.dataValues,
          Image: imagesRes.dataValues,
          Ministries: req.body.ministries
            .split(",")
            .map((id) => ({ id: parseInt(id) })),
        };

        try {
          res.json(valuesToSendToClient);
        } catch (error) {
          console.log("E: ", error);
        }
      }
    }
  );

  app.put("/api/article/publish", isAuthenticated, async (req, res) => {
    const dbArticle = await db.Article.update(
      { published: req.body.published },
      {
        where: { id: req.body.articleId },
      }
    );

    const updatedArticle = await db.Article.findOne({
      where: { id: req.body.articleId },
      include: [db.Image, db.Ministry],
    });

    try {
      res.json(updatedArticle);
    } catch (error) {
      console.log("E: ", error);
    }
  });

  app.delete("/api/article/:id", isAuthenticated, async (req, res) => {
    const dbArticle = await db.Article.destroy({
      where: {
        id: req.params.id,
      },
    });

    try {
      res.json(dbArticle);
    } catch (error) {
      console.log("E: ", error);
    }
  });
};
