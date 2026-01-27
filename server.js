const slugify = require("slugify");
require("dotenv/config");
const express = require("express");
const session = require("express-session");
const PORT = process.env.PORT || 3001;
const app = express();
app.set("trust proxy", 1); // Add this line right here!
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("./config/passport");
const db = require("./models");
const path = require("path");
var morgan = require("morgan");
const multer = require("multer");
const cloudinary = require("cloudinary");

const allowedOrigins = [
  "https://flexipress.grahamwebworks.com",
  "http://flexipress.grahamwebworks.com",
  "https://fpserver.grahamwebworks.com",
  "http://localhost:3000", // Always keep this for local testing!
];

const isProd = process.env.NODE_ENV === "production";

// if (!isProd) {
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// }

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));
}

// app.use(cors())

// Enable CORS
// NEW METHOD
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "https://localhost:3000",
//       "http://localhost:5959",
//       "https://flexipress.grahamwebworks.com",
//       "http://flexipress.grahamwebworks.com",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });

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
  }),
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
    proxy: isProd, // Only true in production behind Nginx
    cookie: {
      secure: isProd, // Only requires HTTPS in production
      sameSite: isProd ? "none" : "lax", // 'none' for cross-domain prod, 'lax' for local
      maxAge: 1000 * 60 * 60 * 24, // Recommended: 24-hour session
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

require("./routes/auth-routes")(app);
require("./routes/event-routes")(app, cloudinary, upload);
require("./routes/volunteer-routes")(app, cloudinary, upload);
require("./routes/article-routes")(app, cloudinary, upload);
require("./routes/image-api-routes")(app);
require("./routes/singles-routes")(app);
require("./routes/ministry-routes")(app);

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

db.sequelize.sync().then(async () => {
  console.log("Database synced.");

  app.listen(PORT, function () {
    console.log(`🌎 ==> API server now on port ${PORT}!`);
  });
});
