# AI Law Assistant

An AI-powered legal assistant application that helps users with legal queries, document analysis, and legal research.

## Features

- 🤖 AI-powered legal chat interface
- 📄 Document upload and analysis
- 🔍 Legal search capabilities
- 🌐 Multi-language support (English, Hindi, Marathi, Tamil, Kannada)
- 💬 Real-time chat with citations
- 📱 Responsive design
- 🔒 Privacy controls and data protection
- 📊 Real-time metrics and analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for state management
- Sonner for notifications

### Backend
- Node.js with Express
- TypeScript
- OpenAI GPT-4 integration
- Manifest for database management
- CORS enabled for cross-origin requests

## Quick Start

### Option 1: Simple Server (Recommended for Testing)

1. **Start the simple server:**
   ```bash
   # Windows
   start-server.bat
   
   # Linux/Mac
   chmod +x start-server.sh
   ./start-server.sh
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

### Option 2: Full Development Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   
   Create `server/.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

3. **Start both services:**
   ```bash
   npm run dev
   ```

## Connection Issues & Troubleshooting

### "Failed to fetch" Errors

The application now includes robust error handling and fallback mechanisms:

1. **Automatic Fallback URLs**: The API client tries multiple URLs automatically
2. **Mock Responses**: When the server is unavailable, the app provides mock responses
3. **Connection Status**: Real-time connection status indicator in the bottom-right corner
4. **Retry Mechanism**: Manual retry button for failed connections

### Common Solutions

1. **Check if the server is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Start the simple server:**
   ```bash
   cd server
   node simple-server.js
   ```

3. **Check browser console** for detailed error messages

4. **Verify CORS settings** in the server configuration

### Mock Mode

When the server is unavailable, the application automatically switches to mock mode:
- All API calls return mock responses
- Users can still interact with the interface
- Connection status shows "Disconnected" with retry option
- Mock responses are clearly labeled

## API Endpoints

### Chat
- `POST /api/chat` - Send chat message
- `POST /api/chat/message` - Send chat message (alias)
- `POST /api/chat/export/:sessionId` - Export chat conversation

### Document Management
- `POST /api/documents` - Upload document for analysis
- `POST /api/documents/upload` - Upload document (alias)
- `POST /api/documents/compare` - Compare documents

### Legal Services
- `POST /api/search` - Legal search query
- `POST /api/legal/search` - Legal search (alias)
- `POST /api/contracts/analyze` - Analyze contract
- `POST /api/forms/fill` - Fill legal form

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Session Management
- `POST /api/sessions` - Create new session

### User Management
- `PATCH /api/users/:userId/language` - Update user language
- `PATCH /api/users/:userId/privacy` - Update privacy settings

### News and Content
- `GET /api/news` - Get legal news feed

### Feedback and Metrics
- `POST /api/feedback` - Submit feedback
- `GET /api/metrics` - Get platform metrics

### Health Check
- `GET /health` - Server health status

## Development

### Project Structure

```
AI-Law-/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client services
│   │   ├── pages/            # Page components
│   │   └── lib/              # Utility functions
│   └── package.json
├── server/                   # Express backend
│   ├── backend/              # Backend logic
│   │   ├── routes.ts         # API route handlers
│   │   └── aiServices.ts     # AI service integration
│   ├── server.ts             # Express server setup
│   ├── simple-server.js      # Simple test server
│   ├── manifest.yml          # Database schema
│   └── package.json
├── start-server.bat          # Windows server startup script
├── start-server.sh           # Linux/Mac server startup script
└── package.json              # Root package.json for scripts
```

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start frontend only
npm run dev:backend         # Start backend only

# Installation
npm run install:all         # Install all dependencies

# Production
npm run build               # Build frontend for production
npm start                   # Start production server
```

## Features Implemented

### Phase 1 (MVP)
✅ Chat interface with AI responses  
✅ Document upload and analysis  
✅ Legal research search  
✅ Multi-language UI  

### Phase 2 (Core)
✅ Contract analyzer with risk assessment  
✅ Form assistance with validation  
✅ Document comparison with redline view  
✅ User authentication (login/signup)  
✅ Chat history and session management  

### Phase 3 (Enhanced)
✅ Legal news feed with region/topic filters  
✅ Alert notifications and feedback system  
✅ Timeline visualizations  
✅ Advanced privacy controls  

### Phase 4 (Bonus)
✅ Voice input using Speech Recognition API  
✅ Lawyer referral (UI ready)  

### Navigation Features
✅ Language selector dropdown  
✅ Login/Signup buttons  
✅ Navigation links  

### Hero Section
✅ Start Chat CTA  
✅ Learn More button  
✅ Metric displays  

### Chat Interface
✅ Upload document  
✅ Voice input  
✅ Send message  
✅ Download summary  
✅ Feedback system  

### Tools Section
✅ Legal Research Tool  
✅ Contract Analyzer  
✅ Legal News & Forms  
✅ Document Comparator  

### Privacy & Security
✅ Anonymize query toggle  
✅ Data retention control  

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

## Troubleshooting

### Server Won't Start
1. Check if port 3001 is available
2. Verify Node.js version (18+ required)
3. Check for missing dependencies
4. Use the simple server for testing

### Frontend Issues
1. Check if port 8080 is available
2. Verify Vite configuration
3. Check browser console for errors
4. Ensure API_BASE_URL is correct

### API Connection Issues
1. Check server health endpoint
2. Verify CORS configuration
3. Check network connectivity
4. Use mock mode for testing

### OpenAI Integration
1. Set OPENAI_API_KEY environment variable
2. Verify API key validity
3. Check rate limits
4. Use mock responses for testing
