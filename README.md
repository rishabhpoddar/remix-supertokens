# Remix and SuperTokens integration example!

## How it works:
- We have setup an express server in `server.js` which serves the remix app.
- The express server also contains the `supertokens-node` setup. It initialises the emailpassword and session recipe. It also adds the supertokens middleware and `errorHandler` to the express app.
- We have created a login screen on `/app/routes/auth/index.tsx` which sends a FORM POST request to the `/login` route.
- The `/login` `action` function in `/app/routes/login.tsx`, extracts the form data and sends a request to itself (the express server) to call the supertokens sign in API. This API is handled by the supertokens middleware we added in server.js file. If the response is OK, then we forward the response cookies to the browser which saves them (containing the access and refresh tokens).
- When the user navigates to the `/` route on the browser, the access token is sent along with the request and we call `session.getSession` in server.js file to verify the token. We also pass in the `sessionRequired: false` so that in case the access token is not in the request (the user is logged out, the function will return `undefined`).
- If the `getSession` function succeeds, we will get the user ID and pass it to the remix app in the context which can be consumed by our routes (as seen in `/app/routes/auth/index.tsx`).
- In case the access token has expired, the `getSession` function will throw an error where `err.type === "TRY_REFRESH_TOKEN"`. In this case, we will redirect the user to the `/api/auth/session/refresh` route for session refreshing.
- When the browser calls the `/api/auth/session/refresh`, it also adds the refresh token in the request. We detect this route being called in `server.js` and call the `session.refreshSession` function which creates new session tokens and attaches it to the response. We then redirect the user back to the home page.
- The sign out button on the home page (which is shown if the user is logged in), sends a FORM POST request to the `/signout` on which we call the `sessionContainer.revokeSession()` function which clears the session from the db and cookies, thereby logging out the user.

## Development

Start the Remix development asset server and the Express server by running:

```sh
npm run dev
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying express applications you should be right at home just make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
