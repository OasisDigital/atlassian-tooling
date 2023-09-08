import { ExecutorContext, readJsonFile, writeJsonFile } from '@nx/devkit';

import { loadEnvVars } from './environment-vars';

import { join } from 'path/posix';

export async function generateAtlassianConnectJson(
  context: ExecutorContext,
  ngrokUrl?: string
) {
  const projectRoot =
    context.projectsConfigurations.projects[context.projectName].root;
  try {
    const envConfig = await loadEnvVars(
      join(projectRoot, '.env.atlassian-connect')
    );
    const atlassianConnectTemplate = readJsonFile(
      join(projectRoot, 'atlassian-connect.template.json')
    );

    const atlassianConnectFinal = {
      ...atlassianConnectTemplate,
      name: envConfig.TEMPLATE_NAME,
      description: envConfig.TEMPLATE_DESCRIPTION,
      key: envConfig.TEMPLATE_KEY,
      baseUrl: ngrokUrl ? ngrokUrl : envConfig.TEMPLATE_BASE_URL,
    };

    writeJsonFile(
      join(projectRoot, 'src', 'assets', 'atlassian-connect.json'),
      atlassianConnectFinal
    );
  } catch {
    console.error(
      `Could not find \`.env.atlassian-connect\` for project: ${context.projectName}`
    );
    process.exit(1);
  }
}
