import { ExecutorContext, logger, runExecutor } from '@nx/devkit';
import { watch } from 'chokidar';
import {
  Observable,
  ObservableInputTuple,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
  lastValueFrom,
  exhaustMap,
  startWith,
} from 'rxjs';

import { DeployWatchExecutorSchema } from './schema';

import { exec } from 'child_process';
import { normalize } from 'path/posix';

export default async function runDeployWatchExecutor(
  options: DeployWatchExecutorSchema,
  context: ExecutorContext
) {
  const deployOptions: string[] = [];
  if (options.environment) {
    deployOptions.push(`--environment=${options.environment}`);
  }
  if (options.noVerify) {
    deployOptions.push(`--no-verify`);
  }
  if (options.nonInteractive) {
    deployOptions.push(`--non-interactive`);
  }
  if (options.help) {
    deployOptions.push(`--help`);
  }
  if (options.verbose) {
    deployOptions.push(`--verbose`);
  }

  const command =
    deployOptions.length > 0
      ? `npx forge deploy ${deployOptions.join(' ')}`
      : 'npx forge deploy';

  const projectConfig =
    context.projectsConfigurations.projects[context.projectName];
  const workingDirectory = normalize(projectConfig.root);

  if (options.buildTarget || options.buildTargets) {
    const buildTargets = options.buildTarget
      ? [options.buildTarget]
      : options.buildTargets;

    return await lastValueFrom(
      concatCombineLatest([
        ...buildTargets.map(
          (buildTarget) =>
            new Observable<{ success: boolean }>((subscriber) => {
              const [project, target, configuration] = buildTarget.split(':');
              runExecutor(
                {
                  project,
                  target,
                  configuration,
                },
                {
                  watch: true,
                },
                context
              ).then(async (results) => {
                for await (const result of results) {
                  if (!subscriber.closed) {
                    if (result.success) {
                      subscriber.next(result);
                    } else {
                      throw result;
                    }
                  }
                }
              });
            })
        ),
        new Observable((subscriber) => {
          logger.log(
            `Watching for Forge app changes in ${workingDirectory}...`
          );
          const changesWatch = watch(workingDirectory, {
            ignoreInitial: true,
          }).on('all', (eventName, path) => {
            logger.log('Forge app change detected!');
            subscriber.next({ eventName, path });
          });
          () => {
            changesWatch.close();
          };
        }).pipe(startWith(null)),
      ]).pipe(
        debounceTime(1000),
        exhaustMap(
          () =>
            new Observable((subscriber) => {
              const forgeDeployProcess = exec(
                command,
                {
                  cwd: workingDirectory,
                },
                (error) => {
                  if (error) {
                    subscriber.next({ success: false });
                  } else {
                    subscriber.next({ success: true });
                  }
                  subscriber.complete();
                }
              );
              forgeDeployProcess.stdout.pipe(process.stdout);
              async () => {
                // this doesn't actually work???
                forgeDeployProcess.kill('SIGINT');
              };
            })
        ),
        map(() => ({ success: true })),
        catchError(() => of({ success: false })),
        filter((res) => !res.success)
      )
    );
  } else {
    let errorMessage = `No \`buildTarget(s)\` found for project ${context.projectName}`;
    if (context.targetName) {
      errorMessage += ` with target ${context.targetName}`;
    }
    if (context.configurationName) {
      errorMessage += ` using configuration ${context.configurationName}`;
    }
    logger.error(errorMessage);
  }
}

function concatCombineLatest<A extends readonly unknown[]>(
  sources: ObservableInputTuple<A>
): Observable<A[number]> {
  const subjects: Subject<void>[] = [];
  return combineLatest(
    sources.map((source, index) => {
      subjects.push(new Subject());
      if (index === 0) {
        return from(source).pipe(tap(() => subjects[index].next()));
      } else {
        return subjects[index - 1].pipe(
          take(1),
          switchMap(() => from(source).pipe(tap(() => subjects[index].next())))
        );
      }
    })
  );
}
