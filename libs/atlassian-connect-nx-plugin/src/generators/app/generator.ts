import { applicationGenerator as angularAppGenerator } from '@nx/angular/generators';
import {
  formatFiles,
  generateFiles,
  names,
  Tree,
  readProjectConfiguration,
  updateProjectConfiguration,
  logger,
  installPackagesTask,
} from '@nx/devkit';
import { applicationGenerator as expressAppGenerator } from '@nx/express';

import { initGenerator } from '../init/generator';

import { AppGeneratorSchema } from './schema';

import { join } from 'path/posix';

/*
  We are creating:
    * Angular App
    * Express App
    * (Update package.json eventually with required packages)
*/

function updateGitIgnore(tree: Tree, entry: string, regexTest: RegExp) {
  if (tree.exists('.gitignore')) {
    let content = tree.read('.gitignore', 'utf-8') ?? '';
    if (regexTest.test(content)) {
      return;
    }

    content = `${content}\n${entry}\n`;
    tree.write('.gitignore', content);
  } else {
    logger.warn(`Couldn't find .gitignore file to update`);
  }
}

function updateIndexHtmlFile(tree: Tree, sourceRoot: string) {
  const indexHtmlFilePath = join(sourceRoot, 'index.html');
  if (tree.exists(indexHtmlFilePath)) {
    const indexHtmlContents = tree.read(indexHtmlFilePath).toString();
    const updatedIndexHtmlContents = indexHtmlContents.replace(
      '  </head>',
      '    <script src="https://connect-cdn.atl-paas.net/all.js" type="text/javascript" async></script>\r\n  </head>'
    );
    tree.write(indexHtmlFilePath, updatedIndexHtmlContents);
  } else {
    logger.warn(`Couldn't find index.html file to update`);
  }
}

export default async function (tree: Tree, options: AppGeneratorSchema) {
  (await initGenerator(tree))();

  const nameOptions = names(options.name);

  const angularProjectName = `${nameOptions.fileName}-angular`;
  const expressProjectName = `${nameOptions.fileName}-express`;

  await angularAppGenerator(tree, {
    name: angularProjectName,
    standalone: true,
    directory: options.directory,
  });

  const angularAppProjectConfig = readProjectConfiguration(
    tree,
    angularProjectName
  );

  generateFiles(
    tree,
    join(__dirname, 'files', 'angular'),
    join(angularAppProjectConfig.sourceRoot, '../'),
    {
      tmpl: '',
      ...nameOptions,
    }
  );

  updateIndexHtmlFile(tree, angularAppProjectConfig.sourceRoot);

  await expressAppGenerator(tree, {
    name: expressProjectName,
  } as any);

  const expressAppProjectConfig = readProjectConfiguration(
    tree,
    expressProjectName
  );

  generateFiles(
    tree,
    join(__dirname, 'files', 'express'),
    join(expressAppProjectConfig.sourceRoot, '../'),
    {
      tmpl: '',
      ...nameOptions,
    }
  );

  if (angularAppProjectConfig.targets) {
    angularAppProjectConfig.targets['connect-serve'] = {
      executor: '@oasisdigital/atlassian-connect-nx-plugin:serve',
      options: {
        serverAppName: expressProjectName,
      },
    };
    angularAppProjectConfig.targets['connect-build'] = {
      executor: '@oasisdigital/atlassian-connect-nx-plugin:build',
      options: {
        serverAppName: expressProjectName,
      },
    };
    angularAppProjectConfig.targets['build'].options.outputPath = join(
      expressAppProjectConfig.targets['build'].options.outputPath,
      '/public'
    );

    updateProjectConfiguration(
      tree,
      angularProjectName,
      angularAppProjectConfig
    );
  }

  const atlassianConnectJsonEntry = `# Generated Atlassian Connect File
**/assets/atlassian-connect.json`;
  updateGitIgnore(
    tree,
    atlassianConnectJsonEntry,
    /\*\*\/assets\/atlassian-connect\.json/gm
  );

  const atlassianConnectEnvEntry = `# Atlassian Connect env File
**/.env.atlassian-connect`;
  updateGitIgnore(
    tree,
    atlassianConnectEnvEntry,
    /\*\*\/\.env\.atlassian-connect/gm
  );

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}
