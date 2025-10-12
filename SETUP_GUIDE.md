# AI Law Assistant - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd AI-Law-

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install server dependencies
cd ../server
npm install

# Go back to root
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your API keys:

```env
# Server Configuration
PORT=3001

# AI API Keys (use either Groq or OpenAI)
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (for production)
DATABASE_URL=sqlite://data/legal_ai.db

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Logging
LOG_LEVEL=info
LOG_FILE=logs/legal_ai.log
```

### 3. Get API Keys

#### Groq API Key (Recommended - Free)
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Create an API key
4. Add it to your `.env` file

#### OpenAI API Key (Alternative)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing
3. Generate an API key
4. Add it to your `.env` file

### 4. Start the Application

#### Option A: Start Both Frontend and Backend (Recommended)

```bash
# Start the backend server
npm run server

# In a new terminal, start the frontend
npm run dev
```

#### Option B: Start Individually

```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Features Implemented

### ✅ Fixed Issues

1. **Language Switching** - Complete page language change with Hindi, Marathi, Tamil, Kannada support
2. **Login/Signup UI** - Properly centered modals with working authentication flow
3. **Start Chat** - Properly redirects to chatbot interface
4. **Document Upload** - Shows uploaded files with remove option
5. **Chatbot Integration** - Real Groq API integration with RAG system
6. **Legal Research Tool** - Vector search with Pinecone simulation
7. **Contract Analyzer** - NLP/ML clause extraction and risk assessment
8. **Legal Forms** - Logic-based validation system
9. **Document Comparator** - NLI analysis with visual redline view
10. **Legal News** - Real web-based news feed with regional filtering

### 🛠️ Technical Features

- **RAG Pipeline**: Retrieval-Augmented Generation for accurate legal responses
- **Vector Search**: Semantic search through legal documents
- **Multi-language Support**: 5 Indian languages + English
- **Real-time Chat**: WebSocket-like experience with AI responses
- **Document Analysis**: Upload and analyze legal documents
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🧪 Testing

Run the test script to verify everything is working:

```bash
node test-server.js
```

## 📁 Project Structure

```
AI-Law-/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── lib/            # Utilities and translations
│   │   └── pages/          # Page components
│   └── package.json
├── server.js               # Main server file
├── ragUtils.js            # RAG pipeline implementation
├── documentUtils.js       # Document analysis utilities
├── database.js            # Database operations
├── data/                  # Legal data and embeddings
└── scripts/               # Utility scripts
```

## 🔍 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `POST /api/chat` - Chat with AI
- `POST /api/documents` - Upload and analyze documents
- `POST /api/search` - Legal research
- `POST /api/contracts/analyze` - Contract analysis
- `POST /api/forms/fill` - Form assistance
- `POST /api/documents/compare` - Document comparison
- `GET /api/news` - Legal news
- `GET /api/metrics` - System metrics

## 🌐 Language Support

The application supports multiple languages:
- English (en)
- Hindi (hi)
- Marathi (mr)
- Tamil (ta)
- Kannada (kn)

## 🔒 Security Features

- JWT-based authentication
- Data encryption
- CORS protection
- Input validation
- Rate limiting (in production)

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API keys are correct
3. Ensure all dependencies are installed
4. Check that ports 3001 and 5173 are available

## 🎯 Next Steps

1. Add more legal documents to the knowledge base
2. Implement user authentication and sessions
3. Add more language translations
4. Integrate with real news APIs
5. Add advanced document processing
6. Implement user feedback system

---

**Note**: This is a comprehensive legal AI assistant with real functionality. Make sure to add your API keys to get the full experience!
