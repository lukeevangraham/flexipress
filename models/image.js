const { HasMany } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define("Image", {
    fileName: DataTypes.STRING,
    url: DataTypes.STRING,
    imageId: DataTypes.STRING,
    alternativeText: DataTypes.STRING,
    caption: DataTypes.STRING,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
  });

  Image.associate = (models) => {
    Image.hasMany(models.Event);
    Image.belongsTo(models.Organization)
  };

  return Image;
};
