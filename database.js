const fs = require('fs').promises;
const path = require('path');

// Simple file-based database (in production, use PostgreSQL or MongoDB)
class SimpleDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.sessionsFile = path.join(this.dataDir, 'sessions.json');
    this.messagesFile = path.join(this.dataDir, 'messages.json');
    this.feedbackFile = path.join(this.dataDir, 'feedback.json');
    this.documentsFile = path.join(this.dataDir, 'documents.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      const files = [
        { file: this.usersFile, default: [] },
        { file: this.sessionsFile, default: [] },
        { file: this.messagesFile, default: [] },
        { file: this.feedbackFile, default: [] },
        { file: this.documentsFile, default: [] }
      ];

      for (const { file, default: defaultValue } of files) {
        try {
          await fs.access(file);
        } catch {
          await fs.writeFile(file, JSON.stringify(defaultValue, null, 2));
        }
      }

      console.log('📊 Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
  }

  async readData(file) {
    try {
      const data = await fs.readFile(file, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error);
      return [];
    }
  }

  async writeData(file, data) {
    try {
      await fs.writeFile(file, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`❌ Error writing ${file}:`, error);
      return false;
    }
  }

  // User management
  async createUser(userData) {
    const users = await this.readData(this.usersFile);
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    users.push(newUser);
    await this.writeData(this.usersFile, users);
    return newUser;
  }

  async getUserById(userId) {
    const users = await this.readData(this.usersFile);
    return users.find(user => user.id === userId);
  }

  async getUserByEmail(email) {
    const users = await this.readData(this.usersFile);
    return users.find(user => user.email === email);
  }

  async updateUser(userId, updates) {
    const users = await this.readData(this.usersFile);
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
      await this.writeData(this.usersFile, users);
      return users[userIndex];
    }
    
    return null;
  }

  // Session management
  async createSession(sessionData) {
    const sessions = await this.readData(this.sessionsFile);
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...sessionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      messageCount: 0
    };
    
    sessions.push(newSession);
    await this.writeData(this.sessionsFile, sessions);
    return newSession;
  }

  async getSessionById(sessionId) {
    const sessions = await this.readData(this.sessionsFile);
    return sessions.find(session => session.id === sessionId);
  }

  async getSessionsByUserId(userId) {
    const sessions = await this.readData(this.sessionsFile);
    return sessions.filter(session => session.userId === userId && session.isActive);
  }

  async updateSession(sessionId, updates) {
    const sessions = await this.readData(this.sessionsFile);
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates, updatedAt: new Date().toISOString() };
      await this.writeData(this.sessionsFile, sessions);
      return sessions[sessionIndex];
    }
    
    return null;
  }

  // Message management
  async saveMessage(messageData) {
    const messages = await this.readData(this.messagesFile);
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    messages.push(newMessage);
    await this.writeData(this.messagesFile, messages);
    
    // Update session message count
    if (messageData.sessionId) {
      const session = await this.getSessionById(messageData.sessionId);
      if (session) {
        await this.updateSession(messageData.sessionId, { 
          messageCount: session.messageCount + 1,
          lastMessageAt: new Date().toISOString()
        });
      }
    }
    
    return newMessage;
  }

  async getMessagesBySession(sessionId, limit = 50) {
    const messages = await this.readData(this.messagesFile);
    return messages
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-limit);
  }

  async getMessagesByUserId(userId, limit = 100) {
    const messages = await this.readData(this.messagesFile);
    return messages
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Feedback management
  async saveFeedback(feedbackData) {
    const feedback = await this.readData(this.feedbackFile);
    const newFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...feedbackData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    feedback.push(newFeedback);
    await this.writeData(this.feedbackFile, feedback);
    return newFeedback;
  }

  async getFeedbackByUserId(userId) {
    const feedback = await this.readData(this.feedbackFile);
    return feedback.filter(fb => fb.userId === userId);
  }

  // Document management
  async saveDocument(documentData) {
    const documents = await this.readData(this.documentsFile);
    const newDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...documentData,
      uploadedAt: new Date().toISOString(),
      status: 'processing'
    };
    
    documents.push(newDocument);
    await this.writeData(this.documentsFile, documents);
    return newDocument;
  }

  async getDocumentById(documentId) {
    const documents = await this.readData(this.documentsFile);
    return documents.find(doc => doc.id === documentId);
  }

  async getDocumentsByUserId(userId) {
    const documents = await this.readData(this.documentsFile);
    return documents.filter(doc => doc.userId === userId);
  }

  async updateDocument(documentId, updates) {
    const documents = await this.readData(this.documentsFile);
    const docIndex = documents.findIndex(doc => doc.id === documentId);
    
    if (docIndex !== -1) {
      documents[docIndex] = { ...documents[docIndex], ...updates, updatedAt: new Date().toISOString() };
      await this.writeData(this.documentsFile, documents);
      return documents[docIndex];
    }
    
    return null;
  }

  // Analytics and metrics
  async getMetrics() {
    const users = await this.readData(this.usersFile);
    const sessions = await this.readData(this.sessionsFile);
    const messages = await this.readData(this.messagesFile);
    const documents = await this.readData(this.documentsFile);
    const feedback = await this.readData(this.feedbackFile);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.isActive).length,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(session => session.isActive).length,
      totalMessages: messages.length,
      totalDocuments: documents.length,
      processedDocuments: documents.filter(doc => doc.status === 'completed').length,
      totalFeedback: feedback.length,
      positiveFeedback: feedback.filter(fb => fb.rating >= 4).length,
      negativeFeedback: feedback.filter(fb => fb.rating <= 2).length
    };
  }

  // Search functionality
  async searchMessages(query, userId = null, limit = 20) {
    const messages = await this.readData(this.messagesFile);
    let filteredMessages = messages;

    if (userId) {
      filteredMessages = filteredMessages.filter(msg => msg.userId === userId);
    }

    const searchResults = filteredMessages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.role.toLowerCase().includes(query.toLowerCase())
    );

    return searchResults
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Cleanup old data
  async cleanupOldData(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Clean up old sessions
    const sessions = await this.readData(this.sessionsFile);
    const activeSessions = sessions.filter(session => 
      session.isActive || new Date(session.updatedAt) > cutoffDate
    );
    await this.writeData(this.sessionsFile, activeSessions);

    // Clean up old messages (keep last 1000)
    const messages = await this.readData(this.messagesFile);
    const recentMessages = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 1000);
    await this.writeData(this.messagesFile, recentMessages);

    console.log(`🧹 Cleaned up data older than ${daysOld} days`);
  }
}

// Create singleton instance
const db = new SimpleDatabase();

module.exports = db;
