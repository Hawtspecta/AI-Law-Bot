import { Request, Response } from 'express';
import { generateAIResponse, analyzeDocument } from './aiServices';
import fetch from 'node-fetch';

// Chat endpoint
export async function postChatMessage(req: Request, res: Response) {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user language preference
    const userLanguage = req.body.language || 'en';
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, userLanguage);

    // Store messages using Manifest's auto-generated API
    const userMessage = await fetch('http://localhost:1111/api/dynamic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId || 'default',
        userId: userId || 'anonymous',
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })
    }).then((r: any) => r.json());

    const assistantMessage = await fetch('http://localhost:1111/api/dynamic/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId || 'default',
        userId: userId || 'anonymous',
        role: 'assistant',
        content: aiResponse.content,
        citations: JSON.stringify(aiResponse.citations),
        timestamp: new Date().toISOString()
      })
    }).then((r: any) => r.json());

    res.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}

// Document upload endpoint
export async function postDocumentUpload(req: Request, res: Response) {
  try {
    const { fileName, fileContent, fileType, userId } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: 'File name and content required' });
    }

    // Create document record
    const document = await fetch('http://localhost:1111/api/dynamic/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId || 'anonymous',
        fileName,
        fileType,
        fileSize: Buffer.byteLength(fileContent),
        status: 'processing',
        uploadedAt: new Date().toISOString()
      })
    }).then((r: any) => r.json());

    // Analyze document
    const analysis = await analyzeDocument(fileContent, fileType);

    // Update document with analysis
    await fetch(`http://localhost:1111/api/dynamic/documents/${document.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'completed',
        analysis: JSON.stringify(analysis)
      })
    });

    res.json({ ...document, analysis });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}

// Legal search endpoint
export async function postLegalSearch(req: Request, res: Response) {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    // Use AI to search and summarize legal information
    const searchResult = await generateAIResponse(
      `Search for legal information about: ${query}. Provide relevant laws, acts, and precedents.`
    );

    // Store query
    await fetch('http://localhost:1111/api/dynamic/legalqueries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: req.body.userId || 'anonymous',
        query,
        category: filters?.category || 'general',
        jurisdiction: filters?.jurisdiction || 'India',
        results: JSON.stringify(searchResult),
        createdAt: new Date().toISOString()
      })
    });

    res.json({
      query,
      results: searchResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
}

// Update user language preference endpoint
export async function patchUserLanguage(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { language } = req.body;

    if (!userId || !language) {
      return res.status(400).json({ error: 'User ID and language are required' });
    }

    // Update user language preference
    const response = await fetch(`http://localhost:1111/api/dynamic/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        lastLogin: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await response.json();

    res.json({
      success: true,
      user: updatedUser,
      message: 'Language preference updated successfully'
    });
  } catch (error) {
    console.error('Language update error:', error);
    res.status(500).json({ error: 'Failed to update language preference' });
  }
}