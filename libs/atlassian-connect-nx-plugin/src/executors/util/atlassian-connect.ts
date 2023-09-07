import { ExecutorContext, readJsonFile, writeJsonFile } from '@nx/devkit';

import { loadEnvVars } from './environment-vars';

import { join } from 'path/posix';

export async function generateAtlassianConnectJson(
  context: ExecutorContext,
  ngrokUrl?: string,
) {
  try {
    const envConfig = await loadEnvVars(
      join('apps', context.projectName, '.env.atlassian-connect'),
    );
    const atlassianConnectTemplate = readJsonFile(
      join('apps', context.projectName, 'atlassian-connect.template.json'),
    );

    const atlassianConnectFinal = {
      ...atlassianConnectTemplate,
      name: envConfig.TEMPLATE_NAME,
      description: envConfig.TEMPLATE_DESCRIPTION,
      key: envConfig.TEMPLATE_KEY,
      baseUrl: ngrokUrl ? ngrokUrl : envConfig.TEMPLATE_BASE_URL,
    };

    writeJsonFile(
      join(
        'apps',
        context.projectName,
        'src',
        'assets',
        'atlassian-connect.json',
      ),
      atlassianConnectFinal,
    );
  } catch {
    console.error(
      `Could not find \`.env.atlassian-connect\` for project: ${context.projectName}`,
    );
    process.exit(1);
  }
}
