import express from 'express';
import cors from 'cors';
import { 
  postChatMessage, 
  postDocumentUpload, 
  postLegalSearch, 
  patchUserLanguage,
  postLogin,
  postRegister,
  postCreateSession,
  postAnalyzeContract,
  postFillForm,
  postCompareDocuments,
  getLegalNews,
  postExportChat,
  postFeedback,
  patchUserPrivacy,
  getMetrics
} from './backend/routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
// Chat and messaging
app.post('/api/chat', postChatMessage);
app.post('/api/chat/message', postChatMessage);
app.post('/api/chat/export/:sessionId', postExportChat);

// Document management
app.post('/api/documents', postDocumentUpload);
app.post('/api/documents/upload', postDocumentUpload);
app.post('/api/documents/compare', postCompareDocuments);

// Legal services
app.post('/api/search', postLegalSearch);
app.post('/api/legal/search', postLegalSearch);
app.post('/api/contracts/analyze', postAnalyzeContract);
app.post('/api/forms/fill', postFillForm);

// Authentication
app.post('/api/auth/login', postLogin);
app.post('/api/auth/register', postRegister);

// Session management
app.post('/api/sessions', postCreateSession);

// User management
app.patch('/api/users/:userId/language', patchUserLanguage);
app.patch('/api/users/:userId/privacy', patchUserPrivacy);

// News and content
app.get('/api/news', getLegalNews);

// Feedback and metrics
app.post('/api/feedback', postFeedback);
app.get('/api/metrics', getMetrics);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;