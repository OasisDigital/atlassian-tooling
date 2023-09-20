import {
  formatFiles,
  installPackagesTask,
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { dump as parseToYaml } from 'js-yaml';
import parse from 'node-html-parser';
import { readYamlFile } from 'nx/src/utils/fileutils';

import initGenerator from '../init/generator';
import { forgeLogin } from '../util/forge-account';

import { AppGeneratorSchema } from './schema';

import { execSync } from 'child_process';
import { join, relative } from 'path/posix';

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  (await initGenerator(tree))();

  const result = forgeLogin();

  if (!result) {
    logger.info('\nAlready logged into forge cli, skipping...\n');
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
      const indexHTMLFilePath = join(projectConfig.sourceRoot, 'index.html');
      const indexHTMLContent = tree.read(indexHTMLFilePath).toString();

      const parsedHTML = parse(indexHTMLContent);
      const baseElement = parsedHTML.getElementsByTagName('base')[0];
      if (baseElement) {
        baseElement.setAttribute('href', '');
        tree.write(indexHTMLFilePath, parsedHTML.toString());
      } else {
        logger.warn('Unable to update baseHref in `index.html`...Skipping...');
      }
    } else {
      logger.error(
        "Unsupported application type...\r\nYou will need to manually update your `manifest.yml` with the application's dist path for the `main` resource"
      );
    }

    if (distPath) {
      manifestContents.resources[0].path = distPath;
    }
  }

  manifestContents.permissions = {
    content: { styles: ['unsafe-inline'], scripts: ['unsafe-inline'] },
  };

  tree.write(manifestFilePath, parseToYaml(manifestContents));

  if (projectConfig.targets) {
    projectConfig.targets['forge-deploy'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:deploy',
      options: {
        buildConfig: 'production',
      },
    };
    projectConfig.targets['forge-install'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:install',
    };
    projectConfig.targets['forge-uninstall'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:uninstall',
    };
    projectConfig.targets['forge-lint'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:lint',
    };

    updateProjectConfiguration(tree, options.project, projectConfig);
  } else {
    throw new Error('Could not find targets list in project configuration...');
  }

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

export default appGenerator;
