module.exports = (sequelize, DataTypes) => {
  let Ministry = sequelize.define("Ministry", {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    primaryContact: DataTypes.STRING,
    primaryContactEmail: DataTypes.STRING,
    published: DataTypes.BOOLEAN,
  });

  Ministry.associate = (models) => {
    Ministry.hasMany(models.VolunteerPosition, {
      onDelete: "cascade",
    });
    Ministry.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
    Ministry.belongsToMany(models.Event, {
      through: "MinistryEvent",
    });
  };

  return Ministry;
};
