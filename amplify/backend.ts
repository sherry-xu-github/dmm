/*import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

const backend = defineBackend({
  auth,
  data,
});

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.us- east-1.amazonaws.com",
  {
    authorizationConfig: {
      signingRegion: "us-east-1",
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      "arn:aws:bedrock:us- east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
    ],
    actions: ["bedrock:InvokeModel"],
    
  })
);
*/

import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
//import * as rekognition from "aws-cdk-lib/aws-rekognition";
import { Stack } from "aws-cdk-lib";

const backend = defineBackend({
  auth,
  data,
  storage,
});

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: [
      "translate:TranslateText",
      "polly:SynthesizeSpeech",
      "transcribe:StartStreamTranscriptionWebSocket",
      "comprehend:DetectSentiment",
      "comprehend:DetectEntities",
      "comprehend:DetectDominantLanguage",
      "comprehend:DetectSyntax",
      "comprehend:DetectKeyPhrases",
      "rekognition:DetectFaces",
      "rekognition:RecognizeCelebrities",
      "rekognition:DetectLabels",
      "rekognition:DetectModerationLabels",
      "rekognition:DetectText",
      "rekognition:DetectLabel",
      //Face recognition actions:
      'rekognition:CreateCollection',
      'rekognition:DeleteCollection',
      'rekognition:DescribeCollection',
      'rekognition:ListCollections',
      'rekognition:IndexFaces',
      'rekognition:ListFaces',
      'rekognition:CreateUser',
      'rekognition:DeleteUser',
      'rekognition:ListUsers',
      'rekognition:SearchUsers',
      'rekognition:SearchUsersByImage',
      'rekognition:AssociateFaces',
      'rekognition:DisassociateFaces',
      'rekognition:CompareFaces',
      "rekognition:SearchFaces",
      "rekognition:SearchFacesByImage",
      "textract:AnalyzeDocument",
      "textract:DetectDocumentText",
      "textract:GetDocumentAnalysis",
      "textract:StartDocumentAnalysis",
      "textract:StartDocumentTextDetection",
    ],
    resources: ["*"]
  })
);

/*
const faceCollection = new rekognition.CfnCollection(backend.auth.resources.userPool, "FaceCollection", {
  collectionId: "my-face-collection",
});
*/

backend.addOutput({
  custom: {
    Predictions: {
      convert: {
        translateText: {
          defaults: {
            sourceLanguage: "en",
            targetLanguage: "es",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.userPool).region,
        },
        speechGenerator: {
          defaults: {
            voiceId: "Ivy",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.userPool).region,
        },
        transcription: {
          defaults: {
            language: "en-US",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.userPool).region,
        },
      },
      identify: {
        identifyEntities: {
          defaults: {
            collectionId: "default",
            maxEntities: 10,
          },
          celebrityDetectionEnabled: true,
          proxy: false,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        },
        identifyLabels: {
          defaults: {
            type: "ALL",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        },
        identifyText: {
          defaults: {
            format: "ALL",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        },
        /*
        facesCollection: {
          collectionId: faceCollection.collectionId,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        },
        */
      },
      interpret: {
        interpretText: {
          defaults: {
            type: "ALL",
          },
          proxy: false,
          region: Stack.of(backend.auth.resources.authenticatedUserIamRole).region,
        },
      },
    },
  },
});