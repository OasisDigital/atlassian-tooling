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

  const lintOptions: string[] = [];
  if (options.environment) {
    lintOptions.push(`--environment=${options.environment}`);
  }
  if (options.fix) {
    lintOptions.push(`--fix`);
  }
  if (options.help) {
    lintOptions.push(`--help`);
  }
  if (options.verbose) {
    lintOptions.push(`--verbose`);
  }

  try {
    execSync(`npx forge lint ${lintOptions.join(' ')}`, {
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
