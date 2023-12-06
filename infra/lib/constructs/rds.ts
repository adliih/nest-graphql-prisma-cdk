import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { BuildConfig } from '../build-config';
import { getResourceName } from '../helpers';

interface Props {
  vpc: ec2.IVpc;
  buildConfig: BuildConfig;
  ecsServiceSG: ec2.ISecurityGroup;
}

export class RDS extends Construct {
  readonly cluster: rds.DatabaseCluster;
  readonly secret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { vpc, buildConfig, ecsServiceSG } = props;

    const cluster = new rds.DatabaseCluster(this, 'Cluster', {
      clusterIdentifier: getResourceName(id, 'Cluster', buildConfig),
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_12_14,
      }),
      writer: rds.ClusterInstance.provisioned('Writer', {
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM,
        ),
        publiclyAccessible: true,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    cluster.connections.allowDefaultPortFrom(
      ecsServiceSG,
      'Allow access from ECS Service',
    );

    new cdk.CfnOutput(this, 'RDS Endpoint', {
      value: cluster.clusterEndpoint.socketAddress,
    });
    new cdk.CfnOutput(this, 'RDS Secret ARN', {
      value: cluster.secret?.secretArn || '',
    });

    this.cluster = cluster;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.secret = cluster.secret!;
  }
}
