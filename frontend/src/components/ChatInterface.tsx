import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, Bot, User, Upload, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI legal assistant. Ask me anything about laws, legal procedures, or upload a document for analysis.",
    },
  ]);
  const [input, setInput] = useState("");

  const examplePrompts = [
    "What is the procedure for consumer complaints?",
    "Check compliance for this rental agreement.",
    "Summarize this legal case.",
    "How do I file an RTI application?",
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages([...messages, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: "I understand your question. Based on current Indian law, here's what you need to know...",
        citations: ["Consumer Protection Act, 2019", "Section 35 - National Consumer Disputes Redressal Commission"],
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInput("");
  };

  return (
    <section id="ask-a-question" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Ask Your Legal Question
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant, reliable answers to your legal queries in simple language
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Example Prompts */}
          <Card className="p-6 gradient-card border-border/50 animate-fade-in">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Try asking...
            </h3>
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

            <div className="mt-6 pt-6 border-t border-border">
              <Button variant="outline" className="w-full" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 p-6 gradient-card border-border/50 animate-fade-in">
            <ScrollArea className="h-[500px] pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-accent text-white"
                          : "bg-primary text-white"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    <div
                      className={`flex-1 ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-accent text-white"
                            : "bg-card border border-border"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>

                        {message.citations && (
                          <div className="mt-3 pt-3 border-t border-border/30">
                            <p className="text-xs font-medium mb-2 text-muted-foreground">
                              Key Citations:
                            </p>
                            {message.citations.map((citation, i) => (
                              <p key={i} className="text-xs text-muted-foreground">
                                • {citation}
                              </p>
                            ))}
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 text-xs"
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Download Summary
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your legal question here..."
                className="flex-1 rounded-xl"
              />
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleSend}
                size="icon"
                className="flex-shrink-0 glow-primary"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
