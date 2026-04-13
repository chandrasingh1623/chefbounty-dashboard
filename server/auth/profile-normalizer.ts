import type { OAuthProfile } from './passport-config';

export function normalizeProviderProfile(
  provider: 'facebook' | 'linkedin',
  rawProfile: any
): OAuthProfile {
  switch (provider) {
    case 'facebook':
      return normalizeFacebookProfile(rawProfile);
    case 'linkedin':
      return normalizeLinkedInProfile(rawProfile);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function normalizeFacebookProfile(profile: any): OAuthProfile {
  const email = profile.emails?.[0]?.value;
  const photo = profile.photos?.[0]?.value;
  
  // Facebook photo URLs need modification for larger size
  const avatarUrl = photo ? photo.replace(/\/\d+x\d+\//, '/200x200/') : undefined;
  
  return {
    provider: 'facebook',
    providerAccountId: profile.id,
    email,
    firstName: profile.name?.givenName,
    lastName: profile.name?.familyName,
    fullName: profile.displayName,
    avatarUrl,
    profileUrl: profile.profileUrl || `https://facebook.com/${profile.id}`,
  };
}

function normalizeLinkedInProfile(profile: any): OAuthProfile {
  // LinkedIn v2 API response structure
  const email = profile.emails?.[0]?.value;
  
  // Extract profile picture URL from LinkedIn's complex structure
  let avatarUrl: string | undefined;
  if (profile.photos?.length > 0) {
    avatarUrl = profile.photos[0].value;
  } else if (profile._json?.profilePicture?.displayImage) {
    const elements = profile._json.profilePicture['displayImage~']?.elements;
    if (elements?.length > 0) {
      // Get the largest available image
      const largestImage = elements[elements.length - 1];
      avatarUrl = largestImage?.identifiers?.[0]?.identifier;
    }
  }
  
  // Extract name from localized fields
  const firstName = profile.name?.givenName || 
    profile._json?.localizedFirstName || 
    profile._json?.firstName?.localized?.en_US;
    
  const lastName = profile.name?.familyName || 
    profile._json?.localizedLastName || 
    profile._json?.lastName?.localized?.en_US;
  
  const fullName = profile.displayName || `${firstName} ${lastName}`.trim();
  
  // LinkedIn headline from profile
  const headline = profile._json?.headline?.localized?.en_US || 
    profile._json?.headline;
  
  return {
    provider: 'linkedin',
    providerAccountId: profile.id,
    email,
    firstName,
    lastName,
    fullName,
    avatarUrl,
    headline,
    profileUrl: `https://linkedin.com/in/${profile._json?.vanityName || profile.id}`,
  };
}

// Helper to fetch additional LinkedIn data if needed
export async function fetchLinkedInEmail(accessToken: string): Promise<string | undefined> {
  try {
    const response = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'cache-control': 'no-cache',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    if (!response.ok) return undefined;
    
    const data = await response.json();
    return data.elements?.[0]?.['handle~']?.emailAddress;
  } catch (error) {
    console.error('Failed to fetch LinkedIn email:', error);
    return undefined;
  }
}