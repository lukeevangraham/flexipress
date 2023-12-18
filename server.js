require('dotenv').config()
const express = require("express");
const session = require("express-session")
const passport = require("./config/passport")
const db = require("./models")
const path = require("path");
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const app = express();

console.log("HERE: ", process.env.PASSPORT_SECRET)

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// So the server can process request bodies!!
let jsonParser = bodyParser.json()

let urlencodedParser = bodyParser.urlencoded({ extended: false })

// We need to use sessions to keep track of our user's login status
app.use(
  session({ secret: process.env.PASSPORT_SECRET, resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());


require("./routes/auth-routes")(app)

// Send every request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// app.listen(PORT, () => {
//   console.log(`🌎 ==> API server now on port ${PORT}!`);
// });

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
      console.log("listening on port %s", PORT)
  })
})