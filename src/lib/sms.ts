'use server';
/**
 * @fileOverview Sendexa SMS Service Utility (Server Side)
 * Handles accurate SMS notifications using Bearer token authentication.
 */

export async function sendSms(to: string, message: string) {
  // Clean token: Remove whitespaces and potential trailing commas
  const token = (process.env.SENDEXA_API_TOKEN || '').replace(/\s/g, '').replace(/,$/, '');
  const senderId = process.env.SENDEXA_SENDER_ID || 'BLUE BIRDS';
  const url = 'https://api.sendexa.co/v1/sms/send';

  if (!token) {
    console.error('SMS Error: SENDEXA_API_TOKEN is missing.');
    return { success: false, error: 'API Token missing' };
  }

  // Ghana formatting: 233XXXXXXXXX
  let phone = to.replace(/[^0-9]/g, '');
  if (phone.startsWith('0') && phone.length === 10) {
    phone = '233' + phone.substring(1);
  } else if (!phone.startsWith('233') && phone.length === 9) {
    phone = '233' + phone;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: phone,
        from: senderId,
        message: `ZiCash Alert: ${message}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMS Gateway Error:', response.status, errorText);
      return { success: false, error: `Gateway error: ${response.status}` };
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error: any) {
    console.error('SMS Failure:', error.message);
    return { success: false, error: error.message };
  }
}
