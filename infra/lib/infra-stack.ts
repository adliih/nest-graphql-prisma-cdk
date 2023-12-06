import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { getResourceName } from './helpers';
import { BuildConfig } from './build-config';
import {
  EcsCluster,
  EcsService,
  EcsServiceALB,
  RDS as RdsCluster,
  SecurityConstruct as Security,
} from './constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class InfraStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    buildConfig: BuildConfig,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      vpcName: getResourceName(id, 'VPC', buildConfig),
      maxAzs: 3,
      natGateways: 1,
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const security = new Security(this, 'Security', {
      vpc,
      buildConfig,
    });

    const rds = new RdsCluster(this, 'RDS', {
      vpc,
      buildConfig,
      ecsServiceSG: security.ecsServiceSG,
    });

    const ecsCluster = new EcsCluster(this, 'EcsCluster', {
      vpc,
      buildConfig,
    });

    const appService = new EcsService(this, 'AppService', {
      vpc,
      buildConfig,
      cluster: ecsCluster.cluster,
      containerPort: 3000,
      ecsTaskRole: security.ecsTaskRole,
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(rds.secret, 'DATABASE_URL'),
      },
    });
    new EcsServiceALB(this, 'AppServiceALB', {
      vpc,
      buildConfig,
      port: 3000,
      healthCheck: {
        path: '/health',
      },
      service: appService.service,
    });
  }
}
