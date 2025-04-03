// File: api/zoloz-proxy.js (untuk Vercel - versi query string)

import https from 'https';
import { URLSearchParams } from 'url';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const {
    method,
    accessKey,
    version,
    signType,
    reqTime,
    sign,
    bizContent
  } = req.body;

  const payload = JSON.stringify({ bizContent });

  // Buat query string
  const params = new URLSearchParams({
    method,
    accessKey,
    version,
    signType,
    reqTime,
    sign
  });

  const options = {
    hostname: 'id-production-api.zoloz.com',
    path: `/api/v1/zoloz/facecapture/initialize?${params.toString()}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Expect': ''
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
