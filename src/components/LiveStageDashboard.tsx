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
  ShieldCheck,
  Award,
  Zap,
  Code,
  Bot,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Github,
  Plus
} from "lucide-react";
import { speakText, stopSpeech } from "../utils/audio";
import type { EventType, ProjectStatus } from "../types";

interface LiveStageDashboardProps {
  onOpenFastDevlog: () => void;
  onOpenSubmission: () => void;
  onOpenRegister: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const LiveStageDashboard: React.FC<LiveStageDashboardProps> = ({
  onOpenFastDevlog,
  onOpenSubmission,
  onOpenRegister,
  onNavigateToTab
}) => {
  const { 
    hackathon, 
    users, 
    teams, 
    projects, 
    posts, 
    events, 
    leaderboard, 
    currentUser, 
    aiMessages, 
    askAIHost, 
    triggerAIHostBroadcast 
  } = useHackathon();

  // Deadline Countdown
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
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isExpired: false
      });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hackathon?.submissionDeadline]);

  // Feed Filter
  const [eventFilter, setEventFilter] = useState<string>("ALL");

  // AI Host Audio & Interaction State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [aiHostInput, setAiHostInput] = useState<string>("");
  const [hostAnswer, setHostAnswer] = useState<string | null>(null);
  const [asciiEmotion, setAsciiEmotion] = useState<string>("[ ◉ _ ◉ ]");

  const latestBroadcast = aiMessages[0] || {
    id: "default",
    title: "ВАЙБАТОН №2 В ЭФИРЕ",
    content: "Добро пожаловать на Вайбатон №2! 7 дней разработки. Публикуйте Devlog раз в несколько часов, объединяйтесь в команды и показывайте рабочие прототипы.",
    createdAt: new Date().toISOString()
  };

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      setAsciiEmotion("[ ◉ _ ◉ ]");
    } else {
      setIsSpeaking(true);
      setAsciiEmotion("[ ⚡ ~ ⚡ ]");
      const textToRead = hostAnswer || `${latestBroadcast.title}. ${latestBroadcast.content}`;
      speakText(textToRead, () => {
        setIsSpeaking(false);
        setAsciiEmotion("[ ◉ _ ◉ ]");
      });
    }
  };

  const handleAskHost = async (questionText: string) => {
    if (!questionText.trim() || isQuerying) return;
    try {
      setIsQuerying(true);
      setAsciiEmotion("[ ✦ * ✦ ]");
      const ans = await askAIHost(questionText, "streamer");
      setHostAnswer(ans);
      setAiHostInput("");
      // Voice answer
      setIsSpeaking(true);
      setAsciiEmotion("[ ⚡ ~ ⚡ ]");
      speakText(ans, () => {
        setIsSpeaking(false);
        setAsciiEmotion("[ ◉ _ ◉ ]");
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  const stages = [
    { id: "REGISTRATION", label: "1. Набор" },
    { id: "ACTIVE", label: "2. Разработка" },
    { id: "SUBMISSION", label: "3. Прием работ" },
    { id: "JUDGING", label: "4. Судейство" },
    { id: "RESULTS", label: "5. Итоги" }
  ];
  const currentStageIndex = stages.findIndex(s => s.id === hackathon?.stage);

  const filteredEvents = events.filter(e => {
    if (eventFilter === "ALL") return true;
    if (eventFilter === "DEVLOG") return e.type === "PROGRESS_POSTED";
    if (eventFilter === "MVP") return e.type === "MVP_MARKED" || e.type === "DEMO_POSTED";
    if (eventFilter === "TEAM") return e.type === "TEAM_CREATED" || e.type === "TEAM_INVITE" || e.type === "USER_JOINED";
    return true;
  });

  const userTeam = teams.find(t => t.id === currentUser?.teamId);
  const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);
  const mvpCount = projects.filter(p => p.status === "MVP" || p.status === "DEMO" || p.status === "SUBMITTED").length;

  return (
    <div className="space-y-8 mb-12 font-mono">
      {/* 1. TOP HERO COMMAND BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0C0C0C] border border-[#333] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#BAFF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Pipeline Indicator */}
        <div className="mb-6 overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[520px] bg-[#141414] p-2 rounded-2xl border border-[#222]">
            {stages.map((st, idx) => {
              const isPassed = currentStageIndex > idx;
              const isCurrent = hackathon?.stage === st.id || (currentStageIndex === -1 && idx === 1);
              return (
                <React.Fragment key={st.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.4)] ring-2 ring-[#BAFF00]/30"
                        : isPassed
                        ? "bg-[#1A1A1A] text-[#BAFF00] border border-[#BAFF00]/40"
                        : "bg-[#121212] text-[#555] border border-[#222]"
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-mono uppercase tracking-wider ${isCurrent ? "text-white font-bold" : isPassed ? "text-[#AAA]" : "text-[#555]"}`}>
                      {st.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-2 ${isPassed ? "bg-[#BAFF00]/40" : "bg-[#222]"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Event Title + Live Countdown Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Info Side */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BAFF00]/10 border border-[#BAFF00]/30 text-[#BAFF00] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-ping" />
              LIVE HACKATHON STATION // VIBE_MODE_ON
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              {hackathon?.title || "Вайбатон №2"}
            </h1>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="text-[10px] text-[#888] uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>ТЕМА СОРЕВНОВАНИЯ</span>
                <span className="text-[#BAFF00]">ЭТАП: {hackathon?.stage || "ACTIVE"}</span>
              </div>
              <div className="text-base sm:text-xl font-bold text-[#BAFF00]">
                {hackathon?.theme || "Платформа для проведения Вайбатонов"}
              </div>
              <p className="text-xs text-[#AAA] mt-1.5 leading-relaxed">
                {hackathon?.description || "Создайте платформу для хакатонов с AI Host, непрерывным Devlog и прозрачной оценкой жюри."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenFastDevlog}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase bg-[#BAFF00] text-black hover:bg-[#d4ff33] shadow-[0_0_12px_rgba(186,255,0,0.3)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Написать в Devlog (30 сек)</span>
              </button>

              <button
                onClick={onOpenSubmission}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase bg-[#181818] hover:bg-[#222] text-white border border-[#333] hover:border-[#BAFF00] transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#BAFF00]" />
                <span>Сдать проект</span>
              </button>

              <button
                onClick={() => onNavigateToTab("projects")}
                className="px-3.5 py-2.5 rounded-xl text-xs uppercase text-[#AAA] hover:text-[#BAFF00] bg-[#121212] hover:bg-[#181818] border border-[#262626] transition-all flex items-center gap-1.5"
              >
                <span>Команды & Проекты</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Countdown Side */}
          <div className="lg:col-span-5">
            <div className="bg-[#121212] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xl text-center">
              <div className="text-[11px] text-[#BAFF00] uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                <span>ДО ДЕДЛАЙНА ПРИЕМА РАБОТ</span>
              </div>

              <div className="grid grid-cols-4 gap-2 my-2">
                <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-2.5">
                  <div className="text-2xl sm:text-4xl font-black text-white">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] text-[#888] uppercase mt-0.5">Дней</div>
                </div>

                <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-2.5">
                  <div className="text-2xl sm:text-4xl font-black text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] text-[#888] uppercase mt-0.5">Часов</div>
                </div>

                <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl p-2.5">
                  <div className="text-2xl sm:text-4xl font-black text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] text-[#888] uppercase mt-0.5">Мин</div>
                </div>

                <div className="bg-[#181818] border border-[#BAFF00]/50 rounded-2xl p-2.5 shadow-[0_0_10px_rgba(186,255,0,0.2)]">
                  <div className="text-2xl sm:text-4xl font-black text-[#BAFF00] animate-pulse">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[9px] text-[#BAFF00] uppercase mt-0.5">Сек</div>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-3 border-t border-[#222] text-xs flex items-center justify-between text-[#888]">
                <span>Ваш статус: <strong className="text-white">{userTeam ? userTeam.name : "Соло"}</strong></span>
                <span>MVP: <strong className="text-[#BAFF00]">{userProject?.status || "IDEA"}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TWO-COLUMN COMMAND STAGE: LEFT = DEVLOG & LIVE STREAM, RIGHT = AI HOST & LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE DEVLOG & PULSE FEED (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0C0C0C] p-4 rounded-2xl border border-[#333]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#BAFF00]/10 text-[#BAFF00] flex items-center justify-center border border-[#BAFF00]/30">
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Эфир разработки & Devlog</h3>
                <p className="text-[10px] text-[#888]">События и коммиты участников в реальном времени</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#262626] text-[11px]">
              <button
                onClick={() => setEventFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${eventFilter === "ALL" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
              >
                Все
              </button>
              <button
                onClick={() => setEventFilter("DEVLOG")}
                className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${eventFilter === "DEVLOG" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
              >
                Devlog
              </button>
              <button
                onClick={() => setEventFilter("MVP")}
                className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${eventFilter === "MVP" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
              >
                MVP
              </button>
              <button
                onClick={() => setEventFilter("TEAM")}
                className={`px-2.5 py-1 rounded-lg uppercase transition-colors ${eventFilter === "TEAM" ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"}`}
              >
                Команды
              </button>
            </div>
          </div>

          {/* Quick CTA to Devlog Tab */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#121212] border border-[#262626]">
            <span className="text-xs text-[#AAA]">Хотите подробный разбор или комментировать посты?</span>
            <button
              onClick={() => onNavigateToTab("devlog")}
              className="text-xs font-bold text-[#BAFF00] hover:underline flex items-center gap-1"
            >
              <span>Открыть Devlog ленту →</span>
            </button>
          </div>

          {/* Event Stream List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center bg-[#0C0C0C] rounded-2xl border border-[#222] text-[#666] text-xs">
                Событий пока нет
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl bg-[#0C0C0C] hover:bg-[#141414] border border-[#262626] hover:border-[#444] transition-all flex items-start gap-3.5 group"
                >
                  <div className="mt-0.5 shrink-0">
                    {ev.type === "MVP_MARKED" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">🚀 MVP</span>
                    ) : ev.type === "PROGRESS_POSTED" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#181818] text-[#BAFF00] border border-[#333]">📝 DEVLOG</span>
                    ) : ev.type === "DEMO_POSTED" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🎬 DEMO</span>
                    ) : ev.type === "SUBMISSION_CREATED" ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#BAFF00] text-black">🏁 СДАНО</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#181818] text-white border border-[#333]">👥 TEAM</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-[#E0E0E0] group-hover:text-white leading-snug">
                      {ev.message}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#666]">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {ev.teamName && (
                        <span className="text-[#AAA] bg-[#161616] px-1.5 py-0.2 rounded border border-[#262626]">
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

        {/* RIGHT COLUMN: AI HOST CO-PILOT + ACTIVITY LEADERBOARD (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI HOST ENTITY CO-PILOT CARD */}
          <div className="bg-[#0C0C0C] border border-[#BAFF00]/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(186,255,0,0.12)] space-y-4">
            {/* Host Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#161616] border border-[#BAFF00] flex items-center justify-center text-[#BAFF00] font-black text-xs shadow-[0_0_10px_rgba(186,255,0,0.3)]">
                  [ ⚡ ]
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Host Entity</span>
                    <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-ping" />
                  </div>
                  <span className="text-[10px] text-[#BAFF00]">ONLINE // ГОЛОС ЭФИРА</span>
                </div>
              </div>

              <button
                onClick={handleToggleVoice}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] flex items-center gap-1.5 transition-all ${
                  isSpeaking
                    ? "bg-[#BAFF00] text-black shadow-[0_0_12px_rgba(186,255,0,0.4)]"
                    : "bg-[#181818] hover:bg-[#222] text-white border border-[#333]"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Стоп голос" : "Слушать Host"}</span>
              </button>
            </div>

            {/* ASCII Face & Holographic Box */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#222] text-center space-y-2">
              <div className="font-black text-base text-[#BAFF00] tracking-widest animate-pulse">
                {asciiEmotion}
              </div>
              <p className="text-xs text-[#CCC] leading-relaxed line-clamp-4">
                {hostAnswer || latestBroadcast.content}
              </p>
            </div>

            {/* Quick Query Chips */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <button
                onClick={() => handleAskHost("Какой темп хакатона и сколько MVP уже сдано?")}
                className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-[#BAFF00] border border-[#262626] transition-colors"
              >
                📊 Сводка темпа
              </button>
              <button
                onClick={() => handleAskHost("Посоветуй как быстрее сделать MVP для хакатона")}
                className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-[#BAFF00] border border-[#262626] transition-colors"
              >
                💡 Совет по MVP
              </button>
              <button
                onClick={() => handleAskHost("Какие главные критерии оценки жюри?")}
                className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-[#BAFF00] border border-[#262626] transition-colors"
              >
                ⚖️ Критерии жюри
              </button>
            </div>

            {/* In-Card Terminal Prompt Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={aiHostInput}
                onChange={(e) => setAiHostInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAskHost(aiHostInput);
                }}
                placeholder="Спросить AI-ведущего..."
                className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#BAFF00]"
              />
              <button
                onClick={() => handleAskHost(aiHostInput)}
                disabled={!aiHostInput.trim() || isQuerying}
                className="px-3 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold text-xs uppercase disabled:opacity-50 transition-all shadow-[0_0_10px_rgba(186,255,0,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ACTIVITY LEADERBOARD (PULSE) */}
          <div className="bg-[#0C0C0C] border border-[#333] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Пульс активности команд</h4>
              </div>
              <button
                onClick={() => onNavigateToTab("leaderboard")}
                className="text-[10px] text-[#BAFF00] hover:underline uppercase font-bold flex items-center gap-1"
              >
                <span>Таблица лидеров →</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {leaderboard.map((item, idx) => (
                <div
                  key={item.teamId || item.authorId || idx}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    idx === 0
                      ? "bg-[#141414] border-[#BAFF00]/40"
                      : "bg-[#101010] border-[#222]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      idx === 0 ? "bg-[#BAFF00] text-black" :
                      idx === 1 ? "bg-white text-black" :
                      idx === 2 ? "bg-[#555] text-white" : "bg-[#1c1c1c] text-[#777]"
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-[#777] truncate">{item.projectTitle || "В разработке"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    {item.mvpReached && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#BAFF00]/15 text-[#BAFF00] font-bold border border-[#BAFF00]/30">
                        MVP
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#BAFF00] font-mono">
                      {item.eventsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
