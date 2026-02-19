export function generateReferralCode(firstName: string, lastName: string): string {
  const base = (firstName.substring(0, 3) + lastName.substring(0, 3)).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return base + random;
}

export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
