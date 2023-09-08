import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  GeneratorCallback,
  readJson,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';

function getInstalledPackageVersion(
  tree: Tree,
  pkgName: string
): string | null {
  const { dependencies, devDependencies } = readJson(tree, 'package.json');
  const version = dependencies?.[pkgName] ?? devDependencies?.[pkgName];

  return version;
}

export async function initGenerator(tree: Tree) {
  const tasks: GeneratorCallback[] = [];

  const packageJson = readJson(tree, 'package.json');

  const atlassianConnectPluginVersion =
    packageJson.devDependencies['@oasisdigital/atlassian-connect-nx-plugin'] ??
    packageJson.dependencies['@oasisdigital/atlassian-connect-nx-plugin'] ??
    'latest';

  const nxVersion =
    packageJson.devDependencies['nx'] ??
    packageJson.dependencies['nx'] ??
    'latest';

  const peerDeps = [
    { name: '@nx/angular', version: nxVersion },
    { name: '@nx/express', version: nxVersion },
    {
      name: '@oasisdigital/atlassian-connect-angular',
      version: atlassianConnectPluginVersion,
    },
  ];

  peerDeps.forEach((peerDep) => {
    const packageVersion = getInstalledPackageVersion(tree, peerDep.name);

    if (!packageVersion) {
      try {
        ensurePackage(peerDep.name, peerDep.version);
      } catch {
        // @schematics/angular cannot be required so this fails but this will still allow wrapping the schematic later on
      }

      tasks.push(
        addDependenciesToPackageJson(
          tree,
          {},
          { [peerDep.name]: peerDep.version }
        )
      );
    }
  });

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}

export default initGenerator;
