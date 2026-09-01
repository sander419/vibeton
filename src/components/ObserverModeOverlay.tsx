import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Maximize2,
  Minimize2,
  Radio,
  Trophy,
  Flame,
  Sparkles,
  Bot,
  Zap,
  Volume2,
  VolumeX,
  X,
  Swords
} from "lucide-react";

interface ObserverModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObserverModeOverlay: React.FC<ObserverModeOverlayProps> = ({ isOpen, onClose }) => {
  const { hackathon, leaderboard, activeDuel, aiMessages, posts, soundEnabled, toggleSound } = useHackathon();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const latestAiMessage = aiMessages[0];
  const latestPost = posts[0];
  const topTeams = leaderboard.slice(0, 5);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white font-mono flex flex-col justify-between overflow-hidden select-none animate-in fade-in">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#BAFF00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Esports Broadcast Bar */}
      <div className="relative z-10 p-6 border-b border-[#222] bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>OBSERVER BROADCAST MODE</span>
          </div>

          <div className="h-6 w-px bg-[#333]" />

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
              {hackathon?.title || "Competition OS Live Arena"}
            </h2>
            <p className="text-[11px] text-[#BAFF00] uppercase font-bold">
              Стадия: {hackathon?.stage} • Призовой фонд: {hackathon?.prizePool || "100 000 ₽"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] transition-all"
            title="Звуки эфира"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#BAFF00]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-[#141414] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] transition-all"
            title="Полноэкранный режим"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 transition-all font-bold"
            title="Выйти из режима наблюдателя"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Broadcast Stage */}
      <div className="relative z-10 p-6 sm:p-10 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        {/* Left: AI Host Companion & Live Feed */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="rounded-3xl bg-[#0D0D0D] border border-[#262626] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#BAFF00]/10 border border-[#BAFF00]/30 text-[#BAFF00] flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">AI Host Commentary</h4>
                  <p className="text-[10px] text-[#777]">Нейросетевой ведущий эфира</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-500/30 text-[10px] uppercase font-bold">
                Live Analysis
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#222] text-xs text-[#DDD] leading-relaxed">
              {latestAiMessage?.content || "Добро пожаловать в прямой эфир соревнований! Все команды активно пушат код в Devlog."}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#888]">
              <Sparkles className="w-3 h-3 text-[#BAFF00]" />
              <span>Голосовой движок Web Audio активирован</span>
            </div>
          </div>

          {/* Latest Devlog Milestone */}
          {latestPost && (
            <div className="rounded-3xl bg-[#0D0D0D] border border-[#262626] p-5 space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#777]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Свежий майлстоун</span>
                </span>
                <span>{new Date(latestPost.createdAt).toLocaleTimeString("ru-RU")}</span>
              </div>
              <p className="text-xs text-white font-bold">{latestPost.milestone || latestPost.content}</p>
              <div className="text-[10px] text-[#888]">
                Автор: <span className="text-[#BAFF00]">{latestPost.authorName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Live Duel Arena or Main Event Stage */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#262626] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          {activeDuel ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-black text-white uppercase">
                    1v1 CYBER DUEL: {activeDuel.participantA.name} VS {activeDuel.participantB.name}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-xl bg-red-600/20 text-red-400 text-xs font-bold uppercase border border-red-500/30">
                  РАУНД #{activeDuel.currentRound}
                </span>
              </div>

              {/* Central duel scoreboard */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 text-center space-y-2">
                  <div className="text-xs text-[#888] uppercase">{activeDuel.participantA.name}</div>
                  <div className="text-4xl font-black text-red-400">{activeDuel.participantA.score}</div>
                  <div className="text-[10px] text-red-300">Голосов зрителей: {activeDuel.participantA.votes}</div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-900/40 text-center space-y-2">
                  <div className="text-xs text-[#888] uppercase">{activeDuel.participantB.name}</div>
                  <div className="text-4xl font-black text-blue-400">{activeDuel.participantB.score}</div>
                  <div className="text-[10px] text-blue-300">Голосов зрителей: {activeDuel.participantB.votes}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-[#222] text-center space-y-1">
                <div className="text-[10px] text-[#777] uppercase font-bold">Текущее испытание</div>
                <div className="text-xs text-white font-medium">{activeDuel.roundPrompt}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#BAFF00]" />
                  <h3 className="text-lg font-black text-white uppercase">Текущая турнирная таблица</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#BAFF00]/10 text-[#BAFF00] text-xs font-bold uppercase border border-[#BAFF00]/30">
                  TOP-5 LEADERBOARD
                </span>
              </div>

              <div className="space-y-2.5">
                {topTeams.map((item, idx) => (
                  <div
                    key={item.teamId}
                    className="p-3.5 rounded-2xl bg-[#141414] border border-[#222] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${idx === 0 ? 'bg-[#BAFF00] text-black shadow-md' : 'bg-[#222] text-white'}`}>
                        #{item.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white">{item.teamName}</div>
                        <div className="text-[10px] text-[#777]">Проект: {item.projectTitle}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[#BAFF00] font-black text-sm">{item.totalScore} PTS</div>
                      <div className="text-[10px] text-[#666]">Сдано: {item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Stream Status */}
          <div className="pt-4 border-t border-[#222] flex items-center justify-between text-xs text-[#777]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#BAFF00]" />
              <span>Realtime Server Authoritative SSE Sync (60 fps ticker)</span>
            </div>
            <span>Press [ESC] to exit</span>
          </div>
        </div>
      </div>

      {/* Running Bottom Broadcast Ticker */}
      <div className="relative z-10 bg-[#0A0A0A] border-t border-[#262626] px-6 py-2.5 flex items-center gap-4 text-xs overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#BAFF00] text-black font-bold uppercase text-[10px] whitespace-nowrap shadow-sm">
          <span>LIVE TICKER</span>
        </div>
        <div className="truncate text-[#AAA]">
          ⚡ {latestAiMessage?.content || "Хакатон идет в режиме реального времени. Экспертное жюри и AI Host проводят мониторинг проектов."}
        </div>
      </div>
    </div>
  );
};
