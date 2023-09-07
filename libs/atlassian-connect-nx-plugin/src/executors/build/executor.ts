import { ExecutorContext, runExecutor } from '@nx/devkit';

import { generateAtlassianConnectJson } from '../util/atlassian-connect';

import { BuildExecutorSchema } from './schema';

export default async function runBuildExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  await generateAtlassianConnectJson(context);

  const serverResult = await runExecutor(
    {
      project: options.serverAppName,
      target: 'build',
    },
    {},
    context
  );

  for await (const res of serverResult) {
    if (!res.success) return res;
  }

  const appResult = await runExecutor(
    {
      project: context.projectName,
      target: 'build',
    },
    {},
    context
  );

  for await (const res of appResult) {
    if (!res.success) return res;
  }

  return {
    success: true,
  };
}
