import { applicationGenerator as angularAppGenerator } from '@nrwl/angular/generators';
import {
  formatFiles,
  generateFiles,
  names,
  Tree,
  readProjectConfiguration,
  updateProjectConfiguration,
  installPackagesTask,
} from '@nrwl/devkit';
import { applicationGenerator as nodeAppGenerator } from '@nrwl/node';

import { ToolingPluginGeneratorSchema } from './schema';

import * as path from 'path';

/*
  We are creating:
    * Angular App
    * Library Project(?) for angular app
    * Express App
    * (Update package.json eventually with required packages)
*/

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
    path.join('apps', angularProjectName, 'src'),
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

  installPackagesTask(tree);

  await formatFiles(tree);
}
