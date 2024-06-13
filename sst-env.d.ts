/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    Auth: {
      publicKey: string
      type: "sst.aws.Auth"
    }
    AuthRouter: {
      type: "sst.aws.Router"
      url: string
    }
    GoogleOidcClientId: {
      type: "sst.sst.Secret"
      value: string
    }
  }
}
export {}