module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define("Event", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    repeatsEveryXDays: { type: DataTypes.SMALLINT, allowNull: true },
    location: DataTypes.STRING,
    description: DataTypes.TEXT,
    published: DataTypes.BOOLEAN
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Image);
    Event.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return Event;
};
