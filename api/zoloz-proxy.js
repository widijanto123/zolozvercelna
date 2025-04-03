// File: api/zoloz-proxy.js (Vercel - FINAL FIX: parameter via HTTP headers)

import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const {
    method,
    access_key,
    version,
    sign_type,
    req_time,
    sign,
    bizContent
  } = req.body;

  const payload = JSON.stringify({ bizContent });

  const options = {
    hostname: 'id-production-api.zoloz.com',
    path: '/api/v1/zoloz/facecapture/initialize',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_key': access_key,
      'sign_type': sign_type,
      'req_time': req_time,
      'sign': sign,
      'version': version,
      'method': method,
      'Expect': '',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => (data += chunk));
    proxyRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        res.status(200).json(parsed);
      } catch (e) {
        res.status(500).json({ error: 'Invalid response from Zoloz', raw: data });
      }
    });
  });

  proxyReq.on('error', (e) => {
    res.status(500).json({ error: 'Request error', detail: e.message });
  });

  proxyReq.write(payload);
  proxyReq.end();
}
