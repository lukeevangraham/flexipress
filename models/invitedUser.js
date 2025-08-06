module.exports = (sequelize, DataTypes) => {
  let InvitedUser = sequelize.define("InvitedUser", {
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  });

  InvitedUser.associate = (models) => {
    InvitedUser.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return InvitedUser;
};
