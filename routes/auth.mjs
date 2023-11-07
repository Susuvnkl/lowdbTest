import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import db from "../db.mjs";
import lowdb from "../lowdb.mjs";

const router = express.Router();

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    const user = lowdb.data.users.find((u) => u.username === username);
    console.log("test user:", user);

    if (!user) {
      console.log("test11");

      return cb(null);
    }
    const saltBuffer = Buffer.from(user.salt.data);
    const hashed_passwordBuffer = Buffer.from(user.hashed_password.data);
    crypto.pbkdf2(password, saltBuffer, 310000, 32, "sha256", (err, hashedPassword) => {
      console.log("test1124");
      if (err) {
        return cb(err);
      }
      if (!crypto.timingSafeEqual(hashed_passwordBuffer, hashedPassword)) {
        return cb(null, false, { message: "Incorrect username or password." });
      }
      return cb(null, user);
    });
    ////

    // db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    //   if (err) {
    //     return cb(err);
    //   }
    //   if (!row) {
    //     return cb(null, false, { message: "Incorrect username or password." });
    //   }
    //   console.log(row);
    //   crypto.pbkdf2(password, row.salt, 310000, 32, "sha256", (err, hashedPassword) => {
    //     if (err) {
    //       return cb(err);
    //     }
    //     if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
    //       return cb(null, false, { message: "Incorrect username or password." });
    //     }
    //     return cb(null, row);
    //   });
    // });
  })
);

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

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, "sha256", async (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    // db.run(
    //   "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)",
    //   [req.body.username, hashedPassword, salt],
    //   function (err) {
    //     if (err) {
    //       return next(err);
    //     }
    //     const user = {
    //       id: this.lastID,
    //       username: req.body.username,
    //     };
    //     req.login(user, function (err) {
    //       if (err) {
    //         return next(err);
    //       }
    //       res.redirect("/");
    //     });
    //   }
    // );
    try {
      lowdb.data.users.push({
        id: lowdb.data.users.length,
        username: req.body.username,
        hashed_password: hashedPassword,
        salt: salt,
      });
      await lowdb.write();
      const user = {
        id: lowdb.data.users.length,
        username: req.body.username,
      };
      req.login(user, function (err) {
        console.log("test");
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
      // res.redirect("/");
    } catch (error) {
      console.error("Error creating/updating the database:", error);
      res.status(500).send("Error creating/updating the database");
    }
  });
});

export default router;
