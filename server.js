console.log('[MAGI] Starting MAGI System initialization...');

const express = require('express');
const path = require('path');

// MAGI Providers
const OpenAIProvider = require('./magi-system/providers/openai.js');
const GeminiProvider = require('./magi-system/providers/gemini.js');
const AnthropicProvider = require('./magi-system/providers/anthropic.js');
const MAGIConsensus = require('./magi-system/consensus.js');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MAGI System initialization
let providers = [];
const consensus = new MAGIConsensus();

// Initialize providers with API keys
function initializeProviders() {
  try {
    if (process.env.OPENAI_API_KEY) {
      providers.push(new OpenAIProvider(process.env.OPENAI_API_KEY));
      console.log('[MAGI] Melchior (OpenAI) initialized');
    }
    
    if (process.env.GEMINI_API_KEY) {
      providers.push(new GeminiProvider(process.env.GEMINI_API_KEY));
      console.log('[MAGI] Balthasar (Gemini) initialized');
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      providers.push(new AnthropicProvider(process.env.ANTHROPIC_API_KEY));
      console.log('[MAGI] Caspar (Anthropic) initialized');
    }
    
    console.log(`[MAGI] ${providers.length} providers initialized`);
  } catch (error) {
    console.error('[MAGI] Provider initialization error:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'MAGI System',
    status: 'operational',
    providers: providers.length,
    message: 'Multi-Agent Generative Intelligence System Active'
  });
});

app.get('/status', (req, res) => {
  res.json({
    system: 'MAGI',
    status: 'operational',
    providers: providers.map(p => ({
      name: p.name,
      model: p.model,
      status: 'ready'
    })),
    consensus: 'semantic_majority',
    timestamp: new Date().toISOString()
  });
});

// MAGI Query endpoint - The core functionality
app.post('/compare', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        system: 'MAGI'
      });
    }

    console.log(`[MAGI] Processing query: ${query.substring(0, 50)}...`);
    
    if (providers.length === 0) {
      return res.status(500).json({
        error: 'No providers available',
        system: 'MAGI'
      });
    }

    // Query all providers in parallel
    const startTime = Date.now();
    const promises = providers.map(provider => 
      provider.query(query).catch(error => ({
        provider: provider.name,
        response: `Error: ${error.message}`,
        confidence: 0.0,
        status: 'error'
      }))
    );
    
    const responses = await Promise.all(promises);
    const processingTime = Date.now() - startTime;
    
    console.log(`[MAGI] All providers responded in ${processingTime}ms`);
    
    // Perform consensus
    const consensusResult = await consensus.performConsensus(responses);
    
    res.json({
      system: 'MAGI',
      query: query,
      consensus: consensusResult.consensus,
      confidence: consensusResult.confidence,
      method: consensusResult.method,
      processingTime: processingTime,
      details: consensusResult.details,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[MAGI] Query processing error:', error);
    res.status(500).json({
      error: 'Internal MAGI system error',
      message: error.message,
      system: 'MAGI'
    });
  }
});

// Individual provider endpoints for debugging
app.post('/melchior', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Melchior')) {
    return res.status(404).json({ error: 'Melchior not available' });
  }
  
  const provider = providers.find(p => p.name === 'Melchior');
  const result = await provider.query(req.body.query);
  res.json(result);
});

app.post('/balthasar', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Balthasar')) {
    return res.status(404).json({ error: 'Balthasar not available' });
  }
  
  const provider = providers.find(p => p.name === 'Balthasar');
  const result = await provider.query(req.body.query);
  res.json(result);
});

app.post('/caspar', async (req, res) => {
  if (providers.length === 0 || !providers.find(p => p.name === 'Caspar')) {
    return res.status(404).json({ error: 'Caspar not available' });
  }
  
  const provider = providers.find(p => p.name === 'Caspar');
  const result = await provider.query(req.body.query);
  res.json(result);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    providers: providers.length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Initialize providers and start server
initializeProviders();

app.listen(port, '0.0.0.0', () => {
  console.log(`[MAGI] System operational on port ${port}`);
  console.log(`[MAGI] Providers initialized: ${providers.length}`);
  console.log('[MAGI] Ready to process queries...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MAGI] Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});
