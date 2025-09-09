module.exports = (sequelize, DataTypes) => {
  let Article = sequelize.define("Article", {
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    body: DataTypes.TEXT,
    embedCode: DataTypes.TEXT,
    datePublished: DataTypes.DATE,
    metaTitle: DataTypes.STRING,
    metaDescription: DataTypes.STRING,
    published: DataTypes.BOOLEAN,
  });

  Article.associate = (models) => {
    Article.belongsTo(models.Image);
    Article.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
    Article.belongsToMany(models.Ministry, {
      through: "MinistryArticle",
    });
  };

  return Article;
};
