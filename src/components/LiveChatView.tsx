import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { Send, Pin, Radio } from "lucide-react";

export const LiveChatView: React.FC = () => {
  const { chatMessages, sendChatMessage, togglePinChatMessage, currentUser } = useHackathon();
  const [inputText, setInputText] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendChatMessage(inputText);
    setInputText("");
  };

  const pinnedMessages = chatMessages.filter(m => m.isPinned);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "organizer":
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">ORG</span>;
      case "judge":
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#222] text-[#BAFF00] border border-[#444]">JUDGE</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#151515] text-[#888] border border-[#333]">DEV</span>;
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] mb-8 font-mono">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-[#262626] bg-[#111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#151515] text-[#BAFF00] border border-[#333] flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Live Чат Вайбатона</h3>
              <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-ping"></span>
            </div>
            <p className="text-xs text-[#888] font-mono">Обсуждение идей, поиск сокомандников и вопросы организаторам</p>
          </div>
        </div>
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-[#151515] border-b border-[#333] p-3 space-y-1.5 font-mono">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#BAFF00] uppercase font-bold tracking-wider">
            <Pin className="w-3 h-3" />
            <span>ЗАКРЕПЛЕННЫЕ СООБЩЕНИЯ:</span>
          </div>
          {pinnedMessages.map((pin) => (
            <div key={pin.id} className="text-xs text-[#DDD] flex items-center justify-between gap-2">
              <span><strong>{pin.authorName}:</strong> {pin.content}</span>
              {currentUser?.role === 'organizer' && (
                <button onClick={() => togglePinChatMessage(pin.id)} className="text-[10px] text-[#888] hover:text-[#BAFF00] uppercase font-mono">
                  Открепить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 font-mono">
        {chatMessages.map((msg) => {
          const isMe = currentUser?.id === msg.authorId;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : ""}`}
            >
              {msg.authorAvatar ? (
                <img src={msg.authorAvatar} alt={msg.authorName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#333]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#151515] text-[#BAFF00] border border-[#333] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {msg.authorName[0]}
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                  isMe
                    ? "bg-[#BAFF00] text-black font-bold shadow-[0_0_10px_rgba(186,255,0,0.2)]"
                    : "bg-[#111] border border-[#262626] text-[#DDD]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{msg.authorName}</span>
                    {!isMe && getRoleBadge(msg.role)}
                  </div>
                  <span className={isMe ? "text-black/60" : "text-[#666]"}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.content}
                </div>

                {currentUser?.role === 'organizer' && (
                  <button
                    onClick={() => togglePinChatMessage(msg.id)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-[#888] hover:text-[#BAFF00] transition-opacity pt-1 flex items-center gap-1"
                  >
                    <Pin className="w-2.5 h-2.5" />
                    <span>{msg.isPinned ? "Открепить" : "Закрепить"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-[#262626] bg-[#0D0D0D] flex items-center gap-2 font-mono">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Напишите сообщение в чат Вайбатона..."
          className="flex-1 bg-[#151515] border border-[#333] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-50 text-black font-bold font-mono uppercase text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)] transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Отправить</span>
        </button>
      </form>
    </div>
  );
};

