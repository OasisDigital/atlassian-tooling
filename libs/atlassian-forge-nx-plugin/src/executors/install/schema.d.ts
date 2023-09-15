export interface InstallExecutorSchema {
  site?: string;
  product?: string;
  environment?: string;
  upgrade: boolean;
  confirmScopes: boolean;
  nonInteractive: boolean;
  help: boolean;
  verbose: boolean;
}
