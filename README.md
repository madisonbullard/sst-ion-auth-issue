Issue opened [here](https://github.com/sst/ion/issues/555)

### The issue
In this repo, I'm creating an auth flow that should (I think) work for Google OIDC. The *deployed* SST app works as expected, but the `sst dev` behavior differs in unexpected ways.

Using SST CLI v0.0.419.

### Steps to recreate the issue
1. Make sure your `aws` CLI is properly configured to allow creating AWS ([Instructions here](https://sst.dev/chapters/configure-the-aws-cli.html))
2. Create a Google OIDC Client ID ([Instructions here](https://developers.google.com/identity/openid-connect/openid-connect))
3. Make sure you have SST CLI installed globally ([Instructions here](https://ion.sst.dev/docs/reference/cli/))
4. Run `sst install`
5. Create an SST Secret to store the OIDC Client ID created above
   1. `sst secret set GoogleOidcClientId <VALUE>`
6. Run `sst dev`, which should create all the AWS infra described in `sst.config.ts`
7. When the infra setup completes, the console should display a URL for the newly created `AuthRouter`. It should be something like `https://<UNIQUE_ID>.cloudfront.net`. In our Google Cloud credentials dashboard, we need to add an authorized redirect URI using this url. The URI must be the URL followed by `/google/callback` since that is what our auth handler (declared in `src/auth.ts`) expects, so for example `https://<UNIQUE_ID>.cloudfront.net/google/callback`. *Note: It may take 5 minutes to a few hours for settings to take effect*
8. Once the authorized redirect URI has been established, with `sst dev` running, we can `curl` our infra to test the auth flow, replacing the values in angled brackets with the corresponding values created above:
    ```
    curl -X GET https://<UNIQUE_ID>.cloudfront.net/google/authorize\?redirect_uri=https://<UNIQUE_ID>.cloudfront.net/google/callback\&response_type=code\&client_id=<GOOGLE_OIDC_CLIENT_ID>
    ```

**Expected result: A 200 response, with a JSON body detailing a 302 redirect**

**Observed result: A 200 response, but no response body**

The CloudWatch logs (see the sanitized logs in [cloudwatch_logs.txt](cloudwatch_logs.txt#L22)) show that when running `sst dev` and hitting the endpoint, the auth handler Lambda function is receiving the correct message (the JSON body with the 302 info).

We can actually view the expected result if we `sst deploy` instead of `sst dev`:
- Close the `sst dev` process
- Run `sst deploy`
- Once deploy completes, run the same `curl` command as above.

## Whats up with that??
