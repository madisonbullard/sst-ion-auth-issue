### Steps to recreate the issue
1. Make sure your `aws` CLI is properly configured to allow creating AWS ([Instructions here](https://sst.dev/chapters/configure-the-aws-cli.html))
2. Create a public/private keypair to put into SSM. We need to use SSM rather than SST Secret because SST Secret doesn't support multiline values.
   1. `openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:4096`
   2. `openssl rsa -pubout -in private.pem -out public.pem`
   3. `aws ssm put-parameter --name ION_ISSUE_REPRODUCTION__AUTH_PUBLIC_KEY --type SecureString --value  "$(cat public.pem)"`
   4. `aws ssm put-parameter --name ION_ISSUE_REPRODUCTION__AUTH_PRIVATE_KEY --type SecureString --value "$(cat private.pem)"`
3. Create a Google OIDC Client ID ([Instructions here](https://developers.google.com/identity/openid-connect/openid-connect))
4. Make sure you have SST CLI installed globally ([Instructions here](https://ion.sst.dev/docs/reference/cli/))
5. Run `sst install`
6. Create an SST Secret to store the OIDC Client ID created above
   1. `sst secret set GoogleOidcClientId <VALUE>`
7. Run `sst dev`, which should create all the AWS infra described in `sst.config.ts`
8. When the infra setup completes, the console should display a URL for the newly created `AuthRouter`. It should be something like `https://<UNIQUE_ID>.cloudfront.net`. In our Google Cloud credentials dashboard, we need to add an authorized redirect URI using this url. The URI must be the URL followed by `/google/callback` since that is what our auth handler (declared in `src/auth.ts`) expects, so for example `https://<UNIQUE_ID>.cloudfront.net/google/callback`. *Note: It may take 5 minutes to a few hours for settings to take effect*
9. Once the authorized redirect URI has been established, with `sst dev` running, we can `curl` our infra to test the auth flow, replacing the values in angled brackets with the corresponding values created above:
    ```
    curl -X GET https://<UNIQUE_ID>.cloudfront.net/google/authorize\?redirect_uri=https://<UNIQUE_ID>.cloudfront.net/google/callback\&response_type=code\&client_id=<GOOGLE_OIDC_CLIENT_ID>
    ```

**Expected result: A 200 response, with a JSON body detailing a 302 redirect**

**Observed result: A 200 response, but no response body**

We can actually view the expected result if we `sst deploy` instead of `sst dev`:
- Close the `sst dev` process
- Run `sst deploy`
- Once deploy completes, run the same `curl` command as above.

## Whats up with that??
