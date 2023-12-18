// Requiring our models and passport as we've configured it
var db = require("../models");
var passport = require("../config/passport");
var bcrypt = require("bcrypt-nodejs");
const bodyParser = require('body-parser');

let jsonParser = bodyParser.json()

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), function (req, res) {
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    // res.json("/members");
    console.log("login HIT!")
    const userInfo = {
      // email: req.user.email,
      id: req.user.id,
    };
    console.log("USER INFO: ", userInfo);
    res.send(userInfo);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", jsonParser, function (req, res) {
    console.log("HI THERE! ", req.body);
    db.User.create({
      email: req.body.email,
      password: req.body.password,
    })
      .then(function (dbUser) {
        // console.log("Redirecting:", dbUser)
        res.redirect(307, "/api/login", dbUser);
        // res.json(dbUser)
      })
      .catch(function (err) {
        console.log(err);
        res.json(err);
        // res.status(422).json(err.errors[0].message);
      });
  });

  // Route for logging user out
  app.get("/api/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", function (req, res) {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      db.Image.findOne({
        where: {
          id: req.user.ProfilePictureId,
        },
      }).then((dbImage) => {
        res.json({
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          image: req.user.ProfilePicture,
          // ImageId: req.user.ImageId
          image: dbImage,
        });

        // })
      });
    }
  });
  // });


};
