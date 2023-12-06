import { BuildConfig } from '../build-config';

export function getResourceName(
  stackId: string,
  resource: string,
  buildConfig: BuildConfig,
) {
  return `${stackId}-${resource}-${buildConfig.env}`;
}
