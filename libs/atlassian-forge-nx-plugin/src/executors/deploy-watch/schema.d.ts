export interface DeployWatchExecutorSchema {
  buildTarget?: string;
  buildTargets?: string[];
  environment?: string;
  noVerify: boolean;
  nonInteractive: boolean;
  help: boolean;
  verbose: boolean;
}
