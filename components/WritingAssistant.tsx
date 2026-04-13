"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { Scholarship, StudentProfile } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  scholarship: Scholarship;
  profile: StudentProfile;
}

export default function WritingAssistant({ scholarship, profile }: Props) {
  const [selectedPrompt, setSelectedPrompt] = useState(
    scholarship.essayPrompts[0]?.prompt || ""
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user" as const, content },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/writing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          profile,
          scholarship,
          essayPrompt: selectedPrompt,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = () => {
    setStarted(true);
    sendMessage(
      `Please write a complete draft essay for the prompt: "${selectedPrompt}". Use my profile details to make it personal and specific. Aim for the word limit.`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Prompt selector */}
      {scholarship.essayPrompts.length > 1 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Essay Prompt
          </label>
          <div className="relative">
            <select
              value={selectedPrompt}
              onChange={(e) => {
                setSelectedPrompt(e.target.value);
                setMessages([]);
                setStarted(false);
              }}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {scholarship.essayPrompts.map((p, i) => (
                <option key={i} value={p.prompt}>
                  Prompt {i + 1}: {p.prompt.substring(0, 60)}...
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {scholarship.essayPrompts.find((p) => p.prompt === selectedPrompt)?.wordLimit && (
            <p className="text-xs text-slate-500 mt-1">
              Word limit:{" "}
              {scholarship.essayPrompts.find((p) => p.prompt === selectedPrompt)?.wordLimit} words
            </p>
          )}
        </div>
      )}

      {/* Selected prompt display */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Prompt</p>
        <p className="text-sm text-indigo-900">{selectedPrompt}</p>
        {scholarship.essayPrompts.find((p) => p.prompt === selectedPrompt)?.wordLimit && (
          <p className="text-xs text-indigo-500 mt-1">
            {scholarship.essayPrompts.find((p) => p.prompt === selectedPrompt)?.wordLimit} words
          </p>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] max-h-[380px] pr-1">
        {!started && messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">AI Writing Assistant</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Generate a personalized draft using your profile, or ask questions about how to strengthen your essay.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-slate-100 text-slate-800 rounded-tl-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1 items-center text-slate-400">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Actions */}
      {!started && messages.length === 0 ? (
        <button
          onClick={generateDraft}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Draft Essay
        </button>
      ) : (
        <div className="space-y-2">
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                setStarted(false);
              }}
              className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 py-1"
            >
              <RefreshCw className="w-3 h-3" />
              Start over
            </button>
          )}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for revisions, tips, or a new draft..."
              rows={2}
              className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-3 flex items-center justify-center transition-colors self-end py-2.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">Press Enter to send</p>
        </div>
      )}
    </div>
  );
}
