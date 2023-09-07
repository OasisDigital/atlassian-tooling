import { applicationGenerator as angularAppGenerator } from '@nx/angular/generators';
import {
  formatFiles,
  generateFiles,
  names,
  Tree,
  readProjectConfiguration,
  updateProjectConfiguration,
  installPackagesTask,
  logger,
  addDependenciesToPackageJson,
  getDependentPackagesForProject,
  readJson,
} from '@nx/devkit';
import { applicationGenerator as nodeAppGenerator } from '@nx/node';

import { AppGeneratorSchema } from './schema';

import * as path from 'path';
import { readModulePackageJson } from 'nx/src/utils/package-json';

/*
  We are creating:
    * Angular App
    * Express App
    * (Update package.json eventually with required packages)
*/

function updateGitIgnore(tree: Tree) {
  if (tree.exists('.gitignore')) {
    const entry = `# Generated Atlassian Connect File
**/assets/atlassian-connect.json`;

    let content = tree.read('.gitignore', 'utf-8') ?? '';
    if (/\*\*\/assets\/atlassian-connect\.json/gm.test(content)) {
      return;
    }

    content = `${content}\n${entry}\n`;
    tree.write('.gitignore', content);
  } else {
    logger.warn(`Couldn't find .gitignore file to update`);
  }
}

export default async function (tree: Tree, options: AppGeneratorSchema) {
  const nameOptions = names(options.name);

  const angularProjectName = `${nameOptions.fileName}-angular`;
  const expressProjectName = `${nameOptions.fileName}-express`;

  await angularAppGenerator(tree, {
    name: angularProjectName,
    standalone: true,
  });

  generateFiles(
    tree,
    path.join(__dirname, 'files', 'angular'),
    path.join('apps', angularProjectName),
    {
      tmpl: '',
      ...nameOptions,
    }
  );

  await nodeAppGenerator(tree, {
    name: expressProjectName,
    framework: 'express',
  });

  generateFiles(
    tree,
    path.join(__dirname, 'files', 'express'),
    path.join('apps', expressProjectName),
    {
      tmpl: '',
      ...nameOptions,
    }
  );

  const angularProjectConfig = readProjectConfiguration(
    tree,
    angularProjectName
  );

  if (angularProjectConfig.targets) {
    angularProjectConfig.targets['connect-serve'] = {
      executor: '@oasisdigital/atlassian-connect-nx-plugin:serve',
      options: {
        serverAppName: expressProjectName,
      },
    };
    angularProjectConfig.targets['connect-build'] = {
      executor: '@oasisdigital/atlassian-connect-nx-plugin:build',
      options: {
        serverAppName: expressProjectName,
      },
    };
    angularProjectConfig.targets[
      'build'
    ].options.outputPath = `dist/apps/${expressProjectName}/public`;

    updateProjectConfiguration(tree, angularProjectName, angularProjectConfig);
  }

  updateGitIgnore(tree);

  const packageJson = readJson(tree, 'package.json');

  const version =
    packageJson.devDependencies['@oasisdigital/atlassian-connect-nx-plugin'] ??
    packageJson.dependencies['@oasisdigital/atlassian-connect-nx-plugin'] ??
    'latest';

  addDependenciesToPackageJson(
    tree,
    {
      '@oasisdigital/atlassian-connect-angular': version,
    },
    {}
  );

  installPackagesTask(tree);

  await formatFiles(tree);
}
