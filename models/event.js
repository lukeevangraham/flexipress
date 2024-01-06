module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define("Event", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    repeatsEveryXDays: DataTypes.SMALLINT,
    location: DataTypes.STRING,
    description: DataTypes.TEXT
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return Event;
};
