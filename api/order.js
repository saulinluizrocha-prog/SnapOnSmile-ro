/**
 * Vercel Serverless Function — /api/order
 * GEO: Romania (RO)
 * Smart phone validation + normalization server-side
 * Backend: drcash.sh
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  /* ── SERVER-SIDE PHONE VALIDATION ── */
  function normalizePhoneRO(raw = '') {
    let s = String(raw).replace(/[\s\-().]/g, '');
    if (/^\+40/.test(s))   return s;
    if (/^0040/.test(s))   return '+40' + s.slice(4);
    if (/^40\d{9}$/.test(s)) return '+' + s;
    if (/^0[67]\d{8}$/.test(s)) return '+4' + s;
    if (/^[67]\d{8}$/.test(s))  return '+40' + s;
    return s;
  }

  function isValidRO(phone) {
    return /^\+40[267]\d{8}$/.test(phone);
  }

  const phoneName  = String(body.name  || '').trim();
  const phoneRaw   = String(body.phone || '').trim();
  const normalized = normalizePhoneRO(phoneRaw);

  // Reject clearly invalid names/phones to avoid garbage, but remain relatively lenient
  if (!phoneName || phoneName.length < 2) {
    return res.status(400).json({ error: 'invalid_name' });
  }
  if (!phoneRaw || (!isValidRO(normalized) && normalized.length < 8)) {
    return res.status(400).json({ error: 'invalid_phone', raw: phoneRaw, normalized });
  }

  /* ── CONFIG ── */
  const TOKEN       = 'YZA0ZJDLZWYTZDK4ZC00YMJJLWJJNJATODZKNGJJMTE2MZQ4';
  const STREAM_CODE = 'u2z8e';

  const getParam = (key) => body[key] || req.query?.[key] || null;

  const payload = {
    stream_code: STREAM_CODE,
    client: {
      phone:    normalized,
      name:     phoneName,
      surname:  getParam('surname'),
      email:    getParam('email'),
      address:  getParam('address'),
      ip:       req.headers['x-forwarded-for']?.split(',')[0]?.trim() || null,
      country:  'RO',
      city:     getParam('city'),
      postcode: getParam('postcode'),
    },
    sub1: getParam('sub1'),
    sub2: getParam('sub2'),
    sub3: getParam('sub3'),
    sub4: getParam('sub4'),
    sub5: getParam('sub5') || getParam('gclid'),
  };

  try {
    const upstream = await fetch('https://order.drcash.sh/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();

    if (upstream.ok) {
      return res.status(200).json({ redirect: '/thanks' });
    } else {
      console.error('[order] upstream error', upstream.status, text);
      return res.status(upstream.status).json({ error: 'upstream_error', detail: text });
    }
  } catch (err) {
    console.error('[order] fetch error', err);
    return res.status(500).json({ error: 'network_error', message: err.message });
  }
}
