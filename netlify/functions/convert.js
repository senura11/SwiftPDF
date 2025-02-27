const fetch = require('node-fetch');

exports.handler = async (event) => {
  const API_KEY = process.env.CONVERT_API_KEY; // Environment variable එකෙන් API යතුර ගන්නවා
  const format = event.path.split('/').pop(); // URL path එකෙන් format එක ගන්නවා (e.g., "docx")
  const pdfBuffer = event.body; // Client වෙතින් එන PDF file එක

  try {
    const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/${format}?Secret=${API_KEY}`, {
      method: 'POST',
      body: pdfBuffer,
      headers: { 'Content-Type': 'application/pdf' }
    });

    if (!response.ok) {
      return { statusCode: response.status, body: 'Conversion failed' };
    }

    const data = await response.buffer();
    return {
      statusCode: 200,
      body: data.toString('base64'),
      isBase64Encoded: true,
      headers: {
        'Content-Type': response.headers.get('Content-Type'),
        'Content-Disposition': response.headers.get('Content-Disposition')
      }
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Conversion failed' }) };
  }
};