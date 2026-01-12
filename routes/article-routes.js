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

  // GET ARTICLES BY ORG ID WITH OPTIONAL PUBLISHED FILTER
  app.get("/api/articles/org/:orgId", async (req, res) => {
    try {
      // 1. Destructure the published status from req.query
      const { published } = req.query;

      // 2. Buildf a dynamic 'where' object
      const whereClause = {
        OrganizationId: req.params.orgId,
      };

      // 3. Only add 'published' to the filter if it exists in the query string
      if (published !== undefined) {
        // convert string "true"/"false" to boolean if DB uses booleans
        whereClause.published = published === "true";
      }

      const dbArticle = await db.Article.findAll({
        where: whereClause,
        include: [db.Image, db.Ministry],
        order: [["createdAt", "DESC"]],
      });

      res.json(dbArticle);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

  app.put(
    "/api/article/",
    isAuthenticated,
    upload.single("image"),
    async (req, res) => {
      let valuesToSendToClient = {};
      let articleRes;
      let dbArticle;

      let afterUpdate;

      const updateTheArticle = async (requestBody, imageId) => {
        const updatedArticle = await db.Article.update(
          { ...requestBody, ImageId: imageId },
          {
            where: { id: requestBody.id },
          }
        );
      };

      if (req.file) {
        const imageRes = await uploadImageAndAddImageToDb(
          req.file,
          req.body.orgId
        );

        await updateTheArticle(req.body, imageRes.id);

        dbArticle = await db.Article.findOne({
          where: { id: req.body.id },
          include: [db.Image, db.Ministry],
        });

        valuesToSendToClient = {
          ...dbArticle.dataValues,
          Image: imageRes.dataValues,
          Ministries: dbArticle.Ministries,
        };
      } else {
        await updateTheArticle(req.body, req.body.imageId);

        dbArticle = await db.Article.findOne({
          where: { id: req.body.id },
          include: [db.Image, db.Ministry],
        });

        valuesToSendToClient = {
          ...dbArticle.dataValues,
          Image: dbArticle.Image,
          Ministries: dbArticle.Ministries,
        };
      }

      try {
        res.json(valuesToSendToClient);
      } catch (error) {
        console.log("E: ", error);
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

  app.patch("/api/articles/:id/feature", isAuthenticated, async (req, res) => {
    try {
      const { isFeaturedOnHome } = req.body;
      await db.Article.update(
        { isFeaturedOnHome },
        {
          where: { id: req.params.id },
        }
      );
      res.status(200).json({ message: "Featured status updated successfully" });
    } catch (error) {
      console.error("Error updating featured status:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the article." });
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
