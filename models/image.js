module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define("Image", {
    fileName: DataTypes.STRING,
    url: DataTypes.STRING,
    imageId: DataTypes.STRING,
    alternativeText: DataTypes.STRING,
    caption: DataTypes.STRING,
  });

  return Image;
};
