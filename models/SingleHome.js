module.exports = (sequelize, DataTypes) => {
  let SingleHome = sequelize.define("SingleHome", {
    topText: DataTypes.TEXT("long"),
    published: DataTypes.BOOLEAN,
    HeadlineEventId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Events", // This must match the table name in the DB
        key: "id",
      },
      allowNull: true, // It's okay if they haven't picked a headline event yet
    },
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
    SingleHome.belongsTo(models.Event, {
      as: "HeadlineEvent", // This is the nickname we'll use in queries
      foreignKey: "HeadlineEventId",
    });
  };

  return SingleHome;
};
