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

    const auth = new sst.aws.Auth("Auth", {
      authenticator: {
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
