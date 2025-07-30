// @ts-ignore
import OAuth2Strategy from 'passport-oauth2';
import jwt from 'jsonwebtoken';

export class LinkedInOpenIDStrategy extends OAuth2Strategy {
  name = 'linkedin';

  constructor(options: any, verify: any) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: options.clientID,
      clientSecret: options.clientSecret,
      callbackURL: options.callbackURL,
      scope: options.scope || ['openid', 'profile', 'email'],
      state: true,
    }, async (accessToken: string, refreshToken: string, params: any, profile: any, done: any) => {
      try {
        // LinkedIn returns user info in the id_token when using OpenID Connect
        const idToken = params.id_token;
        
        if (!idToken) {
          // Fallback to userinfo endpoint
          const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          });

          if (!userInfoResponse.ok) {
            throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
          }

          const userInfo = await userInfoResponse.json();
          
          const profile = {
            id: userInfo.sub,
            displayName: userInfo.name,
            name: {
              familyName: userInfo.family_name,
              givenName: userInfo.given_name,
            },
            emails: userInfo.email ? [{ value: userInfo.email, type: 'account' }] : [],
            photos: userInfo.picture ? [{ value: userInfo.picture }] : [],
            provider: 'linkedin',
            _raw: JSON.stringify(userInfo),
            _json: userInfo
          };

          return verify(accessToken, refreshToken, profile, done);
        } else {
          // Decode the ID token (in production, you should verify the signature)
          const decoded = jwt.decode(idToken) as any;
          
          const profile = {
            id: decoded.sub,
            displayName: decoded.name,
            name: {
              familyName: decoded.family_name,
              givenName: decoded.given_name,
            },
            emails: decoded.email ? [{ value: decoded.email, type: 'account' }] : [],
            photos: decoded.picture ? [{ value: decoded.picture }] : [],
            provider: 'linkedin',
            _raw: JSON.stringify(decoded),
            _json: decoded
          };

          return verify(accessToken, refreshToken, profile, done);
        }
      } catch (error) {
        return done(error);
      }
    });

    // @ts-ignore
    this.authorizationParams = () => {
      return {
        response_type: 'code'
      };
    };
  }

  userProfile(accessToken: string, done: any) {
    // This method is called by passport-oauth2 by default
    // We override the verify function above to handle the profile ourselves
    done(null, {});
  }
}