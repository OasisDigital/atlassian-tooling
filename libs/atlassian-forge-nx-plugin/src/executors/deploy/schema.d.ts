export interface DeployExecutorSchema {
  buildConfig: string;
  environment?: string;
  noVerify: boolean;
  nonInteractive: boolean;
  help: boolean;
  verbose: boolean;
}
