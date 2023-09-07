export async function loadEnvVars(path?: string) {
  if (path) {
    const result = (await import('dotenv')).config({ path });
    if (result.error) {
      throw result.error;
    }
    return result.parsed;
  } else {
    try {
      return (await import('dotenv')).config().parsed;
    } catch {
      throw 'Failed to setup env variable config';
    }
  }
}
