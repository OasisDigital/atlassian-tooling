import { ExecutorContext, logger, runExecutor } from '@nx/devkit';

import { DeployExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { join } from 'path/posix';

export default async function runDeployExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext
) {
  const appResult = await runExecutor(
    {
      project: context.projectName,
      target: 'build',
      configuration: options.buildConfig,
    },
    {},
    context
  );

  for await (const res of appResult) {
    if (!res.success) return res;
  }

  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = join(projectConfig.root, '.forge');

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

  try {
    execSync(`npx forge deploy ${deployOptions.join(' ')}`, {
      cwd: workingDirectory,
      stdio: 'inherit',
    });
  } catch (err) {
    logger.error(err);
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
}
