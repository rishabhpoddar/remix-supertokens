const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");
const supertokens = require("supertokens-node");
const session = require("supertokens-node/recipe/session");
const emailpassword = require("supertokens-node/recipe/emailpassword");
const { middleware, errorHandler } = require("supertokens-node/framework/express");

supertokens.init({
  framework: "express",
  supertokens: {
    // https://try.supertokens.com is for demo purposes. Replace this with the address of your core instance (sign up on supertokens.com), or self host a core.
    connectionURI: "https://try.supertokens.com",
    // apiKey: <API_KEY(if configured)>,
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: "SuperTokens Demo App",
    apiDomain: "http://localhost:3000",
    websiteDomain: "http://localhost:3000",
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    emailpassword.init(), // initializes signin / sign up features
    session.init() // initializes session features
  ]
});

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

app.use(middleware());

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  async (req, res, next) => {
    purgeRequireCache();

    let userId = undefined;

    if (req.path === "/api/auth/session/refresh") {
      // we are refreshing the session
      try {
        await session.refreshSession(req, res);
        console.log("session refresh successful!")
        return res.redirect("/");
      } catch (err) {
        // user is logged out.
        return res.redirect("/auth");
      }
    } else {
      try {
        let sessionContainer = await session.getSession(req, res, {
          sessionRequired: false
        })
        if (sessionContainer !== undefined) {
          userId = sessionContainer.getUserId();
          if (req.path === "/signout") {
            await sessionContainer.revokeSession();
            return res.redirect("/auth");
          }
        }
      } catch (err) {
        if (err.type === "TRY_REFRESH_TOKEN") {
          res.redirect("/api/auth/session/refresh")
          return;
        }
        throw err;
      }
    }

    return createRequestHandler({
      build: require(BUILD_DIR),
      mode: process.env.NODE_ENV,
      getLoadContext: () => ({ userId }),
    })(req, res, next);
  }
);

app.use(errorHandler())

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
