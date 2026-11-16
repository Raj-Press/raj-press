import { Order } from '../types';

export function generateWhatsAppMessage(order: Order, pressPhone = '+919822000000'): string {
  const isBalancePending = order.balance_due > 0;
  
  const statusMr = 
    order.status === 'Ready' ? '✅ आपले काम तयार आहे (Ready for Delivery)' :
    order.status === 'Delivered' ? '📦 काम डिलिव्हर झाले आहे (Delivered)' :
    order.status === 'Printing' ? '🖨️ प्रिंटिंग चालू आहे (In Printing)' :
    order.status === 'Binding' ? '📚 बायडिंग चालू आहे (In Binding)' :
    '⏳ ऑर्डर नोंदवली आहे (Order Placed)';

  const lines = [
    `*राज प्रेस (RAJ PRESS) - पावती व ऑर्डर तपशील*`,
    `--------------------------------------`,
    `🧾 *पावती क्र. (Receipt No):* ${order.receipt_no}`,
    `📅 *तारीख (Date):* ${order.order_date}`,
    `👤 *ग्राहक (Customer):* ${order.party_name}`,
    `📦 *कामाचा तपशील (Job):* ${order.job_details}`,
    `🔢 *नग (Quantity):* ${order.quantity}`,
    `📄 *कागद (Paper):* ${order.paper_primary}`,
    `📐 *साईज (Size):* ${order.paper_size}`,
    `🎨 *शाई (Ink):* ${order.ink_colours.join(', ')}`,
    `--------------------------------------`,
    `💰 *एकूण रक्कम (Total):* ₹${Number(order.total_amount).toLocaleString('en-IN')}`,
    `💵 *ॲडव्हान्स (Advance):* ₹${Number(order.advance_amount).toLocaleString('en-IN')}`,
    isBalancePending 
      ? `⚠️ *येणे बाकी (Balance Due):* ₹${Number(order.balance_due).toLocaleString('en-IN')}` 
      : `✅ *शिल्लक (Balance):* ₹० (पूर्ण जमा / Fully Paid)`,
    order.promise_date ? `🗓️ *डिलिव्हरी तारीख:* ${order.promise_date}` : '',
    `📌 *सद्यस्थिती (Status):* ${statusMr}`,
    `--------------------------------------`,
    `धन्यवाद! अधिक माहितीसाठी संपर्क: ${pressPhone}`,
    `*राज प्रेस — दर्जेदार ऑफसेट, स्क्रीन व डिजिटल प्रिंटिंग*`
  ].filter(Boolean);

  return lines.join('\n');
}

export function openWhatsApp(order: Order, pressPhone?: string): void {
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
