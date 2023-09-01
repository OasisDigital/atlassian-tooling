import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { EventEmitter } from 'events';
import * as path from 'path';

const app = express();

//create EventEmitter to findout when app is installed
const em = new EventEmitter();

app.use(
  '/installed',
  (_request: any, response: express.Response, next: express.NextFunction) => {
    console.log('INSTALLING HOST');
    em.emit('FirstEvent', 'App Installed into Jira');

    // JIRA expects some sort of response body in the /installed process
    response.send({ message: 'Welcome to installed!' });

    next();
  },
);

if (process.env.DEV_MODE) {
  console.log('DEV MODE');
  app.use(
    '/install',
    createProxyMiddleware({
      target: 'http://localhost:4200/assets/atlassian-connect.json',
      pathRewrite: { '^/install': '' },
    }),
  );
  app.use('/', createProxyMiddleware({ target: 'http://localhost:4200' }));
} else {
  console.log('PRODUCTION MODE');
  app.use('/install', (_request, response) => {
    response.sendFile(
      path.join(__dirname, 'public/assets/atlassian-connect.json'),
    );
  });
  app.use('/', express.static(path.join(__dirname, 'public')));
}

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
