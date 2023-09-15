import {
  formatFiles,
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { join } from 'path/posix';
import { parse } from 'node-html-parser';

import { ConnectMigrationGeneratorSchema } from './schema';
import initGenerator from '../init/generator';
import appGenerator from '../app/generator';

export async function connectMigrationGenerator(
  tree: Tree,
  options: ConnectMigrationGeneratorSchema
) {
  /* Perform migration steps
    - Adjust build output to point to app's dist again (instead of connect server)
    - Remove connect <script> from index.html
    - Remove the `provideAp` usage in `app.config.ts`
  */
  const projectConfig = readProjectConfiguration(tree, options.project);

  const indexHTMLFilePath = join(projectConfig.sourceRoot, 'index.html');
  const indexHTMLContent = tree.read(indexHTMLFilePath).toString();

  const parsedHTML = parse(indexHTMLContent);
  const scriptElements = parsedHTML.getElementsByTagName('script');
  const connectScriptElement = scriptElements.find((scriptElement) =>
    scriptElement.rawAttrs.includes('https://connect-cdn.atl-paas.net/all.js')
  );
  if (connectScriptElement) {
    connectScriptElement.remove();
    tree.write(indexHTMLFilePath, parsedHTML.toString());
  } else {
    logger.warn('Unable to find connect script `index.html`...Skipping...');
  }

  if (projectConfig.targets?.['build']?.executor?.includes('angular')) {
    projectConfig.targets['build'].options.outputPath = join(
      'dist',
      projectConfig.root
    );
  } else {
    logger.error(
      "Unsupported application type...\r\nYou will need to manually update your `manifest.yml` with the application's dist path for the `main` resource"
    );
  }

  if (projectConfig.targets?.['connect-build']) {
    delete projectConfig.targets['connect-build'];
  } else {
    logger.warn('Could not find `connect-build` target, skipping removal...');
  }

  if (projectConfig.targets?.['connect-serve']) {
    delete projectConfig.targets['connect-serve'];
  } else {
    logger.warn('Could not find `connect-serve` target, skipping removal...');
  }

  updateProjectConfiguration(tree, options.project, projectConfig);

  const appConfigFilePath = join(
    projectConfig.sourceRoot,
    'app',
    'app.config.ts'
  );
  const appConfigContents = tree.read(appConfigFilePath).toString();
  let newAppConfigContents = appConfigContents
    .split('\r\n')
    .filter((line) => !line.includes('@oasisdigital/atlassian-connect-angular'))
    .join('\r\n');

  newAppConfigContents = newAppConfigContents.replace(
    new RegExp(/provideAp\(\)(,\s)?/),
    ''
  );

  tree.write(appConfigFilePath, newAppConfigContents);

  (await initGenerator(tree))();

  await appGenerator(tree, options);

  await formatFiles(tree);
}

export default connectMigrationGenerator;
