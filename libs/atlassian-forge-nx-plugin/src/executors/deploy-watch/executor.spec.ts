import { DeployWatchExecutorSchema } from './schema';
import executor from './executor';

const options: DeployWatchExecutorSchema = {};

describe('DeployWatch Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
