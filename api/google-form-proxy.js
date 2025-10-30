
const axios = require('axios');

module.exports = async (req, res) => {
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

    // Forward the request body to the Google Apps Script
    const response = await axios.post(googleScriptUrl, req.body);

    // Return the response from the Google Apps Script to the client
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Error in proxy function:", error.message);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};
