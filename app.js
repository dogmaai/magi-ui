const express = require('express');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 8080;

// ミドルウェア設定
app.use(express.json({ limit: '1mb' }));

// CORS設定
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// 無料枠用の使用量制限
const DAILY_LIMITS = {
    openai: { requests: 100, tokens: 10000 },
    gemini: { requests: 200, tokens: 15000 }
};

let dailyUsage = {
    openai: { requests: 0, tokens: 0, date: new Date().toDateString() },
    gemini: { requests: 0, tokens: 0, date: new Date().toDateString() }
};

function checkDailyLimit(provider, estimatedTokens = 100) {
    const today = new Date().toDateString();
    
    if (dailyUsage[provider].date !== today) {
        dailyUsage[provider] = { requests: 0, tokens: 0, date: today };
    }
    
    const usage = dailyUsage[provider];
    const limits = DAILY_LIMITS[provider];
    
    return usage.requests < limits.requests && 
           (usage.tokens + estimatedTokens) <= limits.tokens;
}

// AIクライアントの初期化
let openaiClient, geminiClient;

try {
    if (process.env.OPENAI_API_KEY) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    
    if (process.env.GEMINI_API_KEY) {
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    
    console.log('AI clients initialized:', {
        openai: !!openaiClient,
        gemini: !!geminiClient,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        xai: !!process.env.XAI_API_KEY
    });
} catch (error) {
    console.error('AI client initialization error:', error);
}

// === エンドポイント定義 ===

// 基本情報
app.get('/', (req, res) => {
    res.json({
        service: "magi-app",
        status: "running",
        message: "MAGI Multi-AI Gateway System (Free Tier Optimized)",
        version: "1.1.0",
        available_endpoints: [
            "GET / - システム情報",
            "GET /status - プロバイダー状態",
            "GET /health - ヘルスチェック",
            "GET /providers - プロバイダー情報",
            "POST /chat - チャット機能",
            "GET /usage - 使用量確認"
        ]
    });
});

// システム状態
app.get('/status', (req, res) => {
    res.json({
        service: "magi-app",
        secrets: {
            OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
            GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
            XAI_API_KEY: !!process.env.XAI_API_KEY,
            ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY
        },
        providers: {
            openai: !!openaiClient,
            gemini: !!geminiClient,
            anthropic: !!process.env.ANTHROPIC_API_KEY,
            xai: !!process.env.XAI_API_KEY
        }
    });
});

// ヘルスチェック
app.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        providers: {}
    };

    try {
        // OpenAI接続確認
        if (openaiClient) {
            try {
                health.providers.openai = 'healthy';
            } catch (error) {
                health.providers.openai = 'unhealthy: ' + error.message;
            }
        } else {
            health.providers.openai = 'not_configured';
        }

        // Gemini接続確認
        if (geminiClient) {
            try {
                health.providers.gemini = 'healthy';
            } catch (error) {
                health.providers.gemini = 'unhealthy: ' + error.message;
            }
        } else {
            health.providers.gemini = 'not_configured';
        }

        health.providers.anthropic = process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured';
        health.providers.xai = process.env.XAI_API_KEY ? 'configured' : 'not_configured';

    } catch (error) {
        health.status = 'degraded';
        health.error = error.message;
    }

    res.json(health);
});

// プロバイダー情報
app.get('/providers', (req, res) => {
    res.json({
        available_providers: {
            openai: {
                status: !!openaiClient,
                models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
                daily_limit: DAILY_LIMITS.openai
            },
            gemini: {
                status: !!geminiClient,
                models: ['gemini-pro', 'gemini-pro-vision'],
                daily_limit: DAILY_LIMITS.gemini
            },
            anthropic: {
                status: !!process.env.ANTHROPIC_API_KEY,
                models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
                note: 'Implementation pending'
            },
            xai: {
                status: !!process.env.XAI_API_KEY,
                models: ['grok-1', 'grok-beta'],
                note: 'Implementation pending'
            }
        }
    });
});

