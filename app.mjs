// Import the required modules
import "dotenv/config";
import createError from "http-errors";
import express from "express";
import { fileURLToPath } from "url"; // Import the 'fileURLToPath' function
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import passport from "passport";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
// import SQLiteStore from "express-session-sqlite";
import indexRouter from "./routes/index.mjs";
import authRouter from "./routes/auth.mjs";
import testRouter from "./routes/lowdbtest.mjs";
import pluralize from "pluralize";
const SQLiteStore = SQLiteStoreFactory(session);
const app = express();

app.locals.pluralize = pluralize;
// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the absolute path to the views and public directories
const viewsPath = path.join(__dirname, "views");
const publicPath = path.join(__dirname, "public");
// view engine setup
app.set("views", viewsPath);

app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(import.meta.url, "public")));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);

// Configure Passport and its strategies as needed

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/", testRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
