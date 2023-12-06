#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { getConfig, getResourceName } from '../lib/helpers';

const commonProps: cdk.StackProps = {
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  },
};

const app = new cdk.App();
const buildConfig = getConfig(app);
new InfraStack(app, 'InfraStack', buildConfig, {
  ...commonProps,
  stackName: getResourceName('Infra', 'stack', buildConfig),
});
