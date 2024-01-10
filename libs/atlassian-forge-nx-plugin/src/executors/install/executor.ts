import { ExecutorContext, logger } from '@nx/devkit';

import { InstallExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { normalize } from 'path/posix';

export default async function runInstallExecutor(
  options: InstallExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = normalize(projectConfig.root);

  const deployOptions: string[] = [];
  if (options.environment) {
    deployOptions.push(`--environment=${options.environment}`);
  }
  if (options.site) {
    deployOptions.push(`--site=${options.site}`);
  }
  if (options.product) {
    deployOptions.push(`--product=${options.product}`);
  }
  if (options.upgrade) {
    deployOptions.push(`--upgrade`);
  }
  if (options.confirmScopes) {
    deployOptions.push(`--confirm-scopes`);
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
    execSync(`npx forge install ${deployOptions.join(' ')}`, {
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
