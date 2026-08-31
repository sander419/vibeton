import React, { useState, useMemo } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Trophy,
  Flame,
  Star,
  Award,
  Sparkles,
  ExternalLink,
  Github,
  Video,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Send,
  Zap,
  TrendingUp,
  Radio,
  Layers,
  FileCheck,
  Users,
  ShieldCheck
} from "lucide-react";
import { speakText, stopSpeech } from "../utils/audio";
import type { Submission, Judgement, LeaderboardItem, Project } from "../types";

interface LeaderboardProps {
  onNavigateToJudging?: () => void;
  onOpenSubmission?: () => void;
  onNavigateToDevlog?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  onNavigateToJudging,
  onOpenSubmission,
  onNavigateToDevlog
}) => {
  const {
    hackathon,
    leaderboard,
    submissions,
    judgements,
    projects,
    teams,
    posts,
    currentUser,
    currentRole,
    sseConnected
  } = useHackathon();

  const [activeTab, setActiveTab] = useState<"jury" | "activity" | "awards">("jury");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Criteria definition
  const criteriaList = hackathon?.criteria && hackathon.criteria.length > 0
    ? hackathon.criteria
    : [
        { id: "mvp", name: "MVP & Техническая реализация", maxScore: 10, description: "Полнота и стабильность сценария" },
        { id: "ai_core", name: "AI Core & Host", maxScore: 10, description: "Качество интеграции AI-ведущего" },
        { id: "ux_vibe", name: "Live UX & Атмосфера", maxScore: 10, description: "Дизайн, динамика и аудио" },
        { id: "viability", name: "Жизнеспособность", maxScore: 10, description: "Перспектива развития и надежность" }
      ];

  // 1. Computed Scored Projects (Jury Rankings)
  const scoredSubmissions = useMemo(() => {
    return submissions.map((sub) => {
      const subJudgements = judgements.filter((j) => j.submissionId === sub.id);
      const reviewCount = subJudgements.length;

      // Calculate average total score (0-40 or normalized to 10)
      let avgTotal = 0;
      const criterionAverages: Record<string, number> = {};

      criteriaList.forEach((c) => {
        const scoresForCrit = subJudgements
          .map((j) => j.scores[c.id] ?? 0)
          .filter((s) => s > 0);
        if (scoresForCrit.length > 0) {
          const sum = scoresForCrit.reduce((a, b) => a + b, 0);
          criterionAverages[c.id] = Number((sum / scoresForCrit.length).toFixed(1));
        } else {
          criterionAverages[c.id] = 0;
        }
      });

      if (reviewCount > 0) {
        const totalSum = subJudgements.reduce((sum, j) => sum + (j.totalScore || 0), 0);
        avgTotal = Number((totalSum / reviewCount).toFixed(1));
      }

      // Corresponding project & team
      const project = projects.find((p) => p.id === sub.projectId);
      const team = teams.find((t) => t.id === sub.teamId || t.projectId === sub.projectId);
      const teamPosts = posts.filter((p) => p.teamId === sub.teamId || p.projectId === sub.projectId);

      return {
        submission: sub,
        project,
        team,
        reviewCount,
        avgTotal,
        criterionAverages,
        judgements: subJudgements,
        postsCount: teamPosts.length,
        isEvaluated: reviewCount > 0
      };
    }).sort((a, b) => {
      // Sort by average total score descending, then by review count, then by post count
      if (b.avgTotal !== a.avgTotal) return b.avgTotal - a.avgTotal;
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return b.postsCount - a.postsCount;
    });
  }, [submissions, judgements, projects, teams, posts, criteriaList]);

  // Filtered lists
  const filteredScored = useMemo(() => {
    return scoredSubmissions.filter((item) => {
      const matchesSearch =
        item.submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.submission.teamName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.submission.techStack || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (statusFilter === "EVALUATED") return item.isEvaluated;
      if (statusFilter === "PENDING") return !item.isEvaluated;
      return true;
    });
  }, [scoredSubmissions, searchQuery, statusFilter]);

  const filteredActivity = useMemo(() => {
    return leaderboard.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.projectTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tag || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "MVP") return item.mvpReached;
      if (statusFilter === "SUBMITTED") return item.submitted;
      return true;
    });
  }, [leaderboard, searchQuery, statusFilter]);

  // Voice Announce
  const handleAnnounceLeaderboard = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      let text = "Турнирная таблица Вайбатона №2 в прямом эфире. ";
      if (activeTab === "jury" && scoredSubmissions.length > 0) {
        const top1 = scoredSubmissions[0];
        text += `В судейском зачете лидирует команда ${top1.submission.teamName || top1.submission.authorName} с проектом ${top1.submission.title}, набрав в среднем ${top1.avgTotal} баллов из 40. `;
        if (scoredSubmissions[1]) {
          text += `На втором месте ${scoredSubmissions[1].submission.teamName || scoredSubmissions[1].submission.authorName} с проектом ${scoredSubmissions[1].submission.title}.`;
        }
      } else if (leaderboard.length > 0) {
        const top1 = leaderboard[0];
        text += `По динамике разработки на первом месте ${top1.name} с показателем активности ${top1.eventsCount} баллов.`;
      }
      speakText(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  // Metrics
  const totalSubmissions = submissions.length;
  const evaluatedCount = scoredSubmissions.filter((s) => s.isEvaluated).length;
  const topScore = scoredSubmissions[0]?.avgTotal || 0;
  const totalTeams = teams.length;

  return (
    <div className="space-y-8 font-mono">
      {/* 1. HEADER HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0C0C0C] border border-[#333] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#BAFF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#BAFF00]/10 border border-[#BAFF00]/30 text-[#BAFF00] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-pulse" />
              LIVE STANDINGS & SCORING // REAL-TIME TELEMETRY
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Турнирная таблица & Результаты
            </h1>

            <p className="text-xs sm:text-sm text-[#AAA] leading-relaxed">
              Отслеживайте оценки экспертного жюри, баллы за скорость разработки и статус номинаций в реальном времени.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAnnounceLeaderboard}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${
                  isSpeaking
                    ? "bg-[#BAFF00] text-black shadow-[0_0_15px_rgba(186,255,0,0.5)]"
                    : "bg-[#181818] hover:bg-[#222] text-white border border-[#333] hover:border-[#BAFF00]"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#BAFF00]" />}
                <span>{isSpeaking ? "Остановить сводку" : "Озвучить лидера (AI Host)"}</span>
              </button>

              {currentRole === "judge" || currentRole === "organizer" ? (
                <button
                  onClick={onNavigateToJudging}
                  className="px-4 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#c9ff33] text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Перейти к судейству</span>
                </button>
              ) : (
                <button
                  onClick={onOpenSubmission}
                  className="px-4 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#c9ff33] text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Сдать проект на оценку</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-white">{totalSubmissions}</div>
              <div className="text-[9px] text-[#777] uppercase mt-0.5">Сдано проектов</div>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-[#BAFF00]">{evaluatedCount}</div>
              <div className="text-[9px] text-[#777] uppercase mt-0.5">Оценено жюри</div>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">
                {topScore > 0 ? `${topScore}` : "—"}
              </div>
              <div className="text-[9px] text-[#777] uppercase mt-0.5">Макс. балл</div>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-purple-400">{totalTeams}</div>
              <div className="text-[9px] text-[#777] uppercase mt-0.5">Команд в игре</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOP PODIUM (Top 3 Contenders) */}
      {scoredSubmissions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#BAFF00]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Подиум лидеров (Судейский зачет)
              </h3>
            </div>
            <span className="text-[10px] text-[#888] uppercase">TOP 3 CONTENDERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* #1 GOLD */}
            {scoredSubmissions[0] && (
              <div className="relative overflow-hidden rounded-3xl bg-[#0F0F0F] border-2 border-[#BAFF00] p-5 shadow-[0_0_30px_rgba(186,255,0,0.2)] flex flex-col justify-between order-1 md:order-2">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#BAFF00]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-2xl bg-[#BAFF00] text-black font-black text-sm flex items-center justify-center shadow-[0_0_12px_rgba(186,255,0,0.5)]">
                      1 🏆
                    </span>
                    <div>
                      <span className="text-[10px] text-[#BAFF00] font-bold uppercase tracking-wider block">
                        ГРАН-ПРИ ЛИДЕР
                      </span>
                      <h4 className="text-sm font-black text-white truncate max-w-[180px]">
                        {scoredSubmissions[0].submission.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-[#BAFF00] font-mono">
                      {scoredSubmissions[0].avgTotal > 0 ? `${scoredSubmissions[0].avgTotal}` : "NEW"}
                    </div>
                    <span className="text-[9px] text-[#888]">из 40 баллов</span>
                  </div>
                </div>

                <div className="my-3 p-3 rounded-2xl bg-[#141414] border border-[#222] space-y-1.5 text-xs text-[#AAA]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-bold">{scoredSubmissions[0].submission.teamName || scoredSubmissions[0].submission.authorName}</span>
                    <span className="text-[#BAFF00] text-[10px]">
                      {scoredSubmissions[0].reviewCount} {scoredSubmissions[0].reviewCount === 1 ? "оценка" : "оценки"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-[#888]">
                    {scoredSubmissions[0].submission.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {scoredSubmissions[0].submission.demoUrl && (
                      <a
                        href={scoredSubmissions[0].submission.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#222] text-[#BAFF00] border border-[#333] text-xs transition-colors"
                        title="Демо"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {scoredSubmissions[0].submission.repoUrl && (
                      <a
                        href={scoredSubmissions[0].submission.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#222] text-white border border-[#333] text-xs transition-colors"
                        title="Github"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedRowId(expandedRowId === scoredSubmissions[0].submission.id ? null : scoredSubmissions[0].submission.id)}
                    className="text-[11px] text-[#BAFF00] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Подробности</span>
                    {expandedRowId === scoredSubmissions[0].submission.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* #2 SILVER */}
            {scoredSubmissions[1] && (
              <div className="relative overflow-hidden rounded-3xl bg-[#0F0F0F] border border-cyan-500/50 p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between order-2 md:order-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-2xl bg-cyan-400 text-black font-black text-xs flex items-center justify-center">
                      2 🥈
                    </span>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                        2-Е МЕСТО
                      </span>
                      <h4 className="text-sm font-black text-white truncate max-w-[160px]">
                        {scoredSubmissions[1].submission.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-cyan-400 font-mono">
                      {scoredSubmissions[1].avgTotal > 0 ? `${scoredSubmissions[1].avgTotal}` : "—"}
                    </div>
                    <span className="text-[9px] text-[#888]">баллов</span>
                  </div>
                </div>

                <div className="my-3 p-3 rounded-2xl bg-[#141414] border border-[#222] space-y-1.5 text-xs text-[#AAA]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-bold">{scoredSubmissions[1].submission.teamName || scoredSubmissions[1].submission.authorName}</span>
                    <span className="text-cyan-400 text-[10px]">{scoredSubmissions[1].reviewCount} оценок</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-[#888]">
                    {scoredSubmissions[1].submission.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {scoredSubmissions[1].submission.demoUrl && (
                      <a
                        href={scoredSubmissions[1].submission.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#222] text-cyan-400 border border-[#333] text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedRowId(expandedRowId === scoredSubmissions[1].submission.id ? null : scoredSubmissions[1].submission.id)}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Подробности</span>
                    {expandedRowId === scoredSubmissions[1].submission.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* #3 BRONZE */}
            {scoredSubmissions[2] ? (
              <div className="relative overflow-hidden rounded-3xl bg-[#0F0F0F] border border-orange-500/40 p-5 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex flex-col justify-between order-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-2xl bg-orange-400 text-black font-black text-xs flex items-center justify-center">
                      3 🥉
                    </span>
                    <div>
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                        3-Е МЕСТО
                      </span>
                      <h4 className="text-sm font-black text-white truncate max-w-[160px]">
                        {scoredSubmissions[2].submission.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-orange-400 font-mono">
                      {scoredSubmissions[2].avgTotal > 0 ? `${scoredSubmissions[2].avgTotal}` : "—"}
                    </div>
                    <span className="text-[9px] text-[#888]">баллов</span>
                  </div>
                </div>

                <div className="my-3 p-3 rounded-2xl bg-[#141414] border border-[#222] space-y-1.5 text-xs text-[#AAA]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-bold">{scoredSubmissions[2].submission.teamName || scoredSubmissions[2].submission.authorName}</span>
                    <span className="text-orange-400 text-[10px]">{scoredSubmissions[2].reviewCount} оценок</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-[#888]">
                    {scoredSubmissions[2].submission.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {scoredSubmissions[2].submission.demoUrl && (
                      <a
                        href={scoredSubmissions[2].submission.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#222] text-orange-400 border border-[#333] text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedRowId(expandedRowId === scoredSubmissions[2].submission.id ? null : scoredSubmissions[2].submission.id)}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Подробности</span>
                    {expandedRowId === scoredSubmissions[2].submission.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-[#0C0C0C] border border-[#222] border-dashed p-6 flex flex-col items-center justify-center text-center text-[#666] text-xs order-3">
                <Trophy className="w-8 h-8 text-[#333] mb-2" />
                <span>Место на подиуме свободно</span>
                <span className="text-[10px] text-[#555] mt-1">Сдайте проект для входа в топ-3</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. MAIN INTERACTIVE LEADERBOARD TABLE & FILTERS */}
      <section className="bg-[#0C0C0C] border border-[#333] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        {/* Navigation Sub-Tabs & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222]">
          <div className="flex items-center gap-1 bg-[#141414] p-1.5 rounded-2xl border border-[#262626]">
            <button
              onClick={() => setActiveTab("jury")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === "jury"
                  ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Судейский зачет ({scoredSubmissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === "activity"
                  ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Пульс активности ({leaderboard.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("awards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === "awards"
                  ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Спецноминации</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по проекту, команде..."
                className="w-full bg-[#141414] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#BAFF00]"
              />
            </div>

            {activeTab === "jury" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-[#CCC] focus:outline-none focus:border-[#BAFF00]"
              >
                <option value="ALL">Все статусы</option>
                <option value="EVALUATED">Оцененные жюри</option>
                <option value="PENDING">Ожидают оценки</option>
              </select>
            )}

            {activeTab === "activity" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-[#CCC] focus:outline-none focus:border-[#BAFF00]"
              >
                <option value="ALL">Все участники</option>
                <option value="MVP">Только с MVP</option>
                <option value="SUBMITTED">Сдавшие работу</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: JURY SCORES STANDINGS */}
        {activeTab === "jury" && (
          <div className="space-y-4">
            {filteredScored.length === 0 ? (
              <div className="p-12 text-center bg-[#111] rounded-2xl border border-[#222] space-y-3">
                <Award className="w-10 h-10 text-[#444] mx-auto" />
                <h4 className="text-sm font-bold text-white uppercase">Проекты не найдены</h4>
                <p className="text-xs text-[#777] max-w-sm mx-auto">
                  {searchQuery ? "Попробуйте изменить запрос поиска" : "Пока никто не сдал проект. Будьте первыми!"}
                </p>
                {onOpenSubmission && (
                  <button
                    onClick={onOpenSubmission}
                    className="px-4 py-2 rounded-xl bg-[#BAFF00] text-black font-bold text-xs uppercase"
                  >
                    Сдать проект
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScored.map((item, index) => {
                  const isExpanded = expandedRowId === item.submission.id;
                  return (
                    <div
                      key={item.submission.id}
                      className={`rounded-2xl border transition-all ${
                        index === 0
                          ? "bg-[#141414] border-[#BAFF00]/40 shadow-[0_0_15px_rgba(186,255,0,0.1)]"
                          : "bg-[#101010] hover:bg-[#141414] border-[#222] hover:border-[#333]"
                      }`}
                    >
                      {/* Row Main Bar */}
                      <div
                        onClick={() => setExpandedRowId(isExpanded ? null : item.submission.id)}
                        className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                      >
                        {/* Left: Rank & Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              index === 0
                                ? "bg-[#BAFF00] text-black"
                                : index === 1
                                ? "bg-cyan-400 text-black"
                                : index === 2
                                ? "bg-orange-400 text-black"
                                : "bg-[#1c1c1c] text-[#777] border border-[#2a2a2a]"
                            }`}
                          >
                            #{index + 1}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white truncate group-hover:text-[#BAFF00]">
                                {item.submission.title}
                              </h4>
                              {index === 0 && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">
                                  👑 LEADER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-[#777] mt-0.5">
                              <span className="text-[#AAA]">{item.submission.teamName || item.submission.authorName}</span>
                              <span>•</span>
                              <span>{item.submission.techStack?.slice(0, 3).join(", ") || "Stack"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Center: Mini Criteria Score Bars */}
                        <div className="hidden lg:grid grid-cols-4 gap-3 text-center">
                          {criteriaList.map((crit) => {
                            const score = item.criterionAverages[crit.id] || 0;
                            return (
                              <div key={crit.id} className="min-w-[65px] bg-[#161616] p-1.5 rounded-lg border border-[#262626]">
                                <div className="text-[9px] text-[#777] uppercase truncate" title={crit.name}>
                                  {crit.id.toUpperCase()}
                                </div>
                                <div className="text-xs font-bold text-white font-mono">
                                  {score > 0 ? score : "—"}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right: Total Score & Expand Trigger */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-base sm:text-xl font-black text-[#BAFF00] font-mono">
                              {item.avgTotal > 0 ? `${item.avgTotal}` : "—"}
                            </div>
                            <div className="text-[9px] text-[#888]">
                              {item.reviewCount > 0 ? `${item.reviewCount} оценок жюри` : "На проверке"}
                            </div>
                          </div>

                          <div className="p-1 rounded-lg bg-[#181818] text-[#888] group-hover:text-white">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Project & Scoring Details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-[#222] bg-[#0E0E0E]/80 space-y-4 animate-in fade-in duration-200">
                          {/* Description */}
                          <div className="p-3 rounded-xl bg-[#141414] border border-[#222] text-xs text-[#CCC] space-y-1">
                            <div className="text-[10px] text-[#777] uppercase font-bold">ОПИСАНИЕ И ИНСТРУКЦИЯ ПО ЗАПУСКУ:</div>
                            <p>{item.submission.description}</p>
                            {item.submission.launchInstructions && (
                              <div className="text-[11px] text-[#888] font-mono mt-1 pt-1 border-t border-[#262626]">
                                <strong>Запуск:</strong> {item.submission.launchInstructions}
                              </div>
                            )}
                          </div>

                          {/* Criteria Full Breakdown */}
                          <div>
                            <div className="text-[10px] text-[#888] uppercase mb-2 font-bold">
                              БАЛЛЫ ПО КРИТЕРИЯМ ОЦЕНКИ (СРЕДНЕЕ ЖЮРИ):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              {criteriaList.map((crit) => {
                                const sc = item.criterionAverages[crit.id] || 0;
                                const percent = (sc / (crit.maxScore || 10)) * 100;
                                return (
                                  <div key={crit.id} className="p-3 rounded-xl bg-[#141414] border border-[#262626] space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-[#AAA] font-bold truncate">{crit.name}</span>
                                      <span className="text-[#BAFF00] font-bold font-mono">{sc} / 10</span>
                                    </div>
                                    <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-[#BAFF00] h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                    <div className="text-[9px] text-[#666] line-clamp-1">{crit.description}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Judge Feedback Quotes */}
                          {item.judgements.length > 0 && (
                            <div>
                              <div className="text-[10px] text-[#888] uppercase mb-2 font-bold flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#BAFF00]" />
                                <span>РЕЦЕНЗИИ И КОММЕНТАРИИ ЖЮРИ:</span>
                              </div>
                              <div className="space-y-2">
                                {item.judgements.map((jud) => (
                                  <div key={jud.id} className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#CCC] flex items-start gap-2.5">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1f1f1f] text-cyan-300 font-bold border border-[#333] shrink-0">
                                      {jud.judgeName}
                                    </span>
                                    <div className="flex-1">
                                      <p className="italic text-[#BBB]">«{jud.feedback || "Без комментария"}»</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[#BAFF00] font-bold font-mono text-xs">{jud.totalScore} / 40</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Links */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-2">
                              {item.submission.demoUrl && (
                                <a
                                  href={item.submission.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222] text-[#BAFF00] border border-[#333] text-xs flex items-center gap-1.5 font-bold transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Открыть Демо</span>
                                </a>
                              )}
                              {item.submission.repoUrl && (
                                <a
                                  href={item.submission.repoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-[#181818] hover:bg-[#222] text-white border border-[#333] text-xs flex items-center gap-1.5 font-bold transition-all"
                                >
                                  <Github className="w-3.5 h-3.5" />
                                  <span>Репозиторий</span>
                                </a>
                              )}
                            </div>

                            {(currentRole === "judge" || currentRole === "organizer") && onNavigateToJudging && (
                              <button
                                onClick={onNavigateToJudging}
                                className="px-3.5 py-1.5 rounded-xl bg-[#BAFF00] hover:bg-[#c9ff33] text-black text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                              >
                                <Star className="w-3.5 h-3.5" />
                                <span>Оценить как жюри</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE ACTIVITY PULSE (Velocity) */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] text-xs text-[#AAA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Баллы активности начисляются за каждый Devlog-апдейт (+3), реакцию (+1), коммит и достижение MVP (+10).</span>
              </div>
              <span className="text-[10px] text-[#BAFF00] font-mono">LIVE SSE SYNC</span>
            </div>

            <div className="space-y-2.5">
              {filteredActivity.map((item, idx) => (
                <div
                  key={item.teamId || item.authorId || idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                    idx === 0
                      ? "bg-[#141414] border-[#BAFF00]/40"
                      : "bg-[#101010] hover:bg-[#141414] border-[#222]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 ? "bg-[#BAFF00] text-black" : idx === 1 ? "bg-white text-black" : "bg-[#1c1c1c] text-[#777]"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{item.name}</span>
                        {item.tag && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#181818] text-[#888] border border-[#2a2a2a]">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#777] truncate mt-0.5">
                        Проект: <strong className="text-[#CCC]">{item.projectTitle || "В процессе разработки"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.mvpReached && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#BAFF00]/15 text-[#BAFF00] font-bold border border-[#BAFF00]/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>MVP ГОТОВ</span>
                      </span>
                    )}

                    {item.submitted && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>СДАНО</span>
                      </span>
                    )}

                    <div className="text-right pl-2 border-l border-[#262626]">
                      <div className="text-lg font-black text-[#BAFF00] font-mono">
                        {item.eventsCount}
                      </div>
                      <div className="text-[9px] text-[#777] uppercase">PTS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SPECIAL AWARDS NOMINATIONS */}
        {activeTab === "awards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(hackathon?.specialAwards || [
              { id: "best-vibe", title: "Лучший Live-Vibe & Атмосфера", icon: "⚡", description: "За создание самой живой атмосферы соревнования и высокую интерактивность" },
              { id: "best-ai", title: "AI-Инновация (Host Engine)", icon: "🧠", description: "За глубокую интеграцию AI-хоста без галлюцинаций с аудиосинтезом" },
              { id: "best-design", title: "Идеальный UI/UX", icon: "🎨", description: "За безупречный киберпанк/esports интерфейс и удобство Devlog" },
              { id: "speed-demon", title: "Скоростной MVP", icon: "🚀", description: "Команде, первой показавшей полностью работающий прототип" }
            ]).map((award) => {
              const leadingContender = scoredSubmissions[0];
              return (
                <div
                  key={award.id}
                  className="p-5 rounded-2xl bg-[#121212] border border-[#262626] hover:border-[#BAFF00]/40 transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333] flex items-center justify-center text-xl shadow-inner">
                      {award.icon}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{award.title}</h4>
                      <span className="text-[10px] text-[#BAFF00] uppercase font-bold">ОФИЦИАЛЬНАЯ НОМИНАЦИЯ</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#AAA] leading-relaxed">
                    {award.description}
                  </p>

                  <div className="pt-2 border-t border-[#222] flex items-center justify-between text-xs">
                    <span className="text-[#777]">Лидер номинации:</span>
                    <span className="text-white font-bold">
                      {award.winnerProjectTitle || leadingContender?.submission.title || "Определяется жюри"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
