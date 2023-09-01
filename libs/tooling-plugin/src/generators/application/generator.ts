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
} from '@nx/devkit';
import { applicationGenerator as nodeAppGenerator } from '@nx/node';

import { ToolingPluginGeneratorSchema } from './schema';

import * as path from 'path';

/*
  We are creating:
    * Angular App
    * Library Project(?) for angular app
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

export default async function (
  tree: Tree,
  options: ToolingPluginGeneratorSchema,
) {
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
    },
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
    },
  );

  const angularProjectConfig = readProjectConfiguration(
    tree,
    angularProjectName,
  );

  if (angularProjectConfig.targets) {
    angularProjectConfig.targets['connect-serve'] = {
      executor: 'nx:run-commands',
      options: {
        commands: [
          {
            command: `npx nx serve ${expressProjectName} --output-style=stream-without-prefixes`,
          },
          {
            command: `npx nx serve ${angularProjectName} --output-style=stream-without-prefixes`,
          },
        ],
        parallel: true,
      },
    };
    angularProjectConfig.targets[
      'build'
    ].options.outputPath = `dist/apps/${expressProjectName}/public`;

    updateProjectConfiguration(tree, angularProjectName, angularProjectConfig);
  }

  updateGitIgnore(tree);
  installPackagesTask(tree);

  await formatFiles(tree);
}
