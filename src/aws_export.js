import { REACT_APP_COGNITO_CLIENT_ID, REACT_APP_COGNITO_DOMAIN, REACT_APP_COGNITO_REGION, REACT_APP_COGNITO_USERPOOL_ID } from "constants/awsConfig";

/**
 * Config login by AzureID
 */
const awsConfig = {
    Auth: {
        "aws_project_region": REACT_APP_COGNITO_REGION,
        "aws_cognito_region": REACT_APP_COGNITO_REGION,
        "aws_user_pools_id": REACT_APP_COGNITO_USERPOOL_ID,
        "aws_user_pools_web_client_id": REACT_APP_COGNITO_CLIENT_ID
      },
    oauth: {
      domain: REACT_APP_COGNITO_DOMAIN,
      scope: [
        'email',
        'openid',
        'profile',
        'aws.cognito.signin.user.admin',
      ],
      clientID: REACT_APP_COGNITO_CLIENT_ID,
      responseType: 'code',
    },
    federationTarget: 'COGNITO_USER_POOLS',
};

const config = {
  ...awsConfig.Auth,
  oauth: {
    ...awsConfig.oauth,
    redirectSignIn: `${window.location.origin}/`,
    redirectSignOut: `${window.location.origin}/`,
  }
}

export default config;
