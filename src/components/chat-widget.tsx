
"use client";

import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, Send, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatbotResponseAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/app-context";
import type { AIChatbotInterfaceInput } from "@/lib/types";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const { 
    isChatOpen, 
    setChatOpen, 
    initialPrompt, 
    setInitialPrompt, 
    recommendationContext,
    setAdvisorResults 
  } = useAppContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm your AI supplement expert. How can I help you today? I can answer questions or create a new supplement plan for you.",
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isChatOpen && initialPrompt) {
      setInput(initialPrompt);
      setInitialPrompt(""); // Clear prompt after loading
    }
  }, [isChatOpen, initialPrompt, setInitialPrompt]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | undefined;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Sanitize recommendation context to remove large image data before sending to server
      let sanitizedContext;
      if (recommendationContext) {
        sanitizedContext = {
          ...recommendationContext,
          output: {
            ...recommendationContext.output,
            suggestions: recommendationContext.output.suggestions.map(({ imageUrl, ...rest }) => rest),
          },
        };
      }

      const actionInput: AIChatbotInterfaceInput = {
        userId: "anonymous", // Replace with actual user ID when auth is implemented
        message: input,
        chatHistory: messages,
        recommendationContext: sanitizedContext,
      }

      const response = await chatbotResponseAction(actionInput);

      // Handle new recommendation if generated
      if (response.recommendation && response.recommendationInput) {
        setAdvisorResults(response.recommendation, response.recommendationInput);
        setChatOpen(false); // Close chat to show the new results
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: error.message || "An unexpected error occurred in the chat.",
      });
      // Rollback the optimistic user message on failure
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isChatOpen} onOpenChange={setChatOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg" size="icon">
          <MessageCircle className="h-8 w-8" />
          <span className="sr-only">Open Chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline">Chat with NutriStack AI</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-xs",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === "user" && (
                  <Avatar>
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                 <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about supplements..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
