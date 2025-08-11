module.exports = (sequelize, DataTypes) => {
  let SingleHome = sequelize.define("SingleHome", {
    topText: DataTypes.TEXT("long"),
    published: DataTypes.BOOLEAN,
  });

  SingleHome.associate = (models) => {
    SingleHome.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
    SingleHome.belongsTo(models.User, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return SingleHome;
};
