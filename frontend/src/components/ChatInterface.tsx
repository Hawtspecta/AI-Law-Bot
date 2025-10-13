// src/components/ChatInterface.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, Bot, User, Upload, Download, Loader2, X, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient, Message } from "@/services/api";
import { toast } from "sonner";
import { getTranslation } from "@/lib/translations";

interface ChatInterfaceProps {
  currentLanguage?: string;
}

const ChatInterface = ({ currentLanguage = 'en' }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getTranslation('chatGreeting', currentLanguage),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{id: string, name: string, type: string}>>([]);
  const [sessionId] = useState(() => localStorage.getItem('currentSessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const examplePrompts = [
    getTranslation('examplePrompt1', currentLanguage),
    getTranslation('examplePrompt2', currentLanguage),
    getTranslation('examplePrompt3', currentLanguage),
    getTranslation('examplePrompt4', currentLanguage),
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput("");

    try {
      const { assistantMessage } = await apiClient.sendChatMessage({
        message: currentInput,
        sessionId,
        userId: "anonymous",
        language: currentLanguage,
      });

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error(getTranslation('chatSendError', currentLanguage));
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: getTranslation('chatAssistantError', currentLanguage) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice input is not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Listening... Speak now");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      toast.success("Voice input captured");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      toast.error("Voice input failed. Please try again.");
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleUploadDocument = () => {
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.accept = ".txt,.pdf,.doc,.docx";  // ✅ PDF support enabled
    inputFile.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          // Check file size (limit to 10MB)
          if (file.size > 10 * 1024 * 1024) {
            toast.error("File too large. Please upload files under 10MB.");
            return;
          }
          
          // Show uploading message
          toast.info("Uploading and analyzing document...");
          
          console.log(`📄 Uploading: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
          
          let content = "";
          
          // Handle different file types
          if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
            // For PDF, we'll send as base64 and let backend handle it
            const reader = new FileReader();
            content = await new Promise<string>((resolve, reject) => {
              reader.onload = () => {
                const base64 = reader.result as string;
                // Extract just the base64 content
                resolve(base64.split(',')[1] || base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            console.log("📄 PDF converted to base64");
          } else {
            // For text files, read as text
            content = await file.text();
            console.log(`📄 Text content extracted: ${content.length} characters`);
          }
          
          // Add user message showing document upload
          const uploadMessage: Message = {
            role: "user",
            content: `📄 Uploaded document: ${file.name}\n\nPlease analyze this document and tell me what's in it.`
          };
          setMessages(prev => [...prev, uploadMessage]);
          
          console.log("🌐 Sending to backend API...");
          
          // Send to backend for analysis
          const response = await apiClient.uploadDocument({
            fileName: file.name,
            fileContent: content,
            fileType: file.type || 'application/octet-stream',
            userId: "anonymous",
          });
          
          console.log("✅ Backend response received:", response);
          
          // Add document to uploaded documents list
          const newDoc = {
            id: response.id,
            name: file.name,
            type: file.type
          };
          setUploadedDocuments(prev => [...prev, newDoc]);
          
          toast.success("Document analyzed successfully!");
          
          // Add AI analysis to chat messages
          const analysisMessage: Message = {
            role: "assistant",
            content: response.analysis?.summary || "Document analysis completed.",
            citations: response.analysis?.citations || []
          };
          setMessages(prev => [...prev, analysisMessage]);
          
        } catch (error: any) {
          console.error("❌ Upload error:", error);
          toast.error(`Failed to upload: ${error.message}`);
        }
      }
    };
    inputFile.click();
  };

  const handleRemoveDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success("Document removed");
  };

  return (
    <section id="ask-a-question" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            {getTranslation('askYourLegalQuestion', currentLanguage)}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {getTranslation('getInstantAnswers', currentLanguage)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Example Prompts */}
          <Card className="p-6 gradient-card border-border/50 animate-fade-in">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">{getTranslation('tryAsking', currentLanguage)}</h3>
            <div className="space-y-3">
              {examplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left p-3 rounded-xl bg-secondary hover:bg-accent/10 border border-border hover:border-accent transition-smooth text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
            
            {/* Uploaded Documents Display */}
            {uploadedDocuments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-primary mb-3">Uploaded Documents:</h4>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">{doc.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-border">
              <Button variant="outline" className="w-full" size="sm" onClick={handleUploadDocument}>
                <Upload className="mr-2 h-4 w-4" /> {getTranslation('uploadDocument', currentLanguage)}
              </Button>
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 p-6 gradient-card border-border/50 animate-fade-in">
            <ScrollArea className="h-[500px] pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div key={idx} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        message.role === "user" ? "bg-accent text-white" : "bg-primary text-white"
                      }`}
                    >
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block p-4 rounded-2xl ${
                          message.role === "user" ? "bg-accent text-white" : "bg-card border border-border"
                        }`}
                      >
                        {/* ✅ FIXED: Use whitespace-pre-wrap to preserve line breaks */}
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Key Citations:</p>
                            {message.citations.map((citation, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {citation}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-primary text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-4 rounded-2xl bg-card border border-border">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <p className="text-sm text-muted-foreground">{getTranslation('aiIsThinking', currentLanguage)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder={getTranslation('typeYourQuestion', currentLanguage)}
                className="flex-1 rounded-xl"
                disabled={isLoading}
              />
              <Button variant="ghost" size="icon" className="flex-shrink-0" disabled={isLoading} onClick={handleVoiceInput}>
                {isRecording ? <Loader2 className="h-5 w-5 animate-spin text-red-500" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button onClick={handleSend} size="icon" className="flex-shrink-0 glow-primary" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;