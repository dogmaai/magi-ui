const https = require('https');

class AnthropicProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.name = 'Caspar';
    this.model = 'claude-3-5-sonnet-20241022';
  }

  async query(prompt) {
    try {
      console.log(`[MAGI-${this.name}] Processing query...`);
      
      const data = JSON.stringify({
        model: this.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
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
              if (response.content && response.content[0]) {
                resolve({
                  provider: this.name,
                  response: response.content[0].text,
                  confidence: 0.90,
                  status: 'success'
                });
              } else {
                reject(new Error('Invalid Anthropic response'));
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

module.exports = AnthropicProvider;
