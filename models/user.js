// Requiring bcrypt for password hashing. Using the bcrypt-nodejs version as the regular bcrypt module
// sometimes causes errors on Windows machines
var bcrypt = require("bcrypt-nodejs");
// Creating our User model
module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define("User", {
    firstName: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    // The email cannot be null, and must be a proper email before creation
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    // The password cannot be null
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // fullName: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     return `${this.firstName} ${this.lastName}`;
    //   },
    //   set(value) {
    //     throw new Error("Do not try to set the `fullName` value!");
    //   },
    // },
  });

  User.associate = (models) => {
    User.belongsTo(models.Organization, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  // User.associate = (models) => {
  //   User.belongsTo(models.Image, { as: "ProfilePicture", constraints: false }),
  //     User.hasMany(models.Post, {
  //       onDelete: "cascade",
  //     });
  //   User.hasMany(models.Following, {
  //     onDelete: "cascade",
  //   });
  // };

  // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  User.addHook("beforeCreate", function (user) {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  });
  return User;
};
