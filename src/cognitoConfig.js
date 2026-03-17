import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-south-1_GaF4vQlmH", // your User Pool ID
  ClientId: "2em6uo8oaqdoda4o380qal9v3u" // your App Client ID
};

export const userPool = new CognitoUserPool(poolData);