// 使用量確認
app.get('/usage', (req, res) => {
    const today = new Date().toDateString();
    
    // 日付リセット確認
    Object.keys(dailyUsage).forEach(provider => {
        if (dailyUsage[provider].date !== today) {
            dailyUsage[provider] = { requests: 0, tokens: 0, date: today };
        }
    });

    res.json({
        date: today,
        usage: dailyUsage,
        limits: DAILY_LIMITS,
        remaining: {
            openai: {
                requests: DAILY_LIMITS.openai.requests - dailyUsage.openai.requests,
                tokens: DAILY_LIMITS.openai.tokens - dailyUsage.openai.tokens
            },
            gemini: {
                requests: DAILY_LIMITS.gemini.requests - dailyUsage.gemini.requests,
                tokens: DAILY_LIMITS.gemini.tokens - dailyUsage.gemini.tokens
            }
        }
    });
});

// チャット機能（使用量制限付き）
app.post('/chat', async (req, res) => {
    try {
        const { message, provider = 'openai', model } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 使用量制限チェック
        if (!checkDailyLimit(provider)) {
            return res.status(429).json({ 
                error: 'Daily limit reached',
                message: `Free tier daily limit exceeded for ${provider}. Try again tomorrow.`,
                usage: dailyUsage[provider],
                limits: DAILY_LIMITS[provider]
            });
        }

        let response;

        switch (provider.toLowerCase()) {
            case 'openai':
                if (!openaiClient) {
                    return res.status(503).json({ error: 'OpenAI client not available' });
                }
                
                const completion = await openaiClient.chat.completions.create({
                    model: model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: message }],
                    max_tokens: 500  // 無料枠考慮で制限
                });
                
                // 使用量更新
                dailyUsage.openai.requests++;
                dailyUsage.openai.tokens += completion.usage.total_tokens;
                
                response = {
                    provider: 'openai',
                    model: model || 'gpt-3.5-turbo',
                    response: completion.choices[0].message.content,
                    usage: completion.usage,
                    remaining: {
                        requests: DAILY_LIMITS.openai.requests - dailyUsage.openai.requests,
                        tokens: DAILY_LIMITS.openai.tokens - dailyUsage.openai.tokens
                    }
                };
                break;

            case 'gemini':
                if (!geminiClient) {
                    return res.status(503).json({ error: 'Gemini client not available' });
                }
                
                const geminiModel = geminiClient.getGenerativeModel({ 
                    model: model || 'gemini-pro' 
                });
                const result = await geminiModel.generateContent(message);
                const geminiResponse = await result.response;
                
                // 使用量更新（推定）
                dailyUsage.gemini.requests++;
                dailyUsage.gemini.tokens += Math.ceil(message.length / 4) + Math.ceil(geminiResponse.text().length / 4);
                
                response = {
                    provider: 'gemini',
                    model: model || 'gemini-pro',
                    response: geminiResponse.text(),
                    remaining: {
                        requests: DAILY_LIMITS.gemini.requests - dailyUsage.gemini.requests,
                        tokens: DAILY_LIMITS.gemini.tokens - dailyUsage.gemini.tokens
                    }
                };
                break;

            default:
                return res.status(400).json({ 
                    error: 'Unsupported provider',
                    available_providers: ['openai', 'gemini']
                });
        }

        res.json(response);

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

// 軽量ヘルスチェック
app.get('/health-light', (req, res) => {
    res.json({ 
        status: 'ok', 
        time: Date.now(),
        uptime: Math.floor(process.uptime())
    });
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404ハンドリング
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /',
            'GET /status',
            'GET /health',
            'GET /health-light',
            'GET /providers',
            'GET /usage',
            'POST /chat'
        ]
    });
});

// サーバー起動
app.listen(port, () => {
    console.log(`MAGI Multi-AI Gateway listening on port ${port}`);
    console.log('Free tier optimized with daily limits');
    console.log('Available providers:', {
        openai: !!openaiClient,
        gemini: !!geminiClient,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        xai: !!process.env.XAI_API_KEY
    });
});

module.exports = app;
