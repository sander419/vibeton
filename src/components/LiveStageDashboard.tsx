import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
  Zap, 
  Code, 
  Bot, 
  Volume2, 
  Pause,
  Plus,
  Radio,
  Swords,
  TrendingUp,
  Activity,
  UserCheck
} from "lucide-react";
import { speakText, stopSpeech, sound } from "../utils/audio";
import { EventTimeline } from "./EventTimeline";
import { CountdownTimer } from "./CountdownTimer";

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
    currentUser, 
    aiMessages, 
    askAIHost, 
    triggerAIHostBroadcast,
    activeDuel,
    voteDuel
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
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [voteNotice, setVoteNotice] = useState<string | null>(null);

  const latestBroadcast = aiMessages[0] || {
    id: "default",
    title: "ВАЙБАТОН №2 В ЭФИРЕ",
    content: "Добро пожаловать на Вайбатон №2! 7 дней разработки. Публикуйте Devlog раз в несколько часов, объединяйтесь в команды и показывайте рабочие прототипы.",
    createdAt: new Date().toISOString()
  };

  const handleToggleVoice = () => {
    sound.playClick();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = hostAnswer || `${latestBroadcast.title}. ${latestBroadcast.content}`;
      speakText(textToRead, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleAskHost = async (questionText: string) => {
    if (!questionText.trim() || isQuerying) return;
    sound.playClick();
    try {
      setIsQuerying(true);
      const ans = await askAIHost(questionText, "streamer");
      setHostAnswer(ans);
      setAiHostInput("");
      sound.playBroadcastChime();
      // Voice answer
      setIsSpeaking(true);
      speakText(ans, () => {
        setIsSpeaking(false);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleQuickVoteDuel = async (participantId: string) => {
    sound.playClick();
    try {
      setIsVoting(true);
      await voteDuel(participantId);
      sound.playSuccess();
      setVoteNotice("✓ Голос за дуэлянта принят!");
      setTimeout(() => setVoteNotice(null), 3000);
    } catch (err: any) {
      setVoteNotice(err.message || "Ошибка голосования");
      setTimeout(() => setVoteNotice(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const stages = [
    { id: "REGISTRATION", label: "Набор", code: "[01]" },
    { id: "ACTIVE", label: "Разработка", code: "[02]" },
    { id: "SUBMISSION", label: "Прием работ", code: "[03]" },
    { id: "JUDGING", label: "Судейство", code: "[04]" },
    { id: "RESULTS", label: "Итоги", code: "[05]" }
  ];
  const currentStageIndex = stages.findIndex(s => s.id === hackathon?.stage);

  const filteredEvents = events.filter(e => {
    if (eventFilter === "ALL") return true;
    if (eventFilter === "DEVLOG") return e.type === "PROGRESS_POSTED";
    if (eventFilter === "MVP") return e.type === "MVP_MARKED" || e.type === "DEMO_POSTED";
    if (eventFilter === "TEAM") return e.type === "TEAM_CREATED" || e.type === "TEAM_INVITE" || e.type === "USER_JOINED";
    if (eventFilter === "DUEL") return e.type === "AI_HOST_BROADCAST" || (e.message && e.message.includes("Дуэль"));
    return true;
  });

  const userTeam = teams.find(t => t.id === currentUser?.teamId);
  const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);
  const mvpCount = projects.filter(p => p.status === "MVP" || p.status === "DEMO" || p.status === "SUBMITTED").length;

  // Pulse Ranking Velocity
  const pulseRanking = teams.map((team, idx) => {
    const teamPosts = posts.filter(p => p.teamId === team.id);
    const teamEvs = events.filter(e => e.teamId === team.id);
    const pulseScore = teamEvs.length * 5 + teamPosts.length * 15 + (team.members.length * 10);
    const proj = projects.find(p => p.teamId === team.id);
    return {
      rank: idx + 1,
      name: team.name,
      membersCount: team.members.length,
      pulseScore,
      status: proj?.status || "BUILDING",
      hasMvp: proj?.status === "MVP" || proj?.status === "DEMO" || proj?.status === "SUBMITTED"
    };
  }).sort((a, b) => b.pulseScore - a.pulseScore);

  const quickQuestions = [
    "Сколько времени до дедлайна?",
    "Кто сейчас лидирует по Devlog?",
    "Как правильно оформить MVP?",
    "Какие критерии у жюри?"
  ];

  return (
    <div className="space-y-8 mb-14 font-mono text-[#111113]">
      {/* VARIATION 10 HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.01, ease: [0.16, 1, 0.3, 1] }}
        className="p-6 sm:p-8 bg-[#FFFFFF] border border-[#111113] shadow-[4px_4px_0px_#111113] space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="tag-box">
            OPERATOR: {currentUser?.name?.toUpperCase() || "ИВАН КОВАЛЕВ"} // SECURITY LEVEL 4
          </div>
          <div className="text-xs font-bold text-[#2563EB] tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>NODE_READY // PING 12ms</span>
          </div>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#111113] leading-none">
          BATTLE ENGINE <span className="text-[#2563EB]">LOADED.</span>
        </h1>

        <p className="text-sm sm:text-base text-[#555] max-w-2xl leading-relaxed">
          The galaxy's most advanced competition OS. Event Engine [X] // AI Host [X] // Realtime Observer [X]
        </p>

        {/* Quick Format Showcase Cards from Variation 10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="card-galactic p-4 bg-[#FFFFFF] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#888] font-bold uppercase mb-1">01 / SPRINT</div>
              <div className="font-display text-base font-bold text-[#111113] uppercase mb-1">Вайбатон №2</div>
              <p className="text-[11px] text-[#555] mb-3 leading-snug">Multi-layer platform for vibe synchronization and rapid MVP build.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenFastDevlog();
              }}
              className="action-btn text-center text-xs py-1.5"
            >
              + DEVLOG
            </button>
          </div>

          <div className="card-galactic p-4 bg-[#2563EB] text-white flex flex-col justify-between shadow-[4px_4px_0px_#111113]">
            <div>
              <div className="text-[10px] text-white/80 font-bold uppercase mb-1 flex items-center justify-between">
                <span>02 / SPEED RUN</span>
                <span className="bg-white text-[#2563EB] px-1 py-0.2 text-[9px] font-bold">[ACTIVE]</span>
              </div>
              <div className="font-display text-base font-bold text-white uppercase mb-1">Gemini Speed Run</div>
              <p className="text-[11px] text-white/90 mb-3 leading-snug">High-speed CRUD implementation using Gemini functional calling cores.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTab("duel");
              }}
              className="w-full py-1.5 px-3 bg-white text-[#2563EB] hover:bg-[#F8F7F4] font-bold text-xs uppercase border border-[#111113] transition-all text-center"
            >
              ENGAGE →
            </button>
          </div>

          <div className="card-galactic p-4 bg-[#FFFFFF] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#888] font-bold uppercase mb-1">03 / 1V1 ARENA</div>
              <div className="font-display text-base font-bold text-[#111113] uppercase mb-1">1v1 Cyber Duel</div>
              <p className="text-[11px] text-[#555] mb-3 leading-snug">15-minute high intensity algorithmic frontend showdown.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTab("duel");
              }}
              className="action-btn text-center text-xs py-1.5"
            >
              DUEL ARENA
            </button>
          </div>

          <div className="card-galactic p-4 bg-[#FFFFFF] flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-[#888] font-bold uppercase mb-1">04 / DISCOVERY</div>
              <div className="font-display text-base font-bold text-[#111113] uppercase mb-1">Каталог форматов</div>
              <p className="text-[11px] text-[#555] mb-3 leading-snug">Питчи, хакатоны, спидраны и кастомные турнирные сетки.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTab("discovery");
              }}
              className="action-btn text-center text-xs py-1.5"
            >
              EXPLORE
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1. STAGE PROGRESS TRACKER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.02, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FFFFFF] p-3 sm:p-4 border border-[#111113] shadow-[3px_3px_0px_#111113] overflow-x-auto"
      >
        <div className="flex items-center justify-between min-w-[560px]">
          {stages.map((st, idx) => {
            const isPassed = currentStageIndex > idx;
            const isCurrent = hackathon?.stage === st.id || (currentStageIndex === -1 && idx === 1);
            return (
              <React.Fragment key={st.id}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border ${
                    isCurrent
                      ? "bg-[#2563EB] text-white border-[#111113]"
                      : isPassed
                      ? "bg-[#111113] text-[#F8F7F4] border-[#111113]"
                      : "bg-[#EFECE6] text-[#888] border-[#111113]"
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] uppercase tracking-wider font-bold ${
                      isCurrent ? "text-[#2563EB]" : isPassed ? "text-[#111113]" : "text-[#888]"
                    }`}>
                      {st.label}
                    </span>
                    <span className="text-[9px] text-[#666] uppercase">
                      {isCurrent ? "[АКТИВЕН]" : isPassed ? "[ГОТОВО]" : "[ОЖИДАНИЕ]"}
                    </span>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-3 ${isPassed ? "bg-[#111113]" : "bg-[#D5D2CA]"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* HIGH-VISIBILITY EVENT MILESTONE COUNTDOWN COMPONENT */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
      >
        <CountdownTimer
          variant="hero"
          onOpenSubmission={onOpenSubmission}
          onOpenRegister={onOpenRegister}
          onOpenDevlog={onOpenFastDevlog}
          onNavigateToTab={onNavigateToTab}
        />
      </motion.div>

      {/* 2. MAIN COCKPIT: EVENT HERO + OVERVIEW MATRIX */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Left 7 Cols: Event Main Info & Command CTAs */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#111113] p-6 sm:p-8 shadow-[4px_4px_0px_#111113] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header label */}
            <div className="flex items-center justify-between border-b border-[#111113] pb-2">
              <div className="label">[02] OVERVIEW</div>
              <div className="label text-[#2563EB]">[STATUS: LIVE]</div>
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white bg-[#2563EB] border border-[#111113]">
                <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                LIVE TOURNAMENT
              </span>
              <span className="px-2 py-0.5 text-[11px] uppercase font-bold text-[#111113] border border-[#111113] bg-[#EFECE6]">
                FORMAT: {hackathon?.templateType || "VIBEATHON"}
              </span>
              <span className="px-2 py-0.5 text-[11px] uppercase font-bold text-[#666] border border-[#111113] bg-[#FFFFFF]">
                7 DAYS SPRINT
              </span>
            </div>

            {/* Giant Title */}
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#111113] leading-[0.95] tracking-tight uppercase">
              {hackathon?.title || "LIVE EVENT &"} <br />
              <span className="text-[#2563EB]">BATTLE ENGINE</span>
            </h2>

            {/* Theme & Goal Box */}
            <div className="p-4 sm:p-5 bg-[#F8F7F4] border border-[#111113] space-y-1.5">
              <div className="text-[10px] text-[#666] uppercase tracking-widest flex items-center justify-between font-bold">
                <span>[ТЕМА_СОРЕВНОВАНИЯ]</span>
                <span className="text-[#2563EB]">STAGE: {hackathon?.stage || "ACTIVE"}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#111113] uppercase">
                {hackathon?.theme || "Платформа для проведения Вайбатонов"}
              </div>
              <p className="text-xs sm:text-sm text-[#444] leading-relaxed">
                {hackathon?.description || "Операционная система для проведения живых цифровых соревнований (Вайбатоны, 1v1 Дуэли, Челленджи, Питчи) с Event Engine, AI Host, судейством и Observer Mode."}
              </p>
            </div>
          </div>

          {/* Action Strip & Telemetry Numbers */}
          <div className="pt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenFastDevlog();
                }}
                className="px-6 py-3 text-xs font-bold tracking-wider uppercase bg-[#111113] text-[#F8F7F4] hover:bg-[#2563EB] hover:text-white border border-[#111113] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ DEVLOG (30 SEC)</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSubmission();
                }}
                className="px-5 py-3 text-xs font-bold tracking-wider uppercase bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] border border-[#111113] shadow-[3px_3px_0px_#111113] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#2563EB]" />
                <span>Сдать проект</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToTab("my-dashboard");
                }}
                className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-[#111113] hover:bg-[#EFECE6] bg-[#FFFFFF] border border-[#111113] shadow-[3px_3px_0px_#111113] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-[#2563EB]" />
                <span>Мой дашборд</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToTab("projects");
                }}
                className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-[#111113] hover:bg-[#EFECE6] bg-[#F8F7F4] border border-[#111113] transition-all flex items-center gap-1.5"
              >
                <span>Проекты ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-[#666] border-t border-[#111113]">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#111113]" />
                <span><strong className="text-[#111113]">{users.length}</strong> участников</span>
              </div>
              <span>/</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#2563EB]" />
                <span><strong className="text-[#111113]">{teams.length}</strong> команд</span>
              </div>
              <span>/</span>
              <div className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#2563EB]" />
                <span><strong className="text-[#111113]">{mvpCount}</strong> MVP готово</span>
              </div>
              <span>/</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#111113]" />
                <span><strong className="text-[#111113]">{posts.length}</strong> постов</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Countdown Timer Matrix & User HUD */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#111113] p-6 sm:p-8 shadow-[4px_4px_0px_#111113] flex flex-col justify-between text-center">
          <div>
            <div className="flex items-center justify-between border-b border-[#111113] pb-2 mb-4">
              <div className="label">[03] COUNTDOWN</div>
              <div className="label text-[#2563EB] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#2563EB]" />
                <span>SUBMISSION_DEADLINE</span>
              </div>
            </div>

            {/* Countdown Digits */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 my-3">
              <div className="bg-[#F8F7F4] border border-[#111113] p-3">
                <div className="font-display text-3xl sm:text-4xl font-bold text-[#111113]">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-[#666] uppercase font-bold mt-1">Дней</div>
              </div>

              <div className="bg-[#F8F7F4] border border-[#111113] p-3">
                <div className="font-display text-3xl sm:text-4xl font-bold text-[#111113]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-[#666] uppercase font-bold mt-1">Часов</div>
              </div>

              <div className="bg-[#F8F7F4] border border-[#111113] p-3">
                <div className="font-display text-3xl sm:text-4xl font-bold text-[#111113]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-[#666] uppercase font-bold mt-1">Мин</div>
              </div>

              <div className="bg-[#111113] border border-[#111113] p-3 shadow-[2px_2px_0px_#2563EB]">
                <div className="font-display text-3xl sm:text-4xl font-bold text-[#2563EB]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-[#F8F7F4] uppercase font-bold mt-1">Сек</div>
              </div>
            </div>
          </div>

          {/* User HUD Card */}
          <div className="mt-4 p-4 bg-[#F8F7F4] border border-[#111113] text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[#666] border-b border-[#111113] pb-2 font-bold">
              <span>[CURRENT_USER_STATUS]</span>
              <span className="text-[#2563EB] uppercase">[{currentUser?.role || "HACKER"}]</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#666]">Команда:</span>
              <span className="font-bold text-[#111113] flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#111113]" />
                {userTeam ? userTeam.name : "Соло-участник"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#666]">Статус MVP:</span>
              <span className={`font-bold px-2 py-0.5 text-[10px] uppercase border ${
                userProject?.status === "MVP" || userProject?.status === "DEMO" || userProject?.status === "SUBMITTED"
                  ? "bg-[#2563EB] text-white border-[#111113]"
                  : "bg-[#FFFFFF] text-[#111113] border-[#111113]"
              }`}>
                [{userProject?.status || "IDEA"}]
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. OPERATIONAL ROW: AI HOST ON-AIR CONSOLE + 1V1 CYBER DUEL SPOTLIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left 7 Cols: Official AI Host Broadcast Console */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#111113] p-6 sm:p-7 shadow-[4px_4px_0px_#111113] space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#111113] pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#111113] text-[#F8F7F4] flex items-center justify-center border border-[#111113]">
                <Bot className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#111113] text-sm uppercase tracking-wider">
                    AI_HOST // LIVE BROADCAST
                  </h3>
                  <span className="px-1.5 py-0.2 text-[9px] bg-[#2563EB] text-white font-bold border border-[#111113]">
                    NODE: 3.7
                  </span>
                </div>
                <p className="text-[10px] text-[#666]">Ведущий эфира • Gemini 3.7 Flash</p>
              </div>
            </div>

            {/* Audio Voice Control Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase transition-colors border border-[#111113] ${
                  isSpeaking
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113]"
                }`}
              >
                {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? "Стоп" : "Голос Host"}</span>
              </button>

              <button
                onClick={async () => {
                  sound.playPulse();
                  await triggerAIHostBroadcast("Запрос актуальной сводки хакатона");
                  sound.playBroadcastChime();
                }}
                className="px-3 py-1.5 text-xs font-bold uppercase bg-[#F8F7F4] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] border border-[#111113] transition-colors"
              >
                Сводка
              </button>
            </div>
          </div>

          {/* Speech Bubble with Waveform */}
          <div className="bg-[#F8F7F4] p-5 border border-[#111113] space-y-3">
            {isSpeaking && (
              <div className="flex items-center gap-1 text-[#2563EB] text-[11px] font-bold uppercase">
                <span className="w-1.5 h-3 bg-[#2563EB] animate-pulse" />
                <span className="w-1.5 h-4 bg-[#2563EB] animate-pulse" style={{ animationDelay: "100ms" }} />
                <span className="w-1.5 h-2 bg-[#2563EB] animate-pulse" style={{ animationDelay: "200ms" }} />
                <span className="w-1.5 h-5 bg-[#2563EB] animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 font-mono">Синтез речи активен...</span>
              </div>
            )}

            <div className="text-xs text-[#2563EB] font-bold uppercase">
              🎙 {latestBroadcast.title}
            </div>

            <p className="text-xs sm:text-sm text-[#111113] leading-relaxed whitespace-pre-line font-mono">
              {hostAnswer || latestBroadcast.content}
            </p>

            <div className="pt-2 border-t border-[#111113]/20 text-[10px] text-[#666] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#2563EB]" />
                <span>AI Host комментирует динамику. Оценки выставляют только судьи-люди.</span>
              </span>
              <span>{new Date(latestBroadcast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Interactive Input & Quick Suggestion Chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={aiHostInput}
                onChange={(e) => setAiHostInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskHost(aiHostInput)}
                placeholder="Задайте вопрос AI Host о правилах, дедлайне или командах..."
                className="flex-1 bg-[#FFFFFF] border border-[#111113] px-4 py-2.5 text-xs text-[#111113] placeholder-[#888] outline-none"
              />
              <button
                onClick={() => handleAskHost(aiHostInput)}
                disabled={isQuerying || !aiHostInput.trim()}
                className="px-5 py-2.5 bg-[#111113] hover:bg-[#2563EB] text-[#F8F7F4] hover:text-white font-bold text-xs uppercase border border-[#111113] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Спросить</span>
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAskHost(q)}
                  className="text-[10px] px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] border border-[#111113] transition-colors font-bold uppercase"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: 1v1 Cyber Duel Arena Spotlight */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#111113] p-6 sm:p-7 shadow-[4px_4px_0px_#111113] space-y-4">
          <div className="flex items-center justify-between border-b border-[#111113] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#111113] text-white flex items-center justify-center border border-[#111113]">
                <Swords className="w-4 h-4 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-bold text-[#111113] text-sm uppercase tracking-wider">
                  1V1 BATTLE ARENA
                </h3>
                <p className="text-[10px] text-[#666]">Быстрые кибер-схватки на 10-15 минут</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTab("duel");
              }}
              className="text-[11px] text-[#2563EB] hover:underline uppercase flex items-center gap-1 font-bold"
            >
              <span>Вся арена</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeDuel && activeDuel.participantA && activeDuel.participantB ? (
            <div className="space-y-3">
              {/* Duel Match Card */}
              <div className="p-4 bg-[#F8F7F4] border border-[#111113] space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#111113] font-bold uppercase truncate max-w-[220px]">
                    {activeDuel.topic || activeDuel.title || "1v1 Кибер-Дуэль"}
                  </span>
                  <span className="px-2 py-0.5 text-[9px] bg-[#2563EB] text-white font-bold border border-[#111113] shrink-0">
                    РАУНД {activeDuel.currentRound || 1} // LIVE
                  </span>
                </div>

                {/* Contestants Split */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                  <div className="p-3 bg-[#FFFFFF] border border-[#111113]">
                    <div className="font-bold text-xs text-[#111113] truncate uppercase">
                      {activeDuel.participantA?.name || "Участник 1"}
                    </div>
                    <div className="text-[10px] text-[#666] font-bold mt-0.5">
                      Счёт: {activeDuel.participantA?.score ?? 0}
                    </div>
                    <button
                      onClick={() => activeDuel.participantA?.id && handleQuickVoteDuel(activeDuel.participantA.id)}
                      disabled={isVoting}
                      className="mt-2 w-full py-1 text-[10px] font-bold uppercase bg-[#111113] hover:bg-[#2563EB] text-[#F8F7F4] hover:text-white border border-[#111113] transition-colors"
                    >
                      Голос (+1)
                    </button>
                  </div>

                  <div className="p-3 bg-[#FFFFFF] border border-[#111113]">
                    <div className="font-bold text-xs text-[#111113] truncate uppercase">
                      {activeDuel.participantB?.name || "Участник 2"}
                    </div>
                    <div className="text-[10px] text-[#666] font-bold mt-0.5">
                      Счёт: {activeDuel.participantB?.score ?? 0}
                    </div>
                    <button
                      onClick={() => activeDuel.participantB?.id && handleQuickVoteDuel(activeDuel.participantB.id)}
                      disabled={isVoting}
                      className="mt-2 w-full py-1 text-[10px] font-bold uppercase bg-[#111113] hover:bg-[#2563EB] text-[#F8F7F4] hover:text-white border border-[#111113] transition-colors"
                    >
                      Голос (+1)
                    </button>
                  </div>
                </div>

                {voteNotice && (
                  <div className="text-center text-[10px] font-bold text-[#2563EB]">
                    {voteNotice}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-[#F8F7F4] border border-[#111113] space-y-2">
              <Swords className="w-8 h-8 text-[#888] mx-auto" />
              <div className="text-xs font-bold text-[#111113] uppercase">[ДУЭЛЬ_В_ОЖИДАНИИ]</div>
              <p className="text-[11px] text-[#666]">
                Запустите быструю 1v1 дуэль на фронтенд-вёрстку, дизайн или алгоритм.
              </p>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToTab("duel");
                }}
                className="mt-2 px-4 py-2 text-xs font-bold uppercase bg-[#111113] hover:bg-[#2563EB] text-[#F8F7F4] hover:text-white border border-[#111113] transition-colors"
              >
                Арена Дуэлей →
              </button>
            </div>
          )}

          {/* Observer Mode Banner */}
          <div className="p-3.5 bg-[#F8F7F4] border border-[#111113] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2563EB]" />
              <div className="text-[11px] text-[#111113] font-bold">[OBSERVER STREAM MODE]</div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToTab("discovery");
              }}
              className="text-[10px] font-bold text-[#2563EB] hover:underline uppercase"
            >
              Каталог →
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4. EVENT TIMELINE VERTICAL STEPPER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.11, ease: [0.16, 1, 0.3, 1] }}
      >
        <EventTimeline onNavigateToTab={onNavigateToTab} />
      </motion.div>

      {/* 5. LIVE ACTIVITY TELEMETRY & SOCIAL VELOCITY LEADERBOARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Left 7 Cols: Real-time Activity Feed */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#111113] p-6 shadow-[4px_4px_0px_#111113] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#111113] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#111113] text-white flex items-center justify-center border border-[#111113]">
                <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-bold text-[#111113] text-sm uppercase tracking-wider">
                  ACTIVITY TELEMETRY FEED
                </h3>
                <p className="text-[10px] text-[#666]">Поток событий в реальном времени</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[10px]">
              {["ALL", "DEVLOG", "MVP", "TEAM", "DUEL"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    sound.playClick();
                    setEventFilter(f);
                  }}
                  className={`px-2 py-0.5 font-bold uppercase border border-[#111113] transition-colors ${
                    eventFilter === f
                      ? "bg-[#2563EB] text-white border-[#111113]"
                      : "bg-[#FFFFFF] text-[#111113] hover:bg-[#EFECE6]"
                  }`}
                >
                  {f === "ALL" ? "Все" : f === "DEVLOG" ? "Devlog" : f === "MVP" ? "MVP" : f === "TEAM" ? "Команды" : "Дуэли"}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#111113]/20 max-h-[460px] overflow-y-auto pr-1">
            {filteredEvents.length > 0 ? (
              filteredEvents.slice(0, 25).map((ev) => {
                return (
                  <div
                    key={ev.id}
                    className="py-3 px-1 hover:bg-[#F8F7F4] transition-colors flex items-start gap-3 group"
                  >
                    <span className="w-2 h-2 bg-[#2563EB] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#111113] leading-snug font-mono">
                        {ev.message || ev.text}
                      </div>
                      <div className="text-[10px] text-[#666] mt-1 flex items-center gap-2">
                        <span>
                          {new Date(ev.createdAt || ev.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {ev.teamName && (
                          <span className="text-[#111113] bg-[#EFECE6] px-1.5 py-0.2 border border-[#111113] font-bold">
                            {ev.teamName}
                          </span>
                        )}
                        <span className="uppercase text-[#666]">[{ev.type}]</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#888]">
                [Событий в выбранной категории пока нет]
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Social Velocity Index */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#111113] p-6 shadow-[4px_4px_0px_#111113] space-y-4">
          <div className="flex items-center justify-between border-b border-[#111113] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#111113] text-white flex items-center justify-center border border-[#111113]">
                <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-bold text-[#111113] text-sm uppercase tracking-wider">
                  TEAM VELOCITY INDEX
                </h3>
                <p className="text-[10px] text-[#666]">Динамика активности и Devlog</p>
              </div>
            </div>

            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#EFECE6] text-[#111113] border border-[#111113] font-bold">
              [TELEMETRY]
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {pulseRanking.slice(0, 10).map((team, idx) => (
              <div
                key={team.name}
                className={`p-3 border border-[#111113] transition-all flex items-center justify-between gap-3 ${
                  idx === 0
                    ? "bg-[#F8F7F4] shadow-[2px_2px_0px_#2563EB]"
                    : "bg-[#FFFFFF] hover:bg-[#F8F7F4]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 border border-[#111113] ${
                    idx === 0 ? "bg-[#2563EB] text-white" :
                    idx === 1 ? "bg-[#111113] text-[#F8F7F4]" :
                    idx === 2 ? "bg-[#111113] text-white" :
                    "bg-[#EFECE6] text-[#111113]"
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#111113] truncate uppercase">{team.name}</div>
                    <div className="text-[10px] text-[#666] flex items-center gap-1.5 mt-0.5">
                      <span>{team.membersCount} чел.</span>
                      <span>•</span>
                      {team.hasMvp ? (
                        <span className="text-[#2563EB] font-bold">[MVP_READY]</span>
                      ) : (
                        <span className="text-[#111113]">[{team.status}]</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-xs text-[#111113] leading-none">
                    {team.pulseScore} PTS
                  </div>
                  <div className="text-[8px] text-[#666] uppercase mt-0.5">Velocity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

