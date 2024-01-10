import { ExecutorContext, logger, runExecutor } from '@nx/devkit';

import { DeployExecutorSchema } from './schema';

import { execSync } from 'child_process';

export default async function runDeployExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext
) {
  if (options.buildTarget) {
    const res = await buildTargetApp(options.buildTarget, context);
    if (!res.success) {
      return res;
    }
  } else if (options.buildTargets) {
    for (const buildTarget of options.buildTargets) {
      const res = await buildTargetApp(buildTarget, context);
      if (!res.success) {
        return res;
      }
    }
  } else {
    let errorMessage = `No \`buildTarget(s)\` found for project ${context.projectName}`;
    if (context.targetName) {
      errorMessage += ` with target ${context.targetName}`;
    }
    if (context.configurationName) {
      errorMessage += ` using configuration ${context.configurationName}`;
    }
    logger.error(errorMessage);
  }

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
  const workingDirectory = projectConfig.root;

  try {
    const command =
      deployOptions.length > 0
        ? `npx forge deploy ${deployOptions.join(' ')}`
        : 'npx forge deploy';
    execSync(command, {
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

async function buildTargetApp(buildTarget: string, context: ExecutorContext) {
  const [project, target, configuration] = buildTarget.split(':');
  const appResult = await runExecutor(
    {
      project,
      target,
      configuration,
    },
    {},
    context
  );

  for await (const res of appResult) {
    if (!res.success) return res;
  }
  return { success: true };
}
