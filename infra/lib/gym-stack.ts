import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * AWS CDK Stack for the Gym Booking API.
 * This defines a Lambda function triggered by an API Gateway.
 */
export class GymStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Lambda Function (Node.js Lambda with Fastify)
    const gymApiLambda = new nodejs.NodejsFunction(this, 'GymApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../api/src/server.ts'),
      handler: 'handler', //export a handler from server.ts
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'],
      },
      environment: {
        // pass environment variables 
      },
      timeout: cdk.Duration.seconds(10),
    });

    // 2. API Gateway
    const api = new apigateway.RestApi(this, 'GymBookingApi', {
      restApiName: 'Gym Booking Service',
      description: 'API for real-time gym capacity and booking.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // 3. API Gateway Integration
    const lambdaIntegration = new apigateway.LambdaIntegration(gymApiLambda);

    // Endpoints
    const gyms = api.root.addResource('gyms');
    const gym = gyms.addResource('{id}');
    
    // GET /gyms/:id/capacity
    const capacity = gym.addResource('capacity');
    capacity.addMethod('GET', lambdaIntegration);

    // POST /gyms/:id/book
    const book = gym.addResource('book');
    book.addMethod('POST', lambdaIntegration);
  }
}
