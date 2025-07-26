# OAuth with Node.js & Express.js - Simple Guide

## What is OAuth?

OAuth 2.0 lets users login to your app using their Google/Facebook/GitHub accounts without sharing passwords.

**Flow:** User clicks "Login with Google" → Google asks permission → User approves → Your app gets user info

## Quick Setup

```bash
npm init -y
npm install express passport passport-google-oauth20 express-session dotenv
```

## Environment Variables (.env)

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=random-secret-key
```

## Complete Working Example

### 1. Main App (app.js)

```javascript
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const app = express();

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Create user object
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      return done(null, user);
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get("/", (req, res) => {
  if (req.user) {
    res.send(`<h1>Hello ${req.user.name}!</h1><a href="/logout">Logout</a>`);
  } else {
    res.send('<h1>Login</h1><a href="/auth/google">Login with Google</a>');
  }
});

// Start Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

## Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Secret to `.env` file

## Protect Routes

```javascript
// Middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/");
  }
}

// Protected route
app.get("/dashboard", requireAuth, (req, res) => {
  res.send(`<h1>Dashboard</h1><p>Welcome ${req.user.name}!</p>`);
});
```

## Manual OAuth (Without Passport)

```javascript
const express = require("express");
const axios = require("axios");
const app = express();

// Step 1: Redirect to Google
app.get("/auth/google", (req, res) => {
  const authURL =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=http://localhost:3000/callback&` +
    `response_type=code&` +
    `scope=profile email`;

  res.redirect(authURL);
});

// Step 2: Handle callback
app.get("/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/callback",
    });

    const { access_token } = tokenRes.data;

    // Get user info
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // Save user to session
    req.session.user = userRes.data;
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Login failed");
  }
});
```

## Other Providers

### GitHub

```javascript
// Replace Google strategy with:
const GitHubStrategy = require("passport-github2").Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
```

### Facebook

```javascript
// Replace Google strategy with:
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
```

## Security Tips

- Use HTTPS in production
- Add state parameter to prevent CSRF
- Store tokens securely (database, not session)
- Validate redirect URIs

## Quick Test

1. Create `.env` file with Google credentials
2. Run `node app.js`
3. Visit `http://localhost:3000`
4. Click "Login with Google"
5. Approve permissions
6. You're logged in!

That's it! You now have working OAuth authentication.
