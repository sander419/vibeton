import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Zap, 
  Flame, 
  Award, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Radio, 
  Sparkles, 
  Code, 
  Send,
  Users
} from "lucide-react";
import type { EventType } from "../types";

export const LiveActivityPulse: React.FC = () => {
  const { events, leaderboard, teams, projects } = useHackathon();
  const [filterType, setFilterType] = useState<string>("ALL");

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case "MVP_MARKED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">🚀 MVP</span>;
      case "PROGRESS_POSTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#BAFF00] border border-[#333]">📝 DEVLOG</span>;
      case "DEMO_POSTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🎬 DEMO</span>;
      case "SUBMISSION_CREATED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🏁 СДАЧА</span>;
      case "TEAM_CREATED":
      case "TEAM_INVITE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white border border-[#333]">👥 КОМАНДА</span>;
      case "AI_HOST_BROADCAST":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00] text-black shadow-[0_0_8px_rgba(186,255,0,0.3)]">🎙 AI HOST</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151515] text-[#888] border border-[#333]">СОБЫТИЕ</span>;
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
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0A] p-4 rounded-2xl border border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BAFF00]/10 text-[#BAFF00] flex items-center justify-center border border-[#BAFF00]/30">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Лента реального времени</h3>
              <p className="text-xs text-[#888]">Пульс происходящего прямо сейчас на Вайбатоне</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-[#262626] text-xs">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${filterType === "ALL" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
            >
              Все
            </button>
            <button
              onClick={() => setFilterType("DEVLOG")}
              className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${filterType === "DEVLOG" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
            >
              Devlog
            </button>
            <button
              onClick={() => setFilterType("MVP")}
              className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${filterType === "MVP" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
            >
              MVP/Демо
            </button>
            <button
              onClick={() => setFilterType("TEAM")}
              className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${filterType === "TEAM" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
            >
              Команды
            </button>
          </div>
        </div>

        {/* Stream Items List */}
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-[#0A0A0A] rounded-2xl border border-[#222] text-[#666] text-xs">
              Событий в этой категории пока нет
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#121212] border border-[#262626] hover:border-[#BAFF00]/50 transition-all flex items-start gap-3.5 group"
              >
                <div className="mt-0.5 shrink-0">
                  {getEventBadge(ev.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-[#DDD] group-hover:text-white transition-colors leading-snug">
                    {ev.message}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#666] font-mono">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    {ev.teamName && (
                      <span className="text-[#AAA] bg-[#151515] px-1.5 py-0.2 rounded border border-[#262626]">
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
        <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#BAFF00]/10 text-[#BAFF00] flex items-center justify-center border border-[#BAFF00]/30">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Пульс активности</h3>
                <p className="text-[10px] text-[#888]">Динамика команд (не оценка жюри)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-[#BAFF00]/10 text-[#BAFF00] px-2 py-0.5 rounded border border-[#BAFF00]/30">
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
                  ? "bg-[#111] border-[#BAFF00]/50 shadow-[0_0_15px_rgba(186,255,0,0.15)]"
                  : "bg-[#0A0A0A] border-[#262626] hover:border-[#444]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  idx === 0 ? "bg-[#BAFF00] text-black shadow-md" :
                  idx === 1 ? "bg-white text-black" :
                  idx === 2 ? "bg-[#555] text-white" : "bg-[#151515] text-[#777] border border-[#222]"
                }`}>
                  #{idx + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</span>
                    {item.tag && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#151515] text-[#BAFF00] border border-[#333]">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.projectTitle && (
                      <span className="text-xs text-[#888] truncate max-w-[150px] sm:max-w-[200px]">
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
                    <span title="Опубликован рабочий MVP" className="text-xs px-1.5 py-0.5 rounded bg-[#BAFF00]/15 text-[#BAFF00] border border-[#BAFF00]/30 font-mono font-bold">
                      MVP
                    </span>
                  )}
                  {item.demoReached && (
                    <span title="Доступно интерактивное демо" className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                      DEMO
                    </span>
                  )}
                  {item.submitted && (
                    <span title="Финальная работа сдана" className="text-xs px-1.5 py-0.5 rounded bg-[#BAFF00] text-black font-mono font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="bg-[#151515] px-2.5 py-1 rounded-xl border border-[#262626] text-right">
                  <div className="text-sm font-mono font-bold text-[#BAFF00] leading-none">
                    {item.eventsCount}
                  </div>
                  <div className="text-[8px] text-[#666] font-mono uppercase">событий</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
