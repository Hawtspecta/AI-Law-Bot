const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple test endpoint
app.post('/api/chat', (req, res) => {
  console.log('Chat request received:', req.body);
  res.json({
    userMessage: { role: 'user', content: req.body.message },
    assistantMessage: { 
      role: 'assistant', 
      content: 'This is a test response from the server.',
      citations: ['Test Citation']
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
