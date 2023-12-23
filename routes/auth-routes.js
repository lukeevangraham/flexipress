let passport = require("passport");
let LocalStrategy = require("passport-local");
let crypto = require("crypto");
let db = require("../models");

module.exports = (app) => {
  passport.use(
    new LocalStrategy(function verify(email, password, cb) {
      db.User.findOne(
        { where: { email: email } },
        [email],
        function (err, row) {
          if (err) {
            return cb(err);
          }
          if (!row) {
            return cb(null, false, { message: "Incorrect email or password." });
          }

          crypto.pbkdf2(
            password,
            row.salt,
            310000,
            32,
            "sha256",
            function (err, hashedPassword) {
              if (err) {
                return cb(err);
              }
              if (
                !crypto.timingSafeEqual(row.hashed_password, hashedPassword)
              ) {
                return cb(null, false, {
                  message: "Incorrect email or password.",
                });
              }
              return cb(null, row);
            }
          );
        }
      );
    })
  );

  /* Configure session management.
   *
   * When a login session is established, information about the user will be
   * stored in the session.  This information is supplied by the `serializeUser`
   * function, which is yielding the user ID and username.
   *
   * As the user interacts with the app, subsequent requests will be authenticated
   * by verifying the session.  The same user information that was serialized at
   * session establishment will be restored when the session is authenticated by
   * the `deserializeUser` function.
   *
   * Since every request to the app needs the user ID and username, in order to
   * fetch todo records and render the user element in the navigation bar, that
   * information is stored in the session.
   */
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, { id: user.id, username: user.username });
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  app.post(
    "/api/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  );
};
