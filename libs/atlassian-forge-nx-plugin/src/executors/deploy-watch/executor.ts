import { ExecutorContext, logger, runExecutor } from '@nx/devkit';

import { DeployWatchExecutorSchema } from './schema';

import { ChildProcess, exec, execSync } from 'child_process';
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
  for await (const res of appResult) {
    if (!res.success) {
      return res;
    } else {
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
    }
  }
}
