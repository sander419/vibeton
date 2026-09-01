import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Bot, 
  Volume2, 
  RefreshCw, 
  MessageSquare, 
  Radio, 
  ShieldCheck, 
  Zap,
  Pause
} from "lucide-react";
import { speakText, stopSpeech, sound } from "../utils/audio";

interface AIHostCardProps {
  onOpenAskHost: () => void;
}

export const AIHostCard: React.FC<AIHostCardProps> = ({ onOpenAskHost }) => {
  const { aiMessages, triggerAIHostBroadcast, posts, teams, projects, users } = useHackathon();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const latestMessage = aiMessages[0] || {
    id: "default-host",
    title: "В ЭФИРЕ AI HOST ВАЙБАТОНА",
    content: "Вайбатон №2 в самом разгаре. 7 дней на разработку. Делитесь обновлениями в Devlog, создавайте команды и показывайте первые MVP!",
    statsSnapshot: {
      participants: users.length,
      teams: teams.length,
      projects: projects.length,
      mvps: projects.filter(p => p.status === "MVP" || p.status === "DEMO").length,
      submissions: 0,
      progressPosts: posts.length,
      hoursLeft: 108
    },
    createdAt: new Date().toISOString()
  };

  const handleToggleVoice = () => {
    sound.playClick();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(`${latestMessage.title}. ${latestMessage.content}`, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleRefreshBroadcast = async () => {
    sound.playPulse();
    try {
      setIsGenerating(true);
      await triggerAIHostBroadcast("Запрос обновления ведущего");
      sound.playBroadcastChime();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0a0c14] border border-[#1e2436] p-6 sm:p-8 shadow-2xl mb-8 font-mono">
      {/* Holographic Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1e2436]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#121627] border border-[#c8ff3d]/50 p-0.5 shadow-[0_0_15px_rgba(200,255,61,0.2)] animate-pulse-acid">
              <div className="w-full h-full bg-[#06070c] rounded-[13px] flex items-center justify-center text-[#c8ff3d]">
                <Bot className="w-6 h-6" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#c8ff3d] ring-4 ring-[#06070c] animate-ping" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#c8ff3d] ring-4 ring-[#06070c]" />
          </div>

          <div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-xs font-bold tracking-widest text-[#c8ff3d] uppercase">
                OFFICIAL AI HOST // ON AIR
              </span>
              <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-[#c8ff3d]/10 text-[#c8ff3d] border border-[#c8ff3d]/30">
                LIVE_NODE
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white font-mono tracking-wider uppercase mt-0.5">
              {latestMessage.title}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleToggleVoice}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-2 transition-all ${
              isSpeaking
                ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_12px_rgba(200,255,61,0.4)] animate-pulse"
                : "bg-[#0e111c] hover:bg-[#121627] text-white border border-[#1e2436] hover:border-[#c8ff3d]"
            }`}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#c8ff3d]" />}
            <span>{isSpeaking ? "Остановить голос" : "Послушать Host"}</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenAskHost();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wider uppercase bg-[#0e111c] hover:bg-[#121627] text-[#c8ff3d] border border-[#1e2436] hover:border-[#c8ff3d] flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Спросить Host</span>
          </button>

          <button
            onClick={handleRefreshBroadcast}
            disabled={isGenerating}
            title="Сгенерировать свежую сводку ведущего на основе актуальных данных"
            className="p-2 rounded-xl bg-[#0e111c] hover:bg-[#121627] text-[#8b93ad] hover:text-[#c8ff3d] border border-[#1e2436] hover:border-[#c8ff3d] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin text-[#c8ff3d]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Broadcast Body */}
      <div className="my-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8">
          <div className="bg-[#0e111c] rounded-2xl p-5 border border-[#1e2436] relative">
            {/* Animated Equalizer Waveform when speaking */}
            {isSpeaking && (
              <div className="flex items-center gap-1 mb-3">
                {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-[#c8ff3d] rounded-none animate-pulse" 
                    style={{ height: `${h * 0.25}px`, animationDelay: `${i * 0.1}s` }} 
                  />
                ))}
                <span className="text-[11px] font-mono text-[#c8ff3d] ml-2 uppercase tracking-wider">Голосовой синтез активен...</span>
              </div>
            )}

            <p className="text-sm sm:text-base text-[#e9edf8] font-mono leading-relaxed whitespace-pre-line">
              {latestMessage.content}
            </p>

            <div className="mt-4 pt-3 border-t border-[#1e2436] flex flex-wrap items-center justify-between text-[11px] text-[#8b93ad] font-mono gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#c8ff3d] animate-pulse" />
                <span>Сформировано Gemini AI на основе реального пульса события</span>
              </div>
              <div className="text-[#8b93ad]">
                {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Event Snapshot Card */}
        <div className="lg:col-span-4 bg-[#0e111c] border border-[#1e2436] rounded-2xl p-4 space-y-3 font-mono">
          <div className="text-[11px] text-[#c8ff3d] uppercase tracking-wider flex items-center justify-between font-bold">
            <span>ПУЛЬС СОБЫТИЯ</span>
            <Zap className="w-3.5 h-3.5 text-[#c8ff3d]" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-[#0a0c14] p-2.5 rounded-xl border border-[#1e2436]">
              <div className="text-xl font-bold font-mono text-white">{latestMessage.statsSnapshot?.participants || users.length}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase font-mono">Участников</div>
            </div>
            <div className="bg-[#0a0c14] p-2.5 rounded-xl border border-[#1e2436]">
              <div className="text-xl font-bold font-mono text-[#c8ff3d]">{latestMessage.statsSnapshot?.teams || teams.length}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase font-mono">Команд</div>
            </div>
            <div className="bg-[#0a0c14] p-2.5 rounded-xl border border-[#1e2436]">
              <div className="text-xl font-bold font-mono text-[#41f0ff]">{latestMessage.statsSnapshot?.mvps || 1}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase font-mono">Рабочих MVP</div>
            </div>
            <div className="bg-[#0a0c14] p-2.5 rounded-xl border border-[#1e2436]">
              <div className="text-xl font-bold font-mono text-[#c8ff3d]">{latestMessage.statsSnapshot?.progressPosts || posts.length}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase font-mono">Devlog постов</div>
            </div>
          </div>

          {/* Strict Role Disclaimer */}
          <div className="text-[10px] text-[#8b93ad] bg-[#080a10] p-2.5 rounded-xl border border-[#1e2436] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#c8ff3d] shrink-0 mt-0.5" />
            <span>AI Host комментирует эфир и помогает участникам. Решения принимают только судьи-люди.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
