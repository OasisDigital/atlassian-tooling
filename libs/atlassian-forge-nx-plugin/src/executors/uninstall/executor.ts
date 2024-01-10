import { ExecutorContext, logger } from '@nx/devkit';

import { UninstallExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { normalize } from 'path/posix';

export default async function runUninstallExecutor(
  options: UninstallExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = normalize(projectConfig.root);

  const deployOptions: string[] = [];
  if (options.installationId) {
    deployOptions.push(options.installationId);
  }
  if (options.help) {
    deployOptions.push(`--help`);
  }
  if (options.verbose) {
    deployOptions.push(`--verbose`);
  }

  try {
    execSync(`npx forge uninstall ${deployOptions.join(' ')}`, {
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
