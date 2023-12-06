import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { BuildConfig } from '../build-config';
import { getResourceName } from '../helpers';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface SecurityConstructProps {
  vpc: ec2.IVpc;
  buildConfig: BuildConfig;
}

export class SecurityConstruct extends Construct {
  public readonly ecsServiceSG: ec2.ISecurityGroup;
  public readonly ecsTaskRole: iam.IRole;

  constructor(scope: Construct, id: string, props: SecurityConstructProps) {
    super(scope, id);

    const { vpc, buildConfig } = props;

    const ecsServiceSG = new ec2.SecurityGroup(
      this,
      'EcsServiceSSecurityGroup',
      {
        securityGroupName: getResourceName(
          id,
          'EcsServiceSSecurityGroup',
          buildConfig,
        ),
        vpc: vpc,
        allowAllOutbound: true,
        description: 'Security group for ECS Service',
      },
    );

    const ecsTaskRole = new iam.Role(this, 'EcsTaskRole', {
      roleName: getResourceName(id, 'EcsTaskRole', buildConfig),
      assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
      description:
        'Role to Assume for ECS Task Role (the running app of the service)',
    });

    this.ecsServiceSG = ecsServiceSG;
    this.ecsTaskRole = ecsTaskRole;
  }
}
