
import { post } from 'axios';

export default async (req, res) => {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or be more specific: 'http://localhost:5173'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const googleScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!googleScriptUrl) {
      throw new Error("APPS_SCRIPT_URL environment variable is not set.");
    }

    console.log("Request Body:", req.body);

    try {
      const response = await post(googleScriptUrl, req.body);
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error calling Google Apps Script:", error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};
