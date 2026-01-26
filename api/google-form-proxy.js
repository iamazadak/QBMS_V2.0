import axios from 'axios';

export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const googleScriptUrl = 'https://script.google.com/a/macros/gramtarang.org.in/s/AKfycbx6KmjnR5lBas-Dr6F7aC4YhUEuVH8jgPLhO6GUr8PRDd_xXmis71kHjMUR3iZz0bsj/exec';

    console.log("Proxying to Google Script:", googleScriptUrl);

    try {
      const response = await axios.post(googleScriptUrl, req.body);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(response.data));
    } catch (error) {
      console.error("Error calling Google Apps Script:", error.response ? error.response.data : error.message);

      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'An internal server error occurred.',
        details: error.message
      }));
    }
  } catch (error) {
    console.error("Proxy Error:", error.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'An internal server error occurred.',
      details: error.message
    }));
  }
};
