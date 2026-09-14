import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../utils/cn';

const SUGGESTIONS = [
  "How can I improve my ATS score?",
  "Explain my skill gaps",
  "Generate a learning roadmap",
  "Start a mock interview",
];

export function AIAssistant() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeResume } = useSelector((state: RootState) => state.resume);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hi ${user?.name || 'there'}.` 
    }
  ]);

  useEffect(() => {
    if (activeResume) {
        setMessages([
          {
            role: 'assistant',
            content: `Hi ${user?.name || 'there'}. I have analyzed ${activeResume.name}. I noticed you have strong skills in ${activeResume.parsedContent?.skills?.[0] || 'your core areas'}. How can I help you improve your placement probability today?`
          }
        ]);
    } else {
        setMessages([
          {
            role: 'assistant',
            content: `Hi ${user?.name || 'there'}. Please upload your resume so I can provide personalized career guidance.`
          }
        ]);
    }
  }, [activeResume, user]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      
      let aiResponse = "I am analyzing your profile context now.";
      const skills = activeResume?.parsedContent?.skills || [];
      if (text.toLowerCase().includes("ats")) {
        aiResponse = `Your ATS score is currently ${activeResume?.score || 0}. Based on ${activeResume?.name || 'your resume'}, you could improve it by expanding on your experience with ${skills[0] || 'core technologies'}.`;
      } else if (text.toLowerCase().includes("roadmap")) {
        aiResponse = `I can generate a learning plan for ${skills[0] || 'Software Engineering'} to target higher roles.`;
      } else if (text.toLowerCase().includes("gaps") || text.toLowerCase().includes("skill")) {
        aiResponse = `Based on your resume, you might want to learn more about testing and CI/CD pipelines as these are often requested alongside ${skills[0] || 'your current stack'}.`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiResponse
      }]);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl transition-all duration-300",
          "bg-card border border-border hover:bg-secondary group",
          isOpen && "opacity-0 pointer-events-none scale-95"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold uppercase tracking-wider text-foreground pr-2 group-hover:text-primary transition-colors">
          Ask AI Mentor
        </span>
      </button>

      {/* Chat Panel */}
      <div 
        className={cn(
          "fixed bottom-8 right-8 z-50 w-[400px] flex flex-col rounded-2xl shadow-2xl transition-all duration-500 ease-out origin-bottom-right",
          "bg-card/90 backdrop-blur-2xl border border-border overflow-hidden",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">SmartHireAI Mentor</h3>
              <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 max-h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-sm border border-border px-4 py-3 text-sm flex gap-1 items-center h-[44px]">
                 <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length < 3 && !isTyping && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="text-[10px] font-medium px-3 py-1.5 rounded-full border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-4 bg-background/50 border-t border-border">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your career..."
              className="w-full bg-input border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
