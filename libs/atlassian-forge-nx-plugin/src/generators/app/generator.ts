import {
  formatFiles,
  logger,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { join, relative } from 'path/posix';

import { execSync } from 'child_process';

import { AppGeneratorSchema } from './schema';
import initGenerator from '../init/generator';
import { readYamlFile } from 'nx/src/utils/fileutils';
import { dump as parseToYaml } from 'js-yaml';
import { forgeLogin } from '../util/forge-account';

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  (await initGenerator(tree))();

  const result = forgeLogin();

  if (!result) {
    logger.info('Already logged into forge cli, skipping...');
  }

  const projectConfig = readProjectConfiguration(tree, options.project);
  const directory = join(projectConfig.root, '.forge');

  execSync(`forge create --directory=${directory}`, { stdio: 'inherit' });

  tree.delete(join(directory, 'node_modules'));
  tree.delete(join(directory, 'static'));
  tree.delete(join(directory, '.gitignore'));
  tree.delete(join(directory, 'package.json'));
  tree.delete(join(directory, 'package-lock.json'));
  tree.delete(join(directory, 'README.md'));

  const manifestFilePath = join(directory, 'manifest.yml');
  const manifestContents = readYamlFile(manifestFilePath);

  if (manifestContents?.resources[0]?.key === 'main') {
    let distPath: string | undefined;

    if (projectConfig.targets?.['build']?.executor?.includes('angular')) {
      distPath = relative(
        directory,
        projectConfig.targets['build'].options.outputPath
      );
    } else {
      logger.error(
        "Unsupported application type...\r\nYou will need to manually update your `manifest.yml` with the application's dist path for the `main` resource"
      );
    }

    if (distPath) {
      manifestContents.resources[0].path = distPath;
      tree.write(manifestFilePath, parseToYaml(manifestContents));
    }
  }

  await formatFiles(tree);
}

export default appGenerator;
