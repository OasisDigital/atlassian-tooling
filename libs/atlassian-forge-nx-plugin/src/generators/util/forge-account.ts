import { logger } from '@nx/devkit';
import { execSync } from 'child_process';

export function forgeLogin() {
  try {
    const whoAmI = execSync('npx forge whoami').toString();
    if (whoAmI.includes('Logged in as')) {
      return false;
    }
  } catch (err) {
    try {
      execSync('npx forge login', { stdio: 'inherit' });
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  }
}

export function forgeLogout() {
  return execSync('npx forge logout').toString();
}
