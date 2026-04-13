declare module 'passport-facebook' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
      middleName?: string;
    };
    emails?: Array<{
      value: string;
      verified?: boolean;
    }>;
    photos?: Array<{
      value: string;
    }>;
    profileUrl?: string;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    profileFields?: string[];
    scope?: string[];
    enableProof?: boolean;
    passReqToCallback?: boolean;
  }

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export type VerifyFunctionWithRequest = (
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction | VerifyFunctionWithRequest);
    name: string;
  }
}