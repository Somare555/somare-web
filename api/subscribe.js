export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const response = await fetch('https://api.buttondown.email/v1/subscribers', {
    method: 'POST',
    headers: {
      'Authorization': 'Token ' + process.env.BUTTONDOWN_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email_address: email })
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
