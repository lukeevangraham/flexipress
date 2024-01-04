module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define("Event", {
    name: DataTypes.STRING,
    startDate: DataTypes.DATE
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
