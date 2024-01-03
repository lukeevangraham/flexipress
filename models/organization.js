module.exports = (sequelize, DataTypes) => {
  let Organization = sequelize.define("Organization", {
    orgName: DataTypes.STRING,
  });

  Organization.associate = (models) => {
    Organization.hasMany(models.User);
  };

  return Organization;
};
