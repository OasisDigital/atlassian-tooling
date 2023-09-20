import { ExecutorContext, logger } from '@nx/devkit';

import { UninstallExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { join } from 'path/posix';

export default async function runUninstallExecutor(
  options: UninstallExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = join(projectConfig.root, '.forge');

  const uninstallOptions: string[] = [];
  if (options.installationId) {
    uninstallOptions.push(options.installationId);
  }
  if (options.help) {
    uninstallOptions.push(`--help`);
  }
  if (options.verbose) {
    uninstallOptions.push(`--verbose`);
  }

  try {
    execSync(`npx forge uninstall ${uninstallOptions.join(' ')}`, {
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
