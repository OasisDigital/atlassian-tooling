/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
//import cors from 'cors';

import { EventEmitter } from 'events';
import * as path from 'path';

// atlassian-connect-express also provides a middleware
// import ace = require('atlassian-connect-express');
// ace.

const app = express();

// var corsOptions = {
//   origin: 'https://oasis-expium-aait.atlassian.net',
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
//
// app.use(cors());

app.get('/', (_req, res) =>
  res.sendFile(path.join(__dirname, 'assets', 'atlassian-connect.json')),
);

if (process.env.DEV_MODE) {
  app.use(
    '/public',
    createProxyMiddleware({ target: 'http://localhost:4200' }),
  );
} else {
  app.use('/public', express.static(path.join(__dirname, 'public')));
}

//create EventEmitter to findout when app is installed
const em = new EventEmitter();

app.use(
  '/installed',
  (request: any, response: express.Response, next: express.NextFunction) => {
    // console.log('request', request);
    // const host = request.baseUrl;

    console.log('INSTALLING HOST');
    // if (isConfiguredHost(host)) {
    // allows cron jobs to be scheduled once installed in jira
    em.emit('FirstEvent', 'App Installed into Jira');

    // JIRA expects some sort of response body in the /installed process
    response.send({ message: 'Welcome to installed!' });

    next();
    // } else {
    //   const msg = `The originating JIRA Host '${host}' is not authorized for this addon`;
    //   console.log(msg);
    //   logHosts();
    //   response.status(403).send(msg);
    // }
  },
);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
