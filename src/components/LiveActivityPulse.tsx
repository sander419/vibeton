import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Zap, 
  Flame, 
  Clock, 
} from "lucide-react";
import type { EventType } from "../types";
import { sound } from "../utils/audio";

export const LiveActivityPulse: React.FC = () => {
  const { events, leaderboard } = useHackathon();
  const [filterType, setFilterType] = useState<string>("ALL");

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case "MVP_MARKED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c8ff3d]/20 text-[#c8ff3d] border border-[#c8ff3d]/40">🚀 MVP</span>;
      case "PROGRESS_POSTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#121627] text-[#c8ff3d] border border-[#1e2436]">📝 DEVLOG</span>;
      case "DEMO_POSTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#41f0ff]/20 text-[#41f0ff] border border-[#41f0ff]/30">🎬 DEMO</span>;
      case "SUBMISSION_CREATED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffb020]/20 text-[#ffb020] border border-[#ffb020]/30">🏁 СДАЧА</span>;
      case "TEAM_CREATED":
      case "TEAM_INVITE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e9edf8]/10 text-[#e9edf8] border border-[#1e2436]">👥 КОМАНДА</span>;
      case "AI_HOST_BROADCAST":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#c8ff3d] text-[#06070c] shadow-[0_0_8px_rgba(200,255,61,0.3)]">🎙 AI HOST</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0e111c] text-[#8b93ad] border border-[#1e2436]">СОБЫТИЕ</span>;
    }
  };

  const filteredEvents = events.filter(e => {
    if (filterType === "ALL") return true;
    if (filterType === "MVP") return e.type === "MVP_MARKED" || e.type === "DEMO_POSTED";
    if (filterType === "DEVLOG") return e.type === "PROGRESS_POSTED";
    if (filterType === "TEAM") return e.type === "TEAM_CREATED" || e.type === "TEAM_INVITE" || e.type === "USER_JOINED";
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 font-mono">
      {/* Left 7 Cols: Live Activity Feed */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0c14] p-4 rounded-2xl border border-[#1e2436]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c8ff3d]/10 text-[#c8ff3d] flex items-center justify-center border border-[#c8ff3d]/30">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Лента реального времени</h3>
              <p className="text-xs text-[#8b93ad]">Пульс происходящего прямо сейчас на Вайбатоне</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-[#0e111c] p-1 rounded-xl border border-[#1e2436] text-xs">
            {["ALL", "DEVLOG", "MVP", "TEAM"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  sound.playClick();
                  setFilterType(f);
                }}
                className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${
                  filterType === f
                    ? "bg-[#c8ff3d] text-[#06070c] font-black"
                    : "text-[#8b93ad] hover:text-white"
                }`}
              >
                {f === "ALL" ? "Все" : f === "DEVLOG" ? "Devlog" : f === "MVP" ? "MVP/Демо" : "Команды"}
              </button>
            ))}
          </div>
        </div>

        {/* Stream Items List */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-[#0a0c14] rounded-2xl border border-[#1e2436] text-[#8b93ad] text-xs">
              Событий в этой категории пока нет
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-[#0a0c14] hover:bg-[#0e111c] border border-[#1e2436] hover:border-[#c8ff3d]/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="mt-0.5 shrink-0">
                  {getEventBadge(ev.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-[#e9edf8] group-hover:text-white transition-colors leading-snug">
                    {ev.message}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8b93ad] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {ev.teamName && (
                      <span className="text-[#8b93ad] bg-[#0e111c] px-1.5 py-0.2 rounded border border-[#1e2436]">
                        {ev.teamName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right 5 Cols: Activity Leaderboard ("Пульс Вайбатона") */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-[#0a0c14] p-4 rounded-2xl border border-[#1e2436]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#c8ff3d]/10 text-[#c8ff3d] flex items-center justify-center border border-[#c8ff3d]/30">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Пульс активности</h3>
                <p className="text-[10px] text-[#8b93ad]">Динамика команд (не оценка жюри)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#c8ff3d]/10 text-[#c8ff3d] px-2 py-0.5 rounded border border-[#c8ff3d]/30 font-bold">
              ACTIVITY INDEX
            </span>
          </div>
        </div>

        {/* Leaderboard Ranking Cards */}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {leaderboard.map((item, idx) => (
            <div
              key={item.teamId || item.authorId || idx}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                idx === 0
                  ? "bg-[#0e111c] border-[#c8ff3d]/50 shadow-[0_0_15px_rgba(200,255,61,0.15)]"
                  : "bg-[#0a0c14] border-[#1e2436] hover:border-[#2a3148]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  idx === 0 ? "bg-[#c8ff3d] text-[#06070c] shadow-md font-black" :
                  idx === 1 ? "bg-white text-[#06070c]" :
                  idx === 2 ? "bg-[#41f0ff] text-[#06070c]" : "bg-[#121627] text-[#8b93ad] border border-[#1e2436]"
                }`}>
                  #{idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</span>
                    {item.tag && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0e111c] text-[#c8ff3d] border border-[#1e2436]">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.projectTitle && (
                      <span className="text-xs text-[#8b93ad] truncate max-w-[150px] sm:max-w-[200px]">
                        {item.projectTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badges & Score */}
              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <div className="flex items-center gap-1">
                  {item.mvpReached && (
                    <span title="Опубликован рабочий MVP" className="text-xs px-1.5 py-0.5 rounded bg-[#c8ff3d]/15 text-[#c8ff3d] border border-[#c8ff3d]/30 font-mono font-bold">
                      MVP
                    </span>
                  )}
                  {item.demoReached && (
                    <span title="Доступно интерактивное демо" className="text-xs px-1.5 py-0.5 rounded bg-[#41f0ff]/20 text-[#41f0ff] border border-[#41f0ff]/30 font-mono font-bold">
                      DEMO
                    </span>
                  )}
                  {item.submitted && (
                    <span title="Финальная работа сдана" className="text-xs px-1.5 py-0.5 rounded bg-[#c8ff3d] text-[#06070c] font-mono font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="bg-[#0e111c] px-2.5 py-1 rounded-xl border border-[#1e2436] text-right">
                  <div className="text-sm font-mono font-bold text-[#c8ff3d] leading-none">
                    {item.eventsCount}
                  </div>
                  <div className="text-[8px] text-[#8b93ad] font-mono uppercase">событий</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
