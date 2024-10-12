// Importing required modules
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import loggerM from "morgan";
import multer from "multer";

// Configuring the file upload destination
const upload = multer({ dest: "public/uploads/" });

// Load environment variables from .env file
dotenv.config();

// Setting up the port from the environment variables
const port = process.env.PORT;

// Initializing the Express app
const app = express();

// -----------------------------------
// Middlewares
// -----------------------------------

// 1) Application level middleware: Logging every request to a file
const logDir = "./server_logs.txt"; // This writes logs to the project directory

// Middleware to log requests
const logger = (req, res, next) => {
  const logMessage = `${new Date()} ---Request:[${req.method}] [${req.url}]\n`;

  // Append log message to the server_logs.txt file
  fs.appendFile(logDir, logMessage, "utf-8", (err) => {
    if (err) {
      console.error("Error writing to log file:", err.message);
    }
  });

  next();
};

app.use(logger);

// Using the logger middleware for all requests
app.use(logger);

// 2) Fake Authentication middleware
const fakeAuth = (req, res, next) => {
  const authStatus = true; // Simulating a successful authentication
  if (authStatus) {
    console.log("Authentication Successful");
    next();
  } else {
    res.statusCode = 401;
    throw new Error("Authentication Failed");
  }
};

// 3) Third-party middleware for logging HTTP requests
app.use(loggerM("dev"));

// 4) Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static/", express.static("public")); // Serve static files from "public" folder

// -----------------------------------
// Routes & Router Middleware
// -----------------------------------

const router = express.Router();

// Users route handlers
const getUsers = (req, res) => {
  res.status(200).json({ msg: "All Users" });
};

const postUsers = (req, res) => {
  console.log(req.body);
  res.status(200).json({ msg: "Create Users" });
};

const putUsers = (req, res) => {
  res.status(200).json({ msg: `Update Users Of ${req.params.id}` });
};

const deleteUsers = (req, res) => {
  res.status(200).json({ msg: `Delete Users Of ${req.params.id}` });
};

// Setting up user routes
router.route("/").get(getUsers).post(postUsers);

router.route("/:id").put(putUsers).delete(deleteUsers);

// Using the router for /api/users
app.use("/api/users", router);

// Simple product endpoint
app.get("/api/products", (req, res) => {
  res.status(200).json({ msg: "Get Products" });
});

// -----------------------------------
// Multer: File upload handling
// -----------------------------------
app.post(
  "/upload",
  upload.single("image"),
  (req, res) => {
    console.log(req.file, req.body);
    res.send(req.file);
  },
  (err, req, res, next) => {
    res.status(400).send(err.message);
  }
);

// -----------------------------------
// 404 Error handling for unknown routes
// -----------------------------------
app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route Not Found");
});

// -----------------------------------
// Error Handling Middleware
// -----------------------------------
const errorHandlingMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode || 500;

  // Custom error messages based on status code
  switch (statusCode) {
    case 401:
      res.json({ title: "Not Authorized", message: err.message });
      break;
    case 404:
      res.json({ title: "Not Found", message: err.message });
      break;
    default:
      res.json({ title: "Server Error", message: err.message });
      break;
  }
};

// Using the error handling middleware
app.use(errorHandlingMiddleware);

// -----------------------------------
// Server Setup
// -----------------------------------
app.listen(port, () => {
  console.log(`Express Server Running On port http://localhost:${port}`);
});
