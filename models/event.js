module.exports = (sequelize, DataTypes) => {
  let Event = sequelize.define("Event", {
    name: DataTypes.STRING,
  });

  return Event;
};
