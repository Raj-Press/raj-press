import { Order } from '../types';

export const RAJ_PRESS_PHONE = '9822117164';

export function generateWhatsAppMessage(order: Order, pressPhone = RAJ_PRESS_PHONE): string {
  const isBalancePending = order.balance_due > 0;
  
  if (isBalancePending) {
    return [
      `*राज प्रेस (RAJ PRESS)*`,
      `--------------------------------------`,
      `सस्नेह नमस्कार, *${order.party_name}* जी,`,
      ``,
      `आपल्या कामाची (पावती क्र. #${order.receipt_no}) उर्वरित बाकी रक्कम:`,
      `*येणे बाकी (Balance to be paid): ₹${Number(order.balance_due).toLocaleString('en-IN')}*`,
      ``,
      `कृपया सदर बाकी रक्कम जमा करावी ही नम्र विनंती.`,
      `--------------------------------------`,
      `धन्यवाद!`,
      `अधिक माहितीसाठी संपर्क: ${pressPhone}`,
      `*राज प्रेस — ऑफसेट व डिजिटल प्रिंटिंग*`
    ].join('\n');
  }

  return [
    `*राज प्रेस (RAJ PRESS)*`,
    `--------------------------------------`,
    `सस्नेह नमस्कार, *${order.party_name}* जी,`,
    ``,
    `आपल्या कामाची (पावती क्र. #${order.receipt_no}) सर्व रक्कम पूर्ण जमा झाली आहे.`,
    `*शिल्लक (Balance): ₹० (पूर्ण जमा / Fully Paid)*`,
    ``,
    `आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद!`,
    `--------------------------------------`,
    `अधिक माहितीसाठी संपर्क: ${pressPhone}`,
    `*राज प्रेस — ऑफसेट व डिजिटल प्रिंटिंग*`
  ].join('\n');
}

export function openWhatsApp(order: Order, pressPhone: string = RAJ_PRESS_PHONE): void {
  const message = generateWhatsAppMessage(order, pressPhone);
  const encoded = encodeURIComponent(message);
  
  // Clean phone number (remove dashes, spaces, +)
  let phone = (order.party_phone || '').replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const url = phone 
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, '_blank');
}
