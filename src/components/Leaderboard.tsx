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
import { speakText, stopSpeech, sound } from "../utils/audio";
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
        { id: "mvp", name: "MVP & Код", maxScore: 10, description: "Полнота и стабильность сценария" },
        { id: "ai_core", name: "AI Core", maxScore: 10, description: "Качество интеграции AI" },
        { id: "ux_vibe", name: "Live UX & Vibe", maxScore: 10, description: "Дизайн, динамика и атмосфера" },
        { id: "viability", name: "Жизнеспособность", maxScore: 10, description: "Перспектива и архитектура" }
      ];

  // 1. Computed Scored Projects (Jury Rankings)
  const scoredSubmissions = useMemo(() => {
    return submissions.map((sub) => {
      const subJudgements = judgements.filter((j) => j.submissionId === sub.id);
      const reviewCount = subJudgements.length;

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

  const top1 = scoredSubmissions[0];
  const top2 = scoredSubmissions[1];
  const top3 = scoredSubmissions[2];

  return (
    <div className="space-y-8 font-sans">
      {/* 1. HEADER HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0e111c] border border-[#1e2436] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#c8ff3d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#41f0ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8ff3d]/10 border border-[#c8ff3d]/30 text-[#c8ff3d] text-xs font-mono font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#c8ff3d] animate-pulse" />
              LIVE STANDINGS & SCORING
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Турнирная таблица & Результаты
            </h1>

            <p className="text-xs sm:text-sm text-[#8b93ad] leading-relaxed font-body">
              Два независимых рейтинга: <b>Competition Score</b> (оценки судей-людей) и <b>Social Score</b> (активность в Devlog).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono">
              <button
                onClick={handleAnnounceLeaderboard}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${
                  isSpeaking
                    ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_15px_rgba(200,255,61,0.5)]"
                    : "bg-[#121627] hover:bg-[#1e2436] text-[#e9edf8] border border-[#2a3148] hover:border-[#c8ff3d]"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#c8ff3d]" />}
                <span>{isSpeaking ? "Остановить сводку" : "Озвучить лидера (AI Host)"}</span>
              </button>

              {currentRole === "judge" || currentRole === "organizer" ? (
                <button
                  onClick={onNavigateToJudging}
                  className="px-4 py-2 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff66] text-[#06070c] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(200,255,61,0.3)] transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Кабинет судейства</span>
                </button>
              ) : (
                <button
                  onClick={onOpenSubmission}
                  className="px-4 py-2 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff66] text-[#06070c] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(200,255,61,0.3)] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Сдать проект на оценку</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto font-mono">
            <div className="bg-[#0a0c14] border border-[#1e2436] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-white">{submissions.length}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase mt-0.5">Сдано работ</div>
            </div>

            <div className="bg-[#0a0c14] border border-[#1e2436] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-[#c8ff3d]">
                {scoredSubmissions.filter((s) => s.isEvaluated).length}
              </div>
              <div className="text-[10px] text-[#8b93ad] uppercase mt-0.5">Оценено жюри</div>
            </div>

            <div className="bg-[#0a0c14] border border-[#1e2436] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-[#41f0ff]">
                {scoredSubmissions[0]?.avgTotal || 0}
              </div>
              <div className="text-[10px] text-[#8b93ad] uppercase mt-0.5">Топ балл</div>
            </div>

            <div className="bg-[#0a0c14] border border-[#1e2436] rounded-2xl p-3.5 text-center min-w-[110px]">
              <div className="text-xl sm:text-2xl font-black text-[#ff3da6]">{teams.length}</div>
              <div className="text-[10px] text-[#8b93ad] uppercase mt-0.5">Команд</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOP-3 PODIUM SHOWCASE (For Jury Rankings) */}
      {activeTab === "jury" && scoredSubmissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {/* SILVER #2 */}
          {top2 && (
            <div className="order-2 md:order-1 bg-[#0e111c] border border-[#41f0ff]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[300px]">
              <div className="absolute top-4 right-4 font-display font-black text-4xl text-[#41f0ff]/20 select-none">
                02
              </div>
              <div>
                <div className="text-3xl mb-2">🥈</div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-[#41f0ff] bg-[#41f0ff]/10 border border-[#41f0ff]/30">
                  2 МЕСТО
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-2 truncate">
                  {top2.submission.title}
                </h3>
                <p className="text-xs text-[#8b93ad] font-mono">
                  {top2.submission.teamName || top2.submission.authorName}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between font-mono">
                <span className="text-xs text-[#8b93ad]">Средний балл:</span>
                <span className="font-display font-black text-2xl text-[#41f0ff]">
                  {top2.avgTotal} <span className="text-xs text-[#5c647e]">/ 40</span>
                </span>
              </div>
            </div>
          )}

          {/* GOLD #1 (Elevated) */}
          {top1 && (
            <div className="order-1 md:order-2 bg-[#0e111c] border-2 border-[#c8ff3d] rounded-3xl p-8 shadow-[0_0_30px_rgba(200,255,61,0.25)] relative overflow-hidden flex flex-col justify-between h-[340px]">
              <div className="absolute top-4 right-4 font-display font-black text-5xl text-[#c8ff3d]/20 select-none">
                01
              </div>
              <div>
                <div className="text-4xl mb-2">🏆</div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase text-[#06070c] bg-[#c8ff3d] shadow-[0_0_15px_rgba(200,255,61,0.4)]">
                  ПОБЕДИТЕЛЬ ВАЙБАТОНА
                </span>
                <h3 className="font-display font-black text-2xl text-white mt-3 truncate">
                  {top1.submission.title}
                </h3>
                <p className="text-sm text-[#c8ff3d] font-mono font-bold mt-0.5">
                  {top1.submission.teamName || top1.submission.authorName}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between font-mono">
                <span className="text-xs text-[#8b93ad]">Итоговый балл жюри:</span>
                <span className="font-display font-black text-3xl text-[#c8ff3d]">
                  {top1.avgTotal} <span className="text-sm text-[#5c647e]">/ 40</span>
                </span>
              </div>
            </div>
          )}

          {/* BRONZE #3 */}
          {top3 && (
            <div className="order-3 md:order-3 bg-[#0e111c] border border-[#ff3da6]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[280px]">
              <div className="absolute top-4 right-4 font-display font-black text-4xl text-[#ff3da6]/20 select-none">
                03
              </div>
              <div>
                <div className="text-3xl mb-2">🥉</div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-[#ff3da6] bg-[#ff3da6]/10 border border-[#ff3da6]/30">
                  3 МЕСТО
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-2 truncate">
                  {top3.submission.title}
                </h3>
                <p className="text-xs text-[#8b93ad] font-mono">
                  {top3.submission.teamName || top3.submission.authorName}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e2436] flex items-center justify-between font-mono">
                <span className="text-xs text-[#8b93ad]">Средний балл:</span>
                <span className="font-display font-black text-2xl text-[#ff3da6]">
                  {top3.avgTotal} <span className="text-xs text-[#5c647e]">/ 40</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TABS NAVIGATION & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-1.5 bg-[#0a0c14] p-1.5 rounded-2xl border border-[#1e2436] w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("jury");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === "jury"
                ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_12px_rgba(200,255,61,0.3)]"
                : "text-[#8b93ad] hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Судейский зачет ({scoredSubmissions.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("activity");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === "activity"
                ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_12px_rgba(200,255,61,0.3)]"
                : "text-[#8b93ad] hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Пульс активности ({leaderboard.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab("awards");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              activeTab === "awards"
                ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_12px_rgba(200,255,61,0.3)]"
                : "text-[#8b93ad] hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Номинации</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#5c647e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или стеку..."
            className="w-full bg-[#0a0c14] border border-[#1e2436] focus:border-[#c8ff3d] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#5c647e] outline-none"
          />
        </div>
      </div>

      {/* 4. MAIN TABLE CONTENT */}
      {activeTab === "jury" ? (
        <div className="bg-[#0e111c] border border-[#1e2436] rounded-3xl overflow-hidden shadow-2xl font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a0c14] border-b border-[#1e2436] text-[#8b93ad] uppercase text-[10.5px] tracking-wider">
                  <th className="py-4 px-5"># Ранг</th>
                  <th className="py-4 px-5">Проект / Команда</th>
                  <th className="py-4 px-5">Стек</th>
                  <th className="py-4 px-5 text-center">Оценок жюри</th>
                  <th className="py-4 px-5 text-right">Средний балл</th>
                  <th className="py-4 px-5 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2436]">
                {filteredScored.map((item, idx) => {
                  const isExpanded = expandedRowId === item.submission.id;
                  return (
                    <React.Fragment key={item.submission.id}>
                      <tr className="hover:bg-[#121627] transition-colors">
                        <td className="py-4 px-5 font-bold">
                          <span className={`font-display text-base ${idx === 0 ? "text-[#c8ff3d]" : idx === 1 ? "text-[#41f0ff]" : idx === 2 ? "text-[#ff3da6]" : "text-[#8b93ad]"}`}>
                            {idx < 9 ? `0${idx + 1}` : idx + 1}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-bold text-sm text-white">{item.submission.title}</div>
                          <div className="text-[11px] text-[#8b93ad] mt-0.5">
                            {item.submission.teamName || item.submission.authorName}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1">
                            {(item.submission.techStack || []).slice(0, 3).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded bg-[#0a0c14] border border-[#2a3148] text-[10px] text-[#8b93ad]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.reviewCount > 0
                              ? "bg-[#41f0ff]/10 text-[#41f0ff] border border-[#41f0ff]/30"
                              : "bg-[#0a0c14] text-[#5c647e]"
                          }`}>
                            {item.reviewCount} оценок
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right font-display font-black text-lg text-[#c8ff3d]">
                          {item.avgTotal} <span className="text-xs text-[#5c647e] font-mono">/ 40</span>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.submission.demoUrl && (
                              <a
                                href={item.submission.demoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#121627] hover:bg-[#1e2436] text-[#41f0ff] border border-[#2a3148] transition-all"
                                title="Открыть демо"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {item.submission.githubUrl && (
                              <a
                                href={item.submission.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-[#121627] hover:bg-[#1e2436] text-white border border-[#2a3148] transition-all"
                                title="Репозиторий"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : item.submission.id)}
                              className="p-1.5 rounded-lg bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] border border-[#2a3148] transition-all"
                              title="Развернуть детали"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Criteria Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-[#0a0c14]/90 border-b border-[#1e2436]">
                          <td colSpan={6} className="p-6 space-y-4">
                            <div className="text-xs font-bold text-[#41f0ff] uppercase tracking-wider">
                              Детализация оценок по критериям:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {criteriaList.map((c) => (
                                <div key={c.id} className="p-3.5 rounded-2xl bg-[#0e111c] border border-[#1e2436]">
                                  <div className="text-[10px] text-[#8b93ad] uppercase truncate">{c.name}</div>
                                  <div className="font-display font-black text-xl text-white mt-1">
                                    {item.criterionAverages[c.id] || 0} <span className="text-xs text-[#5c647e]">/ 10</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "activity" ? (
        <div className="bg-[#0e111c] border border-[#1e2436] rounded-3xl overflow-hidden shadow-2xl font-mono">
          <div className="p-4 bg-[#0a0c14] border-b border-[#1e2436] flex items-center justify-between text-xs text-[#8b93ad]">
            <span>Показатель активности рассчитывается по публикациям в Devlog и темпу разработки</span>
            <span className="text-[#c8ff3d] font-bold">SOCIAL SCORE (НЕ ВЛИЯЕТ НА СУДЕЙ)</span>
          </div>

          <div className="divide-y divide-[#1e2436]">
            {filteredActivity.map((item, idx) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-[#121627] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`font-display font-bold text-xl ${idx === 0 ? "text-[#c8ff3d]" : idx === 1 ? "text-[#41f0ff]" : "text-[#5c647e]"}`}>
                    {idx < 9 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">{item.name}</div>
                    <div className="text-xs text-[#8b93ad] mt-0.5">
                      Проект: <strong className="text-[#41f0ff]">{item.projectTitle || "В разработке"}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display font-black text-lg text-[#c8ff3d]">
                    {item.eventsCount * 12} pts
                  </div>
                  <div className="text-[10px] text-[#5c647e] uppercase">Devlog Activity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SPECIAL AWARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#0e111c] border border-[#c8ff3d]/30 space-y-3">
            <div className="text-3xl">🚀</div>
            <h3 className="font-display font-bold text-lg text-white">Best Technical Solution</h3>
            <p className="text-xs text-[#8b93ad] font-body">
              Присуждается за самую надежную и элегантную архитектуру кода и чистоту реализации.
            </p>
            <div className="pt-2 text-xs font-mono text-[#c8ff3d] font-bold">
              Номинант: Team Zero (Hackflow OS)
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e111c] border border-[#41f0ff]/30 space-y-3">
            <div className="text-3xl">🎨</div>
            <h3 className="font-display font-bold text-lg text-white">Best Live UI & Vibe</h3>
            <p className="text-xs text-[#8b93ad] font-body">
              Награда за лучшую визуальную подачу, неоновую эстетику и динамику интерфейса.
            </p>
            <div className="pt-2 text-xs font-mono text-[#41f0ff] font-bold">
              Номинант: Team Pixel (VibeStage)
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e111c] border border-[#ff3da6]/30 space-y-3">
            <div className="text-3xl">🤖</div>
            <h3 className="font-display font-bold text-lg text-white">Best AI Host Integration</h3>
            <p className="text-xs text-[#8b93ad] font-body">
              Самое глубокое и органичное внедрение Gemini и речевого синтеза в игровой процесс.
            </p>
            <div className="pt-2 text-xs font-mono text-[#ff3da6] font-bold">
              Номинант: EventLoop (Тимур Алиев)
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e111c] border border-[#8f7bff]/30 space-y-3">
            <div className="text-3xl">⚡</div>
            <h3 className="font-display font-bold text-lg text-white">Speedrun MVP Award</h3>
            <p className="text-xs text-[#8b93ad] font-body">
              Приз за рекордную скорость достижения рабочего MVP с момента старта хакатона.
            </p>
            <div className="pt-2 text-xs font-mono text-[#8f7bff] font-bold">
              Номинант: VibeCheck (Максим Орлов)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
