import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { connectMigrationGenerator } from './generator';
import { ConnectMigrationGeneratorSchema } from './schema';

describe('connect-migration generator', () => {
  let tree: Tree;
  const options: ConnectMigrationGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await connectMigrationGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
