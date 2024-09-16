require("dotenv/config");
const express = require("express");
const session = require("express-session");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("./config/passport");
const db = require("./models");
const path = require("path");
var morgan = require("morgan");
const multer = require("multer");
const cloudinary = require("cloudinary");

// app.use(cors())

// Enable CORS
// NEW METHOD
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://flexipress.grahamwebworks.com",
      "http://flexipress.grahamwebworks.com",
    ],
  })
);

// OLD METHOD
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,HEAD,OPTIONS,POST,PUT,DELETE"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   next();
// });

app.use(morgan("tiny"));

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

app.use(bodyParser.json());

// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json({ limit: "50mb" }));

// We need to use sessions to keep track of our user's login status
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.session());
app.use(passport.initialize());

// // IMAGE UPLOAD CONFIGURATION

const storage = multer.diskStorage({
  filename: (req, file, callback) =>
    callback(null, Date.now() + file.originalname),
});
const imageFilter = (req, file, cb) => {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are accepted!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({
  cloud_name: "dzekujbym",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

require("./routes/auth-routes")(app);
require("./routes/event-routes")(app, cloudinary, upload);
require("./routes/image-api-routes")(app);

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// require("./routes/api-routes")(app);
// require("./routes/image-api-routes")(app, cloudinary, upload);
// require("./routes/post-api-routes")(app);
// require("./routes/user-api-routes")(app);
// require("./routes/following-routes")(app);

// Send every request to the React app
// Define any API routes before this runs
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

db.sequelize.sync().then(() => {
  app.listen(PORT, function () {
    console.log(`🌎 ==> API server now on port ${PORT}!`);
  });
});
