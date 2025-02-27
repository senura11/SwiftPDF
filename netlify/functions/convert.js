 const fetch = require('node-fetch');
exports.handler = async (event) => {
  const API_KEY = process.env.CONVERT_API_KEY; // Environment variable එකෙන් API යතුර ගන්නවා
  const format = event.queryStringParameters.format;
  const pdfBuffer = Buffer.from(event.body, 'base64');

  const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/${format}?Secret=${API_KEY}`, {
    method: 'POST',
    body: pdfBuffer,
  });

  const data = await response.buffer();
  return {
    statusCode: 200,
    body: data.toString('base64'),
    isBase64Encoded: true,
  };
};