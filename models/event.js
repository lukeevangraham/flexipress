module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define("Event", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    repeatsEveryXDays: { type: DataTypes.SMALLINT, allowNull: true },
    location: DataTypes.STRING,
    description: DataTypes.TEXT,
    embedCode: DataTypes.TEXT,
    published: DataTypes.BOOLEAN,
    isFeaturedOnHome: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Image);
    Event.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
    Event.belongsToMany(models.Ministry, {
      through: "MinistryEvent",
    });
  };

  return Event;
};
