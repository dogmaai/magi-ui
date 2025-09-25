const https = require('https');

class OpenAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = 'Melchior';
    this.model = 'gpt-4o-mini';
  }

  async query(prompt) {
    try {
      console.log(`[MAGI-${this.name}] Processing query...`);
      
      const data = JSON.stringify({
        model: this.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 1000,
        temperature: 0.7
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
              if (response.choices && response.choices[0]) {
                resolve({
                  provider: this.name,
                  response: response.choices[0].message.content,
                  confidence: 0.85,
                  status: 'success'
                });
              } else {
                reject(new Error('Invalid OpenAI response'));
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

module.exports = OpenAIProvider;
