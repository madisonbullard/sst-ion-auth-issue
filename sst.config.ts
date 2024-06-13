/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "sst-ion-auth-issue",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const GOOGLE_OIDC_CLIENT_ID = new sst.Secret("GoogleOidcClientId");

    const AUTH_PRIVATE_KEY = await aws.ssm.getParameterOutput({
      name: `ION_ISSUE_REPRODUCTION__AUTH_PRIVATE_KEY`,
    }).insecureValue;
    const AUTH_PUBLIC_KEY = await aws.ssm.getParameterOutput({
      name: `ION_ISSUE_REPRODUCTION__AUTH_PUBLIC_KEY`,
    }).insecureValue;

    const auth = new sst.aws.Auth("Auth", {
      authenticator: {
        environment: {
          AUTH_PRIVATE_KEY,
          AUTH_PUBLIC_KEY,
        },
        handler: "src/auth.handler",
        link: [GOOGLE_OIDC_CLIENT_ID],
      },
    });

    const authRouter = new sst.aws.Router("AuthRouter", {
      routes: {
        "/*": auth.url.apply((url) => url),
      },
    });
  },
});
