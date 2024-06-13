import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { GoogleAdapter } from "sst/auth/adapter";
import { AuthHandler } from "sst/auth/index";
import { createSessionBuilder } from "sst/auth";

type TAccount = { accountId: string; email: string };

const sessions = createSessionBuilder<{ account: TAccount }>();

const app = AuthHandler({
  session: sessions,
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID: Resource.GoogleOidcClientId.value,
    }),
  },
  callbacks: {
    auth: {
      async allowClient() {
        return true;
      },
      async success(ctx, input) {
        console.log("input", input);
        if (input.provider === "google") {
          const account = {
            accountId: "foo",
            email: "some-email@fake.com",
          };
          return ctx.session({
            type: "account",
            properties: account,
          });
        }
        return new Response("wtf", {
          status: 400,
          headers: {
            "content-type": "text/plain",
          },
        });
      },
    },
  },
});

export const handler = handle(app);
