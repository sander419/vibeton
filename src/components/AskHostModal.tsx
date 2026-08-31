import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { Bot, Send, X, Loader2 } from "lucide-react";

interface AskHostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskHostModal: React.FC<AskHostModalProps> = ({ isOpen, onClose }) => {
  const { askAIHost, hackathon } = useHackathon();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'host', text: string }>>([
    {
      sender: "host",
      text: `Привет! Я официальный AI Host ${hackathon?.title || "Вайбатона №2"}. Могу подсказать по дедлайнам, правилам, критериям оценки или текущей статистике состязания. Что вас интересует?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQ = question;
    setQuestion("");
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
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#333] flex items-center justify-center text-[#BAFF00] font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Диалог с AI Host</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#BAFF00]/10 text-[#BAFF00] border border-[#BAFF00]/30">LIVE</span>
              </div>
              <p className="text-xs text-[#888] font-mono">Ведущий знает все правила, таймлайн и контекст события</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#151515] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-mono">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              {m.sender === "host" ? (
                <div className="w-8 h-8 rounded-lg bg-[#151515] border border-[#333] text-[#BAFF00] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#BAFF00] text-black font-bold flex items-center justify-center shrink-0 text-xs">
                  YOU
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#BAFF00] text-black font-bold shadow-[0_0_10px_rgba(186,255,0,0.2)]"
                    : "bg-[#111] border border-[#262626] text-[#DDD]"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#151515] text-[#BAFF00] border border-[#333] flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#111] border border-[#262626] rounded-2xl p-3.5 text-xs font-mono text-[#BAFF00] flex items-center gap-2">
                <span>AI Host формулирует ответ по регламенту хакатона...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-black border-t border-[#222] flex items-center gap-2 overflow-x-auto no-scrollbar font-mono">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestion(p);
              }}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#111] hover:bg-[#1A1A1A] hover:text-[#BAFF00] border border-[#262626] transition-colors text-[#AAA]"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#262626] bg-[#0D0D0D] flex items-center gap-2 font-mono">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Спросите ведущего о правилах, критериях, командах..."
            className="flex-1 bg-[#151515] border border-[#333] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00] transition-colors"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-50 text-black font-bold font-mono uppercase text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)] transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Спросить</span>
          </button>
        </form>
      </div>
    </div>
  );
};

