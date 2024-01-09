import { ExecutorContext, logger, runExecutor } from '@nx/devkit';
import { FSWatcher, watch } from 'chokidar';

import { DeployWatchExecutorSchema } from './schema';

import { ChildProcess, exec } from 'child_process';
import { join } from 'path/posix';

export default async function runDeployWatchExecutor(
  options: DeployWatchExecutorSchema,
  context: ExecutorContext
) {
  const deployOptions: string[] = [];
  if (options.environment) {
    deployOptions.push(`--environment=${options.environment}`);
  }
  if (options.noVerify) {
    deployOptions.push(`--no-verify`);
  }
  if (options.nonInteractive) {
    deployOptions.push(`--non-interactive`);
  }
  if (options.help) {
    deployOptions.push(`--help`);
  }
  if (options.verbose) {
    deployOptions.push(`--verbose`);
  }

  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = join(projectConfig.root, '.forge');

  const appResult = await runExecutor(
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

  let forgeDeployProcess: ChildProcess | undefined;
  let appChangesTimeout: NodeJS.Timeout | undefined;
  let forgeChangesTimeout: NodeJS.Timeout | undefined;
  let changesWatch: FSWatcher | undefined;

  for await (const res of appResult) {
    if (!res.success) {
      return res;
    } else {
      if (appChangesTimeout) {
        clearTimeout(appChangesTimeout);
      }
      appChangesTimeout = setTimeout(() => {
        if (changesWatch) {
          changesWatch.close();
        }
        let isInitial = true;
        changesWatch = watch(workingDirectory, {}).on('all', () => {
          if (forgeChangesTimeout) {
            clearTimeout(forgeChangesTimeout);
          }
          forgeChangesTimeout = setTimeout(() => {
            if (isInitial) {
              isInitial = false;
            } else {
              logger.info('Change detected in `.forge` directory...');
            }
            try {
              if (forgeDeployProcess && forgeDeployProcess.exitCode === null) {
                forgeDeployProcess.kill();
              }
              const command =
                deployOptions.length > 0
                  ? `npx forge deploy ${deployOptions.join(' ')}`
                  : 'npx forge deploy';
              forgeDeployProcess = exec(command, {
                cwd: workingDirectory,
                // stdio: 'inherit',
              });
              forgeDeployProcess.stdout.pipe(process.stdout);
            } catch (err) {
              logger.error(err);
              return {
                success: false,
              };
            }
          }, 1000);
        });
      }, 1000);
    }
  }
}
