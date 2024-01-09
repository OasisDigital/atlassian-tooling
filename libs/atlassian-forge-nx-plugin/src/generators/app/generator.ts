import {
  formatFiles,
  installPackagesTask,
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
  workspaceRoot,
} from '@nx/devkit';
import { dump as parseToYaml } from 'js-yaml';
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

  let buildConfig = 'production';
  let distPath = relative(
    directory,
    join(workspaceRoot, 'dist', 'apps', projectConfig.name)
  );

  const supportedExecutors = [
    '@angular-devkit/build-angular:browser',
    '@nx/webpack:webpack',
  ];

  if (supportedExecutors.includes(projectConfig.targets?.['build']?.executor)) {
    distPath = relative(
      directory,
      projectConfig.targets['build'].options.outputPath
    );
    if (!projectConfig.targets['build'].configurations[buildConfig]) {
      logger.error(
        `Could not find ${buildConfig} build configuration...\r\nYou will need to manually update the \`forge-deploy\` target's \`buildConfig\` value for the configuration you deploy to the Atlassian Servers...`
      );
      buildConfig = '';
    } else {
      if (projectConfig.targets['build'].options.baseHref) {
        projectConfig.targets['build'].configurations[buildConfig].baseHref =
          '';
      } else {
        logger.error(
          `Could not find ${buildConfig} build configuration...\r\nYou will need to manually update the baseHref to be an empty string ('') for use with Forge...`
        );
      }
    }
  } else {
    logger.error(
      `Unsupported application type...\r\nYou will need to manually update your \`manifest.yml\` with the application's dist path if it differs from \`${distPath}\``
    );
  }

  const manifestFilePath = join(directory, 'manifest.yml');
  const manifestContents = readYamlFile(manifestFilePath);
  if (manifestContents?.resources[0]?.key === 'main') {
    manifestContents.resources[0].path = distPath;
  } else {
    logger.error(
      `Unable to find forge \`main\` resource...\r\nYou will need to manually update your \`manifest.yml\`'s main resource with your frontend app's dist path`
    );
  }

  manifestContents.permissions = {
    scopes: ['read:me'],
    content: { styles: ['unsafe-inline'], scripts: ['unsafe-inline'] },
  };

  tree.write(manifestFilePath, parseToYaml(manifestContents));

  if (projectConfig.targets) {
    projectConfig.targets['forge-deploy'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:deploy',
      options: {
        buildConfig,
      },
    };
    projectConfig.targets['forge-deploy-watch'] = {
      executor: '@oasisdigital/atlassian-forge-nx-plugin:deploy-watch',
      options: {
        buildConfig,
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
