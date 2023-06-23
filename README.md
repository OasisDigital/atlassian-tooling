# Angular Atlassian Integration Tools

## TODO List:

TODO:: We have installation working. We want to:

- Get CORS error fixed
- get ace working in the TS
- Make sure we can call various JIRA APIs that require authentication from inside the TS
  - Currently having a CORS issue with direct access of API via URL
- Clean up all of the extra to get to an MVP so we can build a generator
- Any other QoL code we may want to add, such as error handling and verbose logging

## Sample Express

Express app

## aait-web-app

Angular app

## Deployment Steps

Run server locally
Start up ngrok `ngrok http 4200`
Update atlassian-connect.json with ngrok URL

- TODO:: Be able to have this auto update
  Upload atlassian-connect.json to install the app: `https://oasis-expium-aait.atlassian.net/`

# Build

## Build server first

`nx build connect-express-app`

## Build angular app after so that it deploys into the express-sample/public directory

`nx build aait-web-app`

## OR

`npm run build`

---

connect-express-app
npx nx serve connect-express-app
