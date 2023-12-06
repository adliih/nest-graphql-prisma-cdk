import * as cdk from 'aws-cdk-lib';
import { BuildConfig } from '../build-config';

function getString(obj: Record<string, any>, key: string): string {
  if (!obj[key] || obj[key].trim().length === 0) {
    throw new Error(`${key} is invalid on object`);
  }

  return obj[key];
}

export function getConfig(app: cdk.App): BuildConfig {
  const env = app.node.tryGetContext('env');
  if (!env) {
    throw new Error(`Missing variable: env. Pass in as '-c env=XXX`);
  }
  const unparsedBuildConfig = app.node.tryGetContext(env);
  return {
    env: getString(unparsedBuildConfig, 'env'),
  };
}
