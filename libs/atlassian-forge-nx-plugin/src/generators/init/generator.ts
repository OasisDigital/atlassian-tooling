import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  GeneratorCallback,
  readJson,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';

import { execSync } from 'child_process';

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

  const peerDeps = ['@forge/cli'];

  const deps = ['@forge/resolver', '@forge/api'];

  peerDeps.forEach((pkg) => {
    const packageVersion = getInstalledPackageVersion(tree, pkg);

    const version = execSync(`npm view ${pkg} version`).toString();

    if (!packageVersion) {
      try {
        ensurePackage(pkg, version);
      } catch {
        // catching in case a package cannot be required so this fails but this will still allow wrapping the schematic later on
      }

      tasks.push(addDependenciesToPackageJson(tree, {}, { [pkg]: version }));
    }
  });

  deps.forEach((pkg) => {
    const packageVersion = getInstalledPackageVersion(tree, pkg);
    const version = execSync(`npm view ${pkg} version`).toString();
    if (!packageVersion) {
      tasks.push(addDependenciesToPackageJson(tree, {}, { [pkg]: version }));
    }
  });

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}

export default initGenerator;
