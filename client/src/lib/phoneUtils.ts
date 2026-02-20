/**
 * Normalize phone numbers to E.164 format for Moroccan numbers
 * Handles various input formats:
 * - 0690578168 → +212690578168
 * - +2120655539384 (extra 0) → +212655539384
 * - 212612345678 → +212612345678
 * - 00212612345678 → +212612345678
 * - 612345678 → +212612345678
 * - +212 6XX XXX XXX (with spaces) → +212XXXXXXXXX
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  
  // Remove all whitespace, dashes, parentheses
  let phone = rawPhone.replace(/[\s\-\(\)\.]/g, '');
  
  // Handle international dialing prefix "00" (common in Morocco)
  if (phone.startsWith('00')) {
    phone = '+' + phone.substring(2);
  }
  
  // Handle numbers with + prefix
  if (phone.startsWith('+')) {
    // Fix +2120XXXXXXXXX format (extra 0 after country code)
    if (phone.startsWith('+2120')) {
      phone = '+212' + phone.substring(5);
    }
    // Fix +0XXXXXXXXX format
    else if (phone.startsWith('+0')) {
      phone = '+212' + phone.substring(2);
    }
    return phone;
  }
  
  // Handle numbers starting with country code without +
  if (phone.startsWith('212')) {
    // Fix 2120XXXXXXXXX format (extra 0 after country code)
    if (phone.startsWith('2120') && phone.length > 12) {
      phone = '+212' + phone.substring(4);
    } else {
      phone = '+' + phone;
    }
    return phone;
  }
  
  // Handle numbers starting with 0 (local Moroccan format)
  if (phone.startsWith('0')) {
    phone = '+212' + phone.substring(1);
    return phone;
  }
  
  // Handle 9-digit numbers (assume Moroccan mobile without prefix)
  if (phone.length === 9 && /^[5-7]/.test(phone)) {
    phone = '+212' + phone;
    return phone;
  }
  
  // Return as-is if no pattern matched
  return phone;
}

/**
 * Format phone for WhatsApp API (remove + prefix)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  // WhatsApp API expects number without + prefix
  return normalized.startsWith('+') ? normalized.substring(1) : normalized;
}
