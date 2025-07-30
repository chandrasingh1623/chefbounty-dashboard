declare module 'passport-linkedin-oauth2' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName: string;
      givenName: string;
    };
    emails?: Array<{
      value: string;
      type?: string;
    }>;
    photos?: Array<{
      value: string;
    }>;
    provider: string;
    _raw: string;
    _json: {
      id: string;
      localizedFirstName?: string;
      localizedLastName?: string;
      profilePicture?: {
        displayImage?: string;
        'displayImage~'?: {
          elements?: Array<{
            identifiers: Array<{
              identifier: string;
            }>;
          }>;
        };
      };
      firstName?: {
        localized?: {
          en_US: string;
        };
      };
      lastName?: {
        localized?: {
          en_US: string;
        };
      };
      headline?: {
        localized?: {
          en_US: string;
        };
      };
      vanityName?: string;
    };
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
    state?: boolean;
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