module.exports = (sequelize, DataTypes) => {
  let VolunteerPosition = sequelize.define("VolunteerPosition", {
    position: DataTypes.STRING,
    frequency: DataTypes.STRING,
    description: DataTypes.TEXT,
    primaryContact: DataTypes.STRING,
    sponsoringMinistry: DataTypes.STRING,
    published: DataTypes.BOOLEAN,
  });

  VolunteerPosition.associate = (models) => {
    VolunteerPosition.belongsTo(models.Image);
    VolunteerPosition.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return VolunteerPosition;
};
