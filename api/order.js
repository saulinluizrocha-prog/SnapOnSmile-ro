export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = 'YZA0ZJDLZWYTZDK4ZC00YMJJLWJJNJATODZKNGJJMTE2MZQ4';
  const stream_code = 'u2z8e';

  const body = req.body;

  const post_fields = {
    stream_code,
    client: {
      phone: body.phone || '',
      name: body.name || '',
      surname: body.surname || null,
      email: body.email || null,
      address: body.address || null,
      ip: body.ip || null,
      country: body.country || null,
      city: body.city || null,
      postcode: body.postcode || null,
    },
    sub1: body.sub1 || req.query.sub1 || null,
    sub2: body.sub2 || req.query.sub2 || null,
    sub3: body.sub3 || req.query.sub3 || null,
    sub4: body.sub4 || req.query.sub4 || null,
    sub5: body.sub5 || req.query.sub5 || null,
  };

  try {
    const response = await fetch('https://order.drcash.sh/v1/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(post_fields),
    });

    if (response.ok) {
      return res.status(200).json({ redirect: '/thanks' });
    } else {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
