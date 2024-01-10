import {
  formatFiles,
  installPackagesTask,
  logger,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
  addProjectConfiguration,
} from '@nx/devkit';
import { dump as parseToYaml } from 'js-yaml';
import { readYamlFile } from 'nx/src/utils/fileutils';

import initGenerator from '../init/generator';
import { forgeLogin } from '../util/forge-account';

import { AppGeneratorSchema } from './schema';

import { execSync } from 'child_process';
import { join, relative, normalize } from 'path/posix';

export async function appGenerator(tree: Tree, options: AppGeneratorSchema) {
  (await initGenerator(tree))();

  const result = forgeLogin();

  if (!result) {
    logger.info('\nAlready logged into forge cli, skipping...\n');
  }

  const [project, target, configuration] = options.buildTarget.split(':');

  const root = options.directory
    ? join(options.directory, options.name)
    : join(options.name);
  const directory = normalize(root);

  addProjectConfiguration(
    tree,
    options.name,
    {
      root,
      targets: {
        ['forge-deploy']: {
          executor: '@oasisdigital/atlassian-forge-nx-plugin:deploy',
          options: {
            buildTarget: options.buildTarget,
          },
        },
        ['forge-deploy-watch']: {
          executor: '@oasisdigital/atlassian-forge-nx-plugin:deploy-watch',
          options: {
            buildTarget: options.buildTarget,
          },
        },
        ['forge-install']: {
          executor: '@oasisdigital/atlassian-forge-nx-plugin:install',
        },
        ['forge-uninstall']: {
          executor: '@oasisdigital/atlassian-forge-nx-plugin:uninstall',
        },
        ['forge-lint']: {
          executor: '@oasisdigital/atlassian-forge-nx-plugin:lint',
        },
      },
      implicitDependencies: [project],
    },
    true
  );

  execSync(`forge create --directory=${directory} ${options.name}`, {
    stdio: 'inherit',
  });

  tree.delete(join(directory, 'node_modules'));
  tree.delete(join(directory, 'static'));
  tree.delete(join(directory, '.gitignore'));
  tree.delete(join(directory, 'package.json'));
  tree.delete(join(directory, 'package-lock.json'));
  tree.delete(join(directory, 'README.md'));

  const supportedExecutors = [
    '@angular-devkit/build-angular:browser',
    '@nx/webpack:webpack',
  ];

  const buildTargetProjectConfig = readProjectConfiguration(tree, project);
  let distPath: string | undefined;
  if (
    !buildTargetProjectConfig.targets?.[target].configurations[configuration]
  ) {
    logger.error(
      `Could not find \`${options.buildTarget}\` build target configuration...\r\nYou will need to manually update the \`forge-deploy\` target's \`buildConfig\` value for the configuration you deploy to the Atlassian Servers...`
    );
  } else {
    if (
      supportedExecutors.includes(
        buildTargetProjectConfig.targets?.[target]?.executor
      )
    ) {
      distPath = relative(
        directory,
        buildTargetProjectConfig.targets[target].options.outputPath
      );
    } else {
      logger.error(
        `Unsupported application type...\r\nYou will need to manually update your \`manifest.yml\` with the application's dist path...`
      );
    }
  }

  const manifestFilePath = join(directory, 'manifest.yml');
  const manifestContents = readYamlFile(manifestFilePath);
  if (!(manifestContents?.resources[0]?.key === 'main')) {
    logger.error(
      `Unable to find forge \`main\` resource...\r\nYou will need to manually update your \`manifest.yml\`'s main resource with your frontend app's dist path`
    );
  } else if (distPath) {
    manifestContents.resources[0].path = distPath;
  }

  manifestContents.permissions = {
    scopes: ['read:me'],
    content: { styles: ['unsafe-inline'], scripts: ['unsafe-inline'] },
  };

  tree.write(manifestFilePath, parseToYaml(manifestContents));

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

export default appGenerator;
