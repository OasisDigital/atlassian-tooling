import { ExecutorContext, runExecutor } from '@nx/devkit';
import { green } from 'chalk';

import { generateAtlassianConnectJson } from '../util/atlassian-connect';
import { loadEnvVars } from '../util/environment-vars';
import { setupNgrok } from '../util/ngrok';

import { ServeExecutorSchema } from './schema';

import { join } from 'path/posix';

export default async function runServeExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  // Create tunnel for express server
  // TODO: Pull the express server port from the config somehow
  const ngrokUrl = await setupNgrok(3333);

  // Create atlassian-connect.json from template & env values
  /*
    TODO:
      Rewrite this chunk to be a standalone executor that can "watch"
      the inputs files and recreate the `atlassian-connect.json` if they change
  */
  await generateAtlassianConnectJson(context, ngrokUrl);

  const expressProjectRoot =
    context.projectsConfigurations.projects[options.serverAppName].root;
  await loadEnvVars(join(expressProjectRoot, '.env.serve'));

  const serverResult = await runExecutor(
    {
      project: options.serverAppName,
      target: 'serve',
    },
    {},
    context
  );

  let serverResultCount = 0;
  /*
    TODO:
      Rewrite this mess of synchronous promise code to be an observable
      that only has 1 potential output of a { success: false } response from one
      of the internal executor processes. We could then await this observable (firstValueFrom)
      and return the error response.
  */
  for await (const serverResponse of serverResult) {
    serverResultCount++;
    if (serverResultCount === 1) {
      const appResult = await runExecutor(
        {
          project: context.projectName,
          target: 'serve',
        },
        {},
        context
      );

      let appResultCount = 0;
      for await (const appResponse of appResult) {
        appResultCount++;
        if (appResultCount === 1) {
          console.log(
            green(
              `\r\nSuccessfully created ngrok tunnel at: ${ngrokUrl}\r\nInstall your app using: ${ngrokUrl}/install`
            )
          );
          if (!appResponse.success) {
            return appResponse;
          }
        }
      }
    }

    if (!serverResponse.success) {
      return serverResponse;
    }
  }
}
