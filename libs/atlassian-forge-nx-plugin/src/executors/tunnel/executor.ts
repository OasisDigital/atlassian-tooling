import { ExecutorContext, logger, runExecutor } from '@nx/devkit';

import { TunnelExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { join } from 'path/posix';

export default async function runTunnelExecutor(
  options: TunnelExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];

  const buildWatchResult = await runExecutor(
    {
      project: context.projectName,
      target: 'build',
      configuration: options.buildConfig,
    },
    {
      watch: true,
    },
    context
  );

  let buildWatchResponseCount = 0;

  for await (const buildWatchResponse of buildWatchResult) {
    if (!buildWatchResponse.success) {
      return buildWatchResponse;
    }

    buildWatchResponseCount++;
    if (buildWatchResponseCount === 1) {
      const workingDirectory = join(projectConfig.root, '.forge');

      const tunnelOptions: string[] = [];
      if (options.environment) {
        tunnelOptions.push(`--environment=${options.environment}`);
      }
      if (options.debug) {
        tunnelOptions.push(`--debug`);
      }
      if (options.help) {
        tunnelOptions.push(`--help`);
      }
      if (options.verbose) {
        tunnelOptions.push(`--verbose`);
      }

      try {
        execSync(`npx forge tunnel ${tunnelOptions.join(' ')}`, {
          cwd: workingDirectory,
          stdio: 'inherit',
        });
      } catch (err) {
        logger.error(err);
        return {
          success: false,
        };
      }
    }
  }

  return {
    success: true,
  };
}
