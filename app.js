const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 3000;

// EJS configuration
app.set("view engine", "ejs");

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "myStrongSecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 600000, // 10 minutes
      httpOnly: true
    }
  })
);

// -------------------------
// Part (a) - Session Management
// -------------------------

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Set session
app.get("/set-session", (req, res) => {
  req.session.username = "admin";

  if (!req.session.visitCount) {
    req.session.visitCount = 1;
  } else {
    req.session.visitCount++;
  }

  res.redirect("/dashboard");
});

// -------------------------
// Authentication Middleware
// -------------------------

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }

  res.redirect("/login");
}

// -------------------------
// Part (b) - Authentication
// -------------------------

// Login page
app.get("/login", (req, res) => {
  res.render("login", {
    error: null
  });
});

// Login processing
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials for demonstration
  if (username === "admin" && password === "1234") {
    req.session.user = {
      username: username
    };

    // Initialize visit count
    if (!req.session.visitCount) {
      req.session.visitCount = 1;
    }

    return res.redirect("/dashboard");
  }

  res.render("login", {
    error: "Invalid username or password"
  });
});

// Protected dashboard
app.get("/dashboard", isAuthenticated, (req, res) => {
  req.session.visitCount++;

  res.render("dashboard", {
    username: req.session.user.username,
    visitCount: req.session.visitCount,
    sessionId: req.sessionID
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to logout");
    }

    res.redirect("/login");
  });
});

// Destroy session for Part (a)
app.get("/destroy-session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to destroy session");
    }

    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});