import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import { Bot, Send, X, Loader2, RotateCcw } from "lucide-react";

interface AskHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskHostModal: React.FC<AskHostModalProps> = ({ isOpen, onClose }) => {
  const { askAIHost, hackathon } = useHackathon();

  const [question, setQuestion] = useState(() => {
    try {
      return localStorage.getItem("vibathon_ai_host_question_draft") || "";
    } catch {
      return "";
    }
  });

  const defaultGreeting = `Привет! Я официальный AI Host ${hackathon?.title || "Вайбатона №2"}. Могу подсказать по дедлайнам, правилам, критериям оценки или текущей статистике состязания. Что вас интересует?`;

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'host', text: string }>>(() => {
    try {
      const saved = localStorage.getItem("vibathon_ai_host_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [{ sender: "host", text: defaultGreeting }];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync question draft
  useEffect(() => {
    try {
      if (question) {
        localStorage.setItem("vibathon_ai_host_question_draft", question);
      } else {
        localStorage.removeItem("vibathon_ai_host_question_draft");
      }
    } catch {
      // ignore
    }
  }, [question]);

  // Sync messages
  useEffect(() => {
    try {
      localStorage.setItem("vibathon_ai_host_chat_history", JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    setMessages([{ sender: "host", text: defaultGreeting }]);
    setQuestion("");
    try {
      localStorage.removeItem("vibathon_ai_host_chat_history");
      localStorage.removeItem("vibathon_ai_host_question_draft");
    } catch {
      // ignore
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQ = question;
    setQuestion("");
    try {
      localStorage.removeItem("vibathon_ai_host_question_draft");
    } catch {
      // ignore
    }

    setMessages(prev => [...prev, { sender: "user", text: userQ }]);
    setIsLoading(true);

    try {
      const answer = await askAIHost(userQ);
      setMessages(prev => [...prev, { sender: "host", text: answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "host", text: "Произошла ошибка при обращении к ведущему. Попробуйте еще раз!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Какие главные критерии оценки?",
    "Сколько времени осталось до дедлайна?",
    "Что обязательно должно быть в MVP?",
    "Как работает сдача проекта?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
      <div className="bg-[#0a0c14] border border-[#1e2436] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1e2436] bg-[#0e111c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121627] border border-[#2a3148] flex items-center justify-center text-[#c8ff3d] font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Диалог с AI Host</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#c8ff3d]/10 text-[#c8ff3d] border border-[#c8ff3d]/30">LIVE</span>
              </div>
              <p className="text-xs text-[#8b93ad] font-mono">Ведущий знает все правила, таймлайн и контекст события</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                title="Очистить историю диалога"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-amber-400 border border-[#2a3148] text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Очистить</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-white border border-[#2a3148] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-mono">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              {m.sender === "host" ? (
                <div className="w-8 h-8 rounded-lg bg-[#121627] border border-[#2a3148] text-[#c8ff3d] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#c8ff3d] text-[#06070c] font-black flex items-center justify-center shrink-0 text-xs">
                  YOU
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#c8ff3d] text-[#06070c] font-bold shadow-[0_0_12px_rgba(200,255,61,0.25)]"
                    : "bg-[#0e111c] border border-[#1e2436] text-[#DDD]"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#121627] text-[#c8ff3d] border border-[#2a3148] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0e111c] border border-[#1e2436] rounded-2xl p-3.5 text-xs font-mono text-[#c8ff3d] flex items-center gap-2">
                <span>AI Host формулирует ответ по регламенту хакатона...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#06070c] border-t border-[#1e2436] flex items-center gap-2 overflow-x-auto no-scrollbar font-mono">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(p);
              }}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#0e111c] hover:bg-[#121627] hover:text-[#c8ff3d] border border-[#1e2436] transition-colors text-[#8b93ad]"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#1e2436] bg-[#080a10] flex items-center gap-2 font-mono">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Спросите ведущего о правилах, критериях, командах..."
            className="flex-1 bg-[#0e111c] border border-[#2a3148] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#c8ff3d] transition-colors"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff5e] disabled:opacity-50 text-[#06070c] font-black font-mono uppercase text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(200,255,61,0.3)] transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Спросить</span>
          </button>
        </form>
      </div>
    </div>
  );
};

