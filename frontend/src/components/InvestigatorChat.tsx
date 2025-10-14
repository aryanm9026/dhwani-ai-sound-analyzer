import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const mockResponses = [
  "Based on the audio analysis, the primary speaker appears to be a male adult, approximately 30-40 years old.",
  "The background noise suggests an outdoor urban environment, likely during daytime hours.",
  "I've identified three distinct audio layers in the recording with varying levels of clarity.",
  "The timestamp analysis indicates this recording was made in the afternoon, around 2-4 PM based on ambient sound patterns.",
];

export const InvestigatorChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput("");
  };

  return (
    <Card className="p-6 bg-card border-border flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Ask the Investigator</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Ask questions about the audio analysis...
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-primary/10 border border-primary/20 ml-8"
                  : "bg-secondary/50 border border-border mr-8"
              }`}
            >
              <p className="text-sm text-foreground">{message.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-secondary border-border"
        />
        <Button type="submit" size="icon" className="bg-gradient-primary">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};
