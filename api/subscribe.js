export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, first_name } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const apiKey = process.env.FLODESK_API_KEY;
  const segmentId = process.env.FLODESK_SEGMENT_ID;
  if (!apiKey) {
    console.error('FLODESK_API_KEY not set');
    return res.status(500).json({ error: 'Subscribe unavailable' });
  }

  const optinIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();

  const payload = {
    email,
    double_optin: false,
    optin_timestamp: new Date().toISOString()
  };
  if (first_name) payload.first_name = first_name;
  if (optinIp) payload.optin_ip = optinIp;
  if (segmentId) payload.segment_ids = [segmentId];

  try {
    const response = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
        'Content-Type': 'application/json',
        'User-Agent': 'Somare (www.somare.app)'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Flodesk error', response.status, data);
      return res.status(response.status).json({ error: 'Subscribe failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Flodesk request failed', err);
    return res.status(502).json({ error: 'Subscribe failed' });
  }
}
