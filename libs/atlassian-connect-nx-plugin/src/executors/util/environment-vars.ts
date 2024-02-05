export async function loadEnvVars(path?: string) {
  if (path) {
    try {
      const result = (await import('dotenv')).config({ path });
      if (result.error) {
        throw result.error;
      }
      return result.parsed;
    } catch {
      try {
        (await import('dotenv')).config();
        return process.env;
      } catch {
        throw 'Failed to setup env variable config';
      }
    }
  } else {
    try {
      (await import('dotenv')).config();
      return process.env;
    } catch {
      throw 'Failed to setup env variable config';
    }
  }
}
