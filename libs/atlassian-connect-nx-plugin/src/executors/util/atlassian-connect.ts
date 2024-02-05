import { ExecutorContext, readJsonFile, writeJsonFile } from '@nx/devkit';

import { loadEnvVars } from './environment-vars';

import { join } from 'path/posix';

export async function generateAtlassianConnectJson(
  context: ExecutorContext,
  ngrokUrl?: string
) {
  const projectRoot =
    context.projectsConfigurations.projects[context.projectName].root;
  const envConfig = await loadEnvVars(
    join(projectRoot, '.env.atlassian-connect')
  );
  const atlassianConnectTemplate = readJsonFile(
    join(projectRoot, 'atlassian-connect.template.json')
  );

  const baseUrl = ngrokUrl ? ngrokUrl : envConfig.TEMPLATE_BASE_URL;

  if (
    envConfig.TEMPLATE_NAME === undefined ||
    envConfig.TEMPLATE_DESCRIPTION === undefined ||
    envConfig.TEMPLATE_KEY === undefined ||
    baseUrl === undefined
  ) {
    console.error(
      `Could not find \`.env.atlassian-connect\` or Node process environment variables for project: ${context.projectName}`
    );
    process.exit(1);
  } else {
    const atlassianConnectFinal = {
      ...atlassianConnectTemplate,
      name: envConfig.TEMPLATE_NAME,
      description: envConfig.TEMPLATE_DESCRIPTION,
      key: envConfig.TEMPLATE_KEY,
      baseUrl,
    };

    writeJsonFile(
      join(projectRoot, 'src', 'assets', 'atlassian-connect.json'),
      atlassianConnectFinal
    );
  }
}
