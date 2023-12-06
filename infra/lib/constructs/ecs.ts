import { Construct } from 'constructs';
import { BuildConfig } from '../build-config';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { getResourceName } from '../helpers';

export interface EcsClusterProps {
  vpc: ec2.IVpc;
  buildConfig: BuildConfig;
}

export class EcsCluster extends Construct {
  readonly cluster: ecs.ICluster;

  constructor(scope: Construct, id: string, props: EcsClusterProps) {
    super(scope, id);

    const { vpc, buildConfig } = props;

    const cluster = new ecs.Cluster(this, 'Cluster', {
      clusterName: getResourceName(id, 'Cluster', buildConfig),
      vpc,
    });

    this.cluster = cluster;
  }
}

export interface EcsServiceProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  buildConfig: BuildConfig;
  ecsTaskRole: iam.IRole;
  containerPort: number;
  environment?: Record<string, string>;
  secrets?: Record<string, ecs.Secret>;
  command?: string[];
}

export class EcsService extends Construct {
  readonly service: elbv2.IApplicationLoadBalancerTarget;

  constructor(scope: Construct, id: string, props: EcsServiceProps) {
    super(scope, id);

    const {
      buildConfig,
      ecsTaskRole,
      containerPort,
      environment,
      secrets,
      command,
      cluster,
    } = props;

    const memoryLimitMiB = 2048;
    const cpu = 1024;

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      family: getResourceName(id, 'TaskDef', buildConfig),
      taskRole: ecsTaskRole,
      memoryLimitMiB,
      cpu,
    });

    taskDefinition.addContainer('App', {
      image: ecs.ContainerImage.fromAsset('..'),
      memoryLimitMiB,
      cpu,
      portMappings: [
        {
          containerPort,
        },
      ],
      environment,
      secrets,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: `ecs`,
        logRetention: logs.RetentionDays.THREE_DAYS,
      }),
      command,
    });

    const service = new ecs.FargateService(this, 'Service', {
      serviceName: getResourceName(id, 'Service', buildConfig),
      cluster,
      taskDefinition,
      circuitBreaker: {
        rollback: true,
      },
      assignPublicIp: true,
      enableExecuteCommand: true,
    });

    this.service = service;
  }
}

export interface EcsServiceALBProps {
  port: number;
  healthCheck: elbv2.HealthCheck;
  vpc: ec2.IVpc;
  service: elbv2.IApplicationLoadBalancerTarget;
  buildConfig: BuildConfig;
}

export class EcsServiceALB extends Construct {
  constructor(scope: Construct, id: string, props: EcsServiceALBProps) {
    super(scope, id);

    const { port, healthCheck, vpc, service, buildConfig } = props;
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'ServiceALB', {
      loadBalancerName: getResourceName(id, 'ALB', buildConfig),
      vpc,
      internetFacing: true,
      idleTimeout: cdk.Duration.seconds(5),
    });

    const httpListener = loadBalancer.addListener('HttpListener', {
      port: 80,
    });

    [httpListener].forEach((listener) =>
      listener.addTargets('ServiceTargetGroup', {
        protocol: elbv2.ApplicationProtocol.HTTP,
        port,
        targets: [service],
        healthCheck,
      }),
    );

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: loadBalancer.loadBalancerDnsName,
    });

    return loadBalancer;
  }
}
