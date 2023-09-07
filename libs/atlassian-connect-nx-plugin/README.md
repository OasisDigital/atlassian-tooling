# Atlassian Connect Nx Plugin

## Prerequisites

### Ngrok

To install ngrok (which we use as a tunnel for Atlassian Connect to see your localhost app) run one of the following commands:
`npm install -g ngrok`
`yarn global add ngrok`

[https://ngrok.com/docs/getting-started/#step-3-connect-your-agent-to-your-ngrok-account](Once you have installed `ngrok` globally on your device, follow "Step 3" from the `ngrok` documentation to authenticate ngrok for your device.)

> In the future we will try to incorporate this authentication into this package to avoid globally installing `ngrok`.

## Installation

Run one of the following commands in a Nx workspace:

`npm install --save-dev @oasisdigital/atlassian-connect-nx-plugin`

`yarn add --dev @oasisdigital/atlassian-connect-nx-plugin`

## Generating Your Atlassian Connect Application

Run the following command to create your own Angular + Express applications to run on Atlassian Connect:
`npx nx generate @oasisdigital/atlassian-connect-nx-plugin:app`

Once you have generated your application you will need to fill out our Atlassian environment configuration.
You can do this by copying the `.env.atlassian-connect.template` that was genereated in your Angular application and renaming it to `.env.atlassian-connect`. Make sure to fill out the env variables in this file to match your Atlassian configuration!

## Serving Your Application

Run the following command to serve your Angular + Express applications:

`npx nx connect-serve {angular-app-name}`

Replacing the `{angular-app-name}` with the name of your generated Angular application.

> This also includes a `ngrok` tunnel for your convenience.

## Building Your Application

Run the following command to build your Angular + Express applications:

`npx nx connect-build {angular-app-name}`

Replacing the `{angular-app-name}` with the name of your generated Angular application.

> The built files will be under the `dist` directory of your Express application's name.
