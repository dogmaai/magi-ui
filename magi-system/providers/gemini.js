const https = require('https');

class GeminiProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = 'Balthasar';
    this.model = 'gemini-1.5-flash';
  }

  async query(prompt) {
    try {
      console.log(`[MAGI-${this.name}] Processing query...`);
      
      const data = JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              const response = JSON.parse(body);
              if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                resolve({
                  provider: this.name,
                  response: response.candidates[0].content.parts[0].text,
                  confidence: 0.88,
                  status: 'success'
                });
              } else {
                reject(new Error('Invalid Gemini response'));
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
      });
    } catch (error) {
      return {
        provider: this.name,
        response: `Error: ${error.message}`,
        confidence: 0.0,
        status: 'error'
      };
    }
  }
}

module.exports = GeminiProvider;
