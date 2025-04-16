require("dotenv").config();
const express = require("express");
const path = require("node:path");
const pool = require("./db/pool");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];

    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post(
  "/sign-up",
  body("confirm")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match!"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up-form", { errors: errors.array() });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        "insert into users (username, password) values ($1, $2)",
        [req.body.username, hashedPassword]
      );
      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/become-a-member", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.render("become-member", { user: req.user });
});

app.post("/become-a-member", async (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
  }
  try {
    const userCode = req.body.code;
    if (userCode == process.env.MEMBER_CODE) {
      console.log("successfully became a member!");
      await pool.query("UPDATE users SET membership = true WHERE id = ($1)", [
        req.user.id,
      ]);

      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        req.user.id,
      ]);
      const updatedUser = result.rows[0];

      req.login(updatedUser, (err) => {
        if (err) {
          return next(err);
        }
      });
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get("/become-an-admin", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.render("become-admin", { user: req.user });
});

app.post("/become-an-admin", async (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
  }
  try {
    const userCode = req.body.code;
    if (userCode == process.env.ADMIN_CODE) {
      console.log("successfully became an admin!");
      await pool.query("UPDATE users SET admin = true WHERE id = ($1)", [
        req.user.id,
      ]);
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        req.user.id,
      ]);
      const updatedUser = result.rows[0];

      req.login(updatedUser, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get("/create-message", (req, res) => {
  if (!req.user) {
    res.redirect("/");
  }
  res.render("create-message", { user: req.user });
});

app.post("/create-message", async (req, res, next) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }
  try {
    await pool.query("INSERT INTO messages (author_id, message) VALUES ($1, $2)", [
      req.user.id,
      req.body.message,
    ]);
    console.log("Successfully created new message!");
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get("/", async (req, res) => {
  let messages;
  if (req.user && (req.user.membership || req.user.admin)) {
    messages = await pool.query("SELECT messages.*, users.username FROM messages JOIN users ON messages.author_id = users.id");
  } else {
    messages = await pool.query("SELECT message FROM messages");
  }
  res.render("index", { user: req.user, messages: messages.rows });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

app.all("*", (req, res) => {
  res.status(404).send("<h1>404! Page not found</h1>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Clubhouse App - listening on port ${PORT}!`);
});
