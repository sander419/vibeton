import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Sparkles, 
  Users, 
  Flame, 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Award,
  Zap,
  Code
} from "lucide-react";

interface HeroProps {
  onOpenFastDevlog: () => void;
  onOpenSubmission: () => void;
  onOpenRegister: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const HeroEventSection: React.FC<HeroProps> = ({
  onOpenFastDevlog,
  onOpenSubmission,
  onOpenRegister,
  onNavigateToTab
}) => {
  const { hackathon, users, teams, projects, posts, submissions, currentUser } = useHackathon();

  // Realtime Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const target = new Date(hackathon?.submissionDeadline || Date.now() + 5 * 24 * 3600 * 1000).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hackathon?.submissionDeadline]);

  const mvpCount = projects.filter(p => p.status === 'MVP' || p.status === 'DEMO' || p.status === 'SUBMITTED').length;
  const userTeam = teams.find(t => t.id === currentUser?.teamId);
  const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);

  const stages = [
    { id: "REGISTRATION", label: "Набор" },
    { id: "ACTIVE", label: "Разработка" },
    { id: "SUBMISSION", label: "Прием работ" },
    { id: "JUDGING", label: "Судейство" },
    { id: "RESULTS", label: "Итоги" }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === hackathon?.stage);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-[#333] p-6 sm:p-10 shadow-2xl mb-8">
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#BAFF00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Stage Stepper Bar */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[500px] bg-[#111] p-2 rounded-2xl border border-[#222]">
          {stages.map((st, idx) => {
            const isPassed = currentStageIndex > idx;
            const isCurrent = hackathon?.stage === st.id || (currentStageIndex === -1 && idx === 1);
            return (
              <React.Fragment key={st.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.4)] ring-4 ring-[#BAFF00]/20"
                      : isPassed
                      ? "bg-[#1A1A1A] text-[#BAFF00] border border-[#BAFF00]/40"
                      : "bg-[#141414] text-[#555] border border-[#222]"
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${isCurrent ? "text-white font-bold" : isPassed ? "text-[#AAA]" : "text-[#555]"}`}>
                    {st.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-3 ${isPassed ? "bg-[#BAFF00]/40" : "bg-[#222]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Topic & Event Info */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BAFF00]/10 border border-[#BAFF00]/30 text-[#BAFF00] text-xs font-mono font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-ping" />
            ГЛАВНЫЙ СТАРТ ОСЕНИ // VIBE_MODE_ON
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono uppercase leading-[1.05]">
            {hackathon?.title || "Вайбатон №2"}
          </h1>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#111] border border-[#333]">
            <div className="text-[11px] text-[#888] uppercase font-mono tracking-widest mb-1.5 flex items-center justify-between">
              <span>ТЕМА ХАКАТОНА</span>
              <span className="text-[#BAFF00]">STAGE: {hackathon?.stage || "ACTIVE"}</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-[#BAFF00] font-mono tracking-tight">
              {hackathon?.theme || "Платформа для проведения Вайбатонов"}
            </div>
            <p className="text-xs sm:text-sm text-[#AAA] mt-2 leading-relaxed font-mono">
              {hackathon?.description || "Создайте живой сервис автоматизации хакатонов с AI Host, непрерывным Devlog и прозрачным судейством."}
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111] border border-[#333] text-[#DDD]">
              <Users className="w-4 h-4 text-[#BAFF00]" />
              <span><strong>{users.length}</strong> участников</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111] border border-[#333] text-[#DDD]">
              <Flame className="w-4 h-4 text-orange-400" />
              <span><strong>{teams.length}</strong> команд</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111] border border-[#333] text-[#DDD]">
              <Code className="w-4 h-4 text-cyan-400" />
              <span><strong>{mvpCount}</strong> MVP готово</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111] border border-[#333] text-[#DDD]">
              <Zap className="w-4 h-4 text-[#BAFF00]" />
              <span><strong>{posts.length}</strong> апдейтов</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={onOpenFastDevlog}
              className="px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase bg-[#BAFF00] text-black hover:bg-[#d4ff33] shadow-[0_0_15px_rgba(186,255,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Опубликовать прогресс (30 сек)</span>
            </button>

            {hackathon?.stage === "SUBMISSION" || hackathon?.stage === "ACTIVE" ? (
              <button
                onClick={onOpenSubmission}
                className="px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase bg-[#151515] hover:bg-[#202020] text-white border border-[#333] hover:border-[#BAFF00] transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#BAFF00]" />
                <span>Сдать финальный проект</span>
              </button>
            ) : null}

            {hackathon?.stage === "RESULTS" ? (
              <button
                onClick={() => onNavigateToTab("judging")}
                className="px-5 py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase bg-gradient-to-r from-amber-400 to-[#BAFF00] text-black shadow-lg shadow-amber-500/25 flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Смотреть победителей & Recap</span>
              </button>
            ) : null}

            {!currentUser?.teamId && (
              <button
                onClick={() => onNavigateToTab("matching")}
                className="px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider text-[#AAA] hover:text-[#BAFF00] hover:bg-[#151515] border border-[#222] hover:border-[#333] transition-all flex items-center gap-1.5"
              >
                <span>Найти команду с AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Huge High-Contrast Countdown in Artistic Flair Style */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e0e0e] border border-[#333] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center">
            <div className="text-xs font-mono text-[#BAFF00] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span>ДО ДЕДЛАЙНА ПРИЕМА РАБОТ</span>
            </div>

            {/* Big Countdown Digits */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 my-4">
              <div className="bg-[#151515] border border-[#262626] rounded-2xl p-3 sm:p-4">
                <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-[#888] font-mono mt-1 uppercase">Дней</div>
              </div>

              <div className="bg-[#151515] border border-[#262626] rounded-2xl p-3 sm:p-4">
                <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-[#888] font-mono mt-1 uppercase">Часов</div>
              </div>

              <div className="bg-[#151515] border border-[#262626] rounded-2xl p-3 sm:p-4">
                <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-[#888] font-mono mt-1 uppercase">Мин</div>
              </div>

              <div className="bg-[#151515] border border-[#BAFF00]/50 rounded-2xl p-3 sm:p-4 shadow-[0_0_12px_rgba(186,255,0,0.2)]">
                <div className="text-3xl sm:text-5xl font-black text-[#BAFF00] font-mono tracking-tight animate-pulse">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-[#BAFF00] font-mono mt-1 uppercase">Сек</div>
              </div>
            </div>

            {/* Current User Status Banner */}
            <div className="mt-5 pt-4 border-t border-[#222] text-xs text-[#AAA] font-mono flex items-center justify-between">
              <div className="text-left">
                <div className="text-[10px] text-[#666] uppercase">Ваш статус:</div>
                <div className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#BAFF00]"></span>
                  {userTeam ? `Команда "${userTeam.name}"` : "Соло"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#666] uppercase">Проект:</div>
                <div className="font-bold text-[#BAFF00]">
                  {userProject?.status || "IDEA"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
