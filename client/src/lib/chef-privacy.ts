/**
 * Chef Privacy Utilities
 * Handles chef identity masking during the bidding process to prevent hosts 
 * from bypassing ChefBounty by contacting chefs directly before accepting bids.
 */

export interface MaskedChefInfo {
  maskedName: string;
  showFullInfo: boolean;
  privacyMessage: string;
}

/**
 * Masks a chef's name for privacy during bidding process
 * Format: FirstInitial***LastInitial
 * Example: "Keeana Gondy" → "K***y"
 * 
 * @param fullName - The chef's full name
 * @returns Masked name string
 */
export function getMaskedName(fullName: string): string {
  if (!fullName || fullName.trim().length === 0) {
    return "Chef***";
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 1) {
    // Single name: "John" → "J***"
    const name = nameParts[0];
    return name.length > 1 ? `${name[0]}***` : name;
  }
  
  // Multiple names: take first and last
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  const firstInitial = firstName[0] || '';
  const lastInitial = lastName[lastName.length - 1] || '';
  
  return `${firstInitial}***${lastInitial}`;
}

/**
 * Determines if chef information should be masked based on bid status
 * 
 * @param bidStatus - Current status of the bid ('pending', 'accepted', 'rejected')
 * @param userRole - Role of the viewing user ('host', 'chef')
 * @returns MaskedChefInfo object with masking details
 */
export function getChefPrivacyInfo(
  bidStatus: string, 
  userRole: string,
  chefName: string
): MaskedChefInfo {
  // Only mask for hosts viewing pending bids
  const shouldMask = userRole === 'host' && bidStatus === 'pending';
  
  return {
    maskedName: shouldMask ? getMaskedName(chefName) : chefName,
    showFullInfo: !shouldMask,
    privacyMessage: shouldMask 
      ? "Full profile details are shared after accepting a bid."
      : (bidStatus === 'accepted' && userRole === 'host') 
        ? "All communication must take place within ChefBounty. Contact information is securely managed through in-app messaging."
        : ""
  };
}

/**
 * Determines if contact information should be visible
 * 
 * @param bidStatus - Current status of the bid
 * @param userRole - Role of the viewing user
 * @returns Whether contact info should be shown
 */
export function shouldShowContactInfo(bidStatus: string, userRole: string): boolean {
  // Show contact info for:
  // 1. Chefs viewing their own bids
  // 2. Hosts viewing accepted bids
  // 3. Admin users (if implemented)
  return userRole === 'chef' || (userRole === 'host' && bidStatus === 'accepted');
}

/**
 * Gets the appropriate privacy message for different contexts
 * 
 * @param context - Where the message will be displayed ('bid-card', 'bid-list', 'modal')
 * @param bidStatus - Current bid status
 * @returns Privacy message string
 */
export function getPrivacyMessage(context: string, bidStatus: string): string {
  if (bidStatus === 'accepted') {
    return "";
  }
  
  const messages = {
    'bid-card': "Full profile details are shared after accepting a bid.",
    'bid-list': "Chef details available after bid acceptance.",
    'modal': "Complete chef information including contact details will be revealed once you accept this bid."
  };
  
  return messages[context as keyof typeof messages] || messages['bid-card'];
}