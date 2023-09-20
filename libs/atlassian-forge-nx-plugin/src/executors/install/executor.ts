import { ExecutorContext, logger } from '@nx/devkit';

import { InstallExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { join } from 'path/posix';

export default async function runInstallExecutor(
  options: InstallExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = join(projectConfig.root, '.forge');

  const installOptions: string[] = [];
  if (options.environment) {
    installOptions.push(`--environment=${options.environment}`);
  }
  if (options.site) {
    installOptions.push(`--site=${options.site}`);
  }
  if (options.product) {
    installOptions.push(`--product=${options.product}`);
  }
  if (options.upgrade) {
    installOptions.push(`--upgrade`);
  }
  if (options.confirmScopes) {
    installOptions.push(`--confirm-scopes`);
  }
  if (options.nonInteractive) {
    installOptions.push(`--non-interactive`);
  }
  if (options.help) {
    installOptions.push(`--help`);
  }
  if (options.verbose) {
    installOptions.push(`--verbose`);
  }

  try {
    execSync(`npx forge install ${installOptions.join(' ')}`, {
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
