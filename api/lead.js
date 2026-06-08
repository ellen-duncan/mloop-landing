export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, nmls, source } = req.body || {};

  if (!name || !email || !nmls) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Name': name,
              'Email': email,
              'NMLS #': nmls,
              'Source': source || 'Meta Ads LP'
            }
          }]
        })
      }
    );

    if (!airtableRes.ok) {
      const errText = await airtableRes.text();
      console.error('Airtable error:', airtableRes.status, errText);
      return res.status(500).json({ error: 'Submit failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
