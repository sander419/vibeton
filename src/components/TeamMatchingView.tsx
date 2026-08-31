import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import { Sparkles, Users, UserPlus, Check, Bot, Loader2, Zap } from "lucide-react";
import type { TeamMatchSuggestion } from "../types";

export const TeamMatchingView: React.FC = () => {
  const { currentUser, matchTeamAI, joinTeam, teams } = useHackathon();
  const [suggestions, setSuggestions] = useState<TeamMatchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [joinedTeamId, setJoinedTeamId] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await matchTeamAI(currentUser.id);
      setSuggestions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser?.id]);

  const handleJoin = async (teamId: string) => {
    await joinTeam(teamId);
    setJoinedTeamId(teamId);
  };

  return (
    <div className="space-y-6 mb-8 font-mono">
      {/* Header Banner */}
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#BAFF00] text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(186,255,0,0.3)]">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#BAFF00] uppercase tracking-wider">AI MATCHMAKING</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#BAFF00] border border-[#333]">GEMINI ENGINE</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase tracking-wider mt-1">
                Подбор идеальной команды
              </h3>
              <p className="text-xs text-[#888] mt-1 font-mono">
                Система анализирует ваш стек ({currentUser?.skills.join(", ") || "Fullstack"}) и находит команды с недостающими компетенциями
              </p>
            </div>
          </div>

          <button
            onClick={fetchMatches}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold font-mono uppercase text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(186,255,0,0.3)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Пересчитать совместимость</span>
          </button>
        </div>
      </div>

      {/* Matching Results */}
      {isLoading ? (
        <div className="p-16 text-center bg-[#0A0A0A] rounded-3xl border border-[#333] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#BAFF00] mx-auto" />
          <div className="text-xs sm:text-sm font-mono text-[#AAA]">AI анализирует баланс стека и свободные слоты в командах...</div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-12 text-center bg-[#0A0A0A] rounded-3xl border border-[#333] space-y-3 font-mono">
          <Users className="w-8 h-8 text-[#666] mx-auto" />
          <div className="text-xs sm:text-sm font-medium text-[#AAA]">Рекомендаций пока нет или вы уже состоите в укомплектованной команде</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((sug) => {
            const team = teams.find(t => t.id === sug.teamId);
            const isJoined = joinedTeamId === sug.teamId || currentUser?.teamId === sug.teamId;

            return (
              <div
                key={sug.teamId}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#BAFF00]/50 rounded-3xl p-6 shadow-xl space-y-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#151515] text-[#BAFF00] border border-[#333] font-bold flex items-center justify-center font-mono text-xs">
                        {team?.tag || "VIBE"}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-mono uppercase">{sug.teamName}</h4>
                        <span className="text-xs text-[#888] font-mono">
                          {team?.members.length || 2}/4 участников
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="px-3 py-1 rounded-full bg-[#BAFF00]/10 border border-[#BAFF00]/40 text-[#BAFF00] font-mono font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{sug.matchScore}% Совместимость</span>
                    </div>
                  </div>

                  {/* AI Synergy Reasoning */}
                  <div className="bg-[#111] p-4 rounded-2xl border border-[#262626] space-y-2 font-mono">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#BAFF00] uppercase font-semibold">
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Синергия:</span>
                    </div>
                    <p className="text-xs text-[#DDD] leading-relaxed">
                      {sug.reason}
                    </p>
                  </div>

                  {/* Complementary Skills */}
                  {sug.complementarySkills?.length > 0 && (
                    <div className="mt-3 font-mono">
                      <div className="text-[10px] text-[#888] uppercase mb-1">
                        Недостающие навыки команды, которые вы закроете:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sug.complementarySkills.map((sk, i) => (
                          <span key={i} className="text-xs font-mono px-2 py-0.5 rounded-lg bg-[#151515] text-[#BAFF00] border border-[#333] font-medium">
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#222] flex items-center justify-between font-mono">
                  <span className="text-xs text-[#888]">
                    Рекомендуемая роль: <strong className="text-white">{sug.suggestedRole}</strong>
                  </span>

                  {isJoined ? (
                    <span className="px-3 py-1.5 rounded-xl bg-[#BAFF00]/10 text-[#BAFF00] border border-[#BAFF00]/30 text-xs font-bold font-mono flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Вы в команде</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleJoin(sug.teamId)}
                      className="px-4 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black text-xs font-bold font-mono uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)] transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Вступить</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

