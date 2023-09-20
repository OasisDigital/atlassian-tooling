import { ExecutorContext, logger } from '@nx/devkit';

import { LintExecutorSchema } from './schema';

import { execSync } from 'child_process';
import { join } from 'path/posix';

export default async function runLintExecutor(
  options: LintExecutorSchema,
  context: ExecutorContext
) {
  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = join(projectConfig.root, '.forge');

  const deployOptions: string[] = [];
  if (options.environment) {
    deployOptions.push(`--environment=${options.environment}`);
  }
  if (options.fix) {
    deployOptions.push(`--fix`);
  }
  if (options.help) {
    deployOptions.push(`--help`);
  }
  if (options.verbose) {
    deployOptions.push(`--verbose`);
  }

  try {
    execSync(`npx forge lint ${deployOptions.join(' ')}`, {
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
