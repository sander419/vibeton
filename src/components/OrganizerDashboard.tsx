import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Shield, 
  Radio, 
  RotateCcw, 
  CheckCircle2, 
  Bot,
  Download,
  FileJson,
  Check,
  BarChart3,
  Layers
} from "lucide-react";
import { sound } from "../utils/audio";
import type { HackathonStage } from "../types";

export const OrganizerDashboard: React.FC = () => {
  const { 
    hackathon, 
    updateHackathon, 
    triggerAIHostBroadcast, 
    resetDemoSeed, 
    users, 
    teams, 
    projects, 
    posts,
    submissions,
    judgements,
    leaderboard,
    duels,
    aiMessages,
    activeEventId,
    currentUser
  } = useHackathon();

  const [title, setTitle] = useState(hackathon?.title || "Вайбатон №2");
  const [theme, setTheme] = useState(hackathon?.theme || "Платформа для проведения Вайбатонов");
  const [description, setDescription] = useState(hackathon?.description || "");
  const [broadcastReason, setBroadcastReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateHackathon({
        title,
        theme,
        description
      });
      sound.playSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      await triggerAIHostBroadcast(broadcastReason || "Официальное объявление организатора");
      sound.playBroadcastChime();
      setBroadcastReason("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDownloadReport = () => {
    try {
      sound.playClick();
      
      const reportData = {
        metadata: {
          reportType: "HACKATHON_EVENT_AUDIT_REPORT",
          generatedAt: new Date().toISOString(),
          exportedBy: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : "ORGANIZER_ROOT",
          appEngine: "Competition OS v2.4 (Industrial Edition)",
          activeEventId: activeEventId || hackathon?.id || "vibeathon-current"
        },
        eventSummary: {
          id: hackathon?.id,
          title: hackathon?.title || title,
          theme: hackathon?.theme || theme,
          description: hackathon?.description || description,
          stage: hackathon?.stage || "ACTIVE",
          templateType: hackathon?.templateType || "VIBEATHON",
          startDate: hackathon?.startDate,
          endDate: hackathon?.endDate,
          criteria: hackathon?.criteria || [],
          awards: hackathon?.awards || []
        },
        analyticsSummary: {
          totalParticipants: users.length,
          totalTeams: teams.length,
          totalProjects: projects.length,
          totalSubmissions: submissions.length,
          totalDevlogPosts: posts.length,
          totalJudgements: judgements.length,
          totalActiveDuels: Object.keys(duels || {}).length,
          mvpReadyCount: projects.filter(p => ["MVP", "DEMO", "SUBMITTED"].includes(p.status)).length,
          averageTeamSize: Number((users.length / Math.max(teams.length, 1)).toFixed(2))
        },
        leaderboardResults: leaderboard || [],
        participantStats: users.map(u => ({
          id: u.id,
          name: u.name,
          handle: u.handle,
          role: u.role,
          teamId: u.teamId,
          teamName: teams.find(t => t.id === u.teamId)?.name || "Solo",
          skills: u.skills || [],
          stats: u.stats || {},
          rating: u.rating || 1000,
          bio: u.bio || ""
        })),
        teams: teams.map(t => ({
          id: t.id,
          name: t.name,
          tag: t.tag,
          description: t.description,
          membersCount: t.members?.length || 0,
          members: t.members,
          project: projects.find(p => p.teamId === t.id) || null,
          velocityScore: t.velocityScore || 0
        })),
        projects: projects.map(p => ({
          id: p.id,
          teamId: p.teamId,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          status: p.status,
          tags: p.tags || [],
          repoUrl: p.repoUrl,
          demoUrl: p.demoUrl,
          likesCount: p.likesCount || 0
        })),
        submissionsAndScores: submissions.map(s => {
          const projectJudgements = judgements.filter(j => j.submissionId === s.id);
          const totalScoresList = projectJudgements.map(j => {
            if (j.totalScore) return j.totalScore;
            return Object.values(j.scores || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
          });
          const avgScore = totalScoresList.length > 0
            ? Number((totalScoresList.reduce((a: number, b: number) => a + b, 0) / totalScoresList.length).toFixed(2))
            : null;

          return {
            ...s,
            judgementsCount: projectJudgements.length,
            averageScore: avgScore,
            judgements: projectJudgements
          };
        }),
        devlogSummary: posts.map(p => ({
          id: p.id,
          teamId: p.teamId,
          authorId: p.authorId,
          milestone: p.milestone,
          category: p.category,
          status: p.status,
          mediaType: p.mediaType,
          mediaUrl: p.mediaUrl,
          reactions: p.reactions,
          createdAt: p.createdAt
        })),
        aiHostBroadcasts: aiMessages || [],
        duels: duels || {}
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(reportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      const filename = `event-report-${hackathon?.id || 'vibeathon'}-${new Date().toISOString().slice(0, 10)}.json`;
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      sound.playSuccess();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("Export report error:", err);
    }
  };

  const stages: Array<{ id: HackathonStage; label: string; desc: string; code: string }> = [
    { id: "DRAFT", label: "Черновик", desc: "Подготовка регламента", code: "[00]" },
    { id: "REGISTRATION", label: "Регистрация", desc: "Набор участников и команд", code: "[01]" },
    { id: "ACTIVE", label: "Активная разработка", desc: "7 дней кодинга и Devlog", code: "[02]" },
    { id: "SUBMISSION", label: "Прием работ", desc: "Финальная сдача проектов", code: "[03]" },
    { id: "JUDGING", label: "Судейство", desc: "Оценка жюри по критериям", code: "[04]" },
    { id: "RESULTS", label: "Итоги и награждение", desc: "Показ подиума победителей", code: "[05]" }
  ];

  return (
    <div className="space-y-8 mb-14 font-mono text-[#1A1A1A]">
      {/* 1. Header Hero Panel */}
      <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 sm:p-8 shadow-[4px_4px_0px_#1A1A1A] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#E63946]">
            <Shield className="w-6 h-6 text-[#E63946]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E63946] uppercase tracking-wider">[00] ORGANIZER COCKPIT</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#EFECE6] border border-[#1A1A1A] text-[#1A1A1A] font-bold">ROOT ACCESS</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1A1A] uppercase tracking-tight mt-0.5">
              Управление соревнованием
            </h2>
            <p className="text-xs text-[#666]">
              Переключение стадий турнира, управление AI Host и экспорт аналитического аудита
            </p>
          </div>
        </div>

        {/* Header Action Buttons: Download Report + Reset Data */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="download-report-btn"
            onClick={handleDownloadReport}
            className="px-4 py-2.5 bg-[#E63946] hover:bg-[#1A1A1A] text-white text-xs font-bold uppercase border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Отчет выгружен (.JSON)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report (.JSON)</span>
              </>
            )}
          </button>

          <button
            onClick={resetDemoSeed}
            className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#EFECE6] text-xs font-bold text-[#1A1A1A] border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 uppercase transition-all"
          >
            <RotateCcw className="w-4 h-4 text-[#E63946]" />
            <span>Сброс Demo данных</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Stage Switcher & Event Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stage Control Panel */}
          <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] space-y-4">
            <div className="flex items-center justify-between border-b-1.5 border-[#1A1A1A] pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E63946]" />
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">[01] ЭТАП СОРЕВНОВАНИЯ</h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-[#1A1A1A] text-white border border-[#1A1A1A] font-bold uppercase">
                АКТИВЕН: {hackathon?.stage}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stages.map((st) => {
                const isActive = hackathon?.stage === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      sound.playClick();
                      updateHackathon({ stage: st.id });
                    }}
                    className={`p-3.5 border-1.5 text-left transition-all ${
                      isActive
                        ? "bg-[#1A1A1A] text-[#F8F7F4] border-[#1A1A1A] shadow-[3px_3px_0px_#E63946]"
                        : "bg-[#F8F7F4] hover:bg-[#FFFFFF] text-[#1A1A1A] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs uppercase ${isActive ? "text-[#E63946]" : "text-[#1A1A1A]"}`}>
                        {st.code} {st.label}
                      </span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-[#E63946]" />}
                    </div>
                    <p className={`text-[11px] leading-tight ${isActive ? "text-[#CCC]" : "text-[#666]"}`}>{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Metadata Form */}
          <form onSubmit={handleSaveSettings} className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] space-y-4">
            <div className="flex items-center justify-between border-b-1.5 border-[#1A1A1A] pb-2.5">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">[02] ПАРАМЕТРЫ И РЕГЛАМЕНТ</h3>
              <span className="label">[METADATA]</span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#666] uppercase block mb-1">Название события</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F8F7F4] border-1.5 border-[#1A1A1A] px-3.5 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888] font-mono focus:outline-none shadow-[2px_2px_0px_#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#666] uppercase block mb-1">Тема состязания</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[#F8F7F4] border-1.5 border-[#1A1A1A] px-3.5 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-[#888] font-mono focus:outline-none shadow-[2px_2px_0px_#1A1A1A]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#666] uppercase block mb-1">Описание и регламент</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8F7F4] border-1.5 border-[#1A1A1A] p-3 text-xs text-[#1A1A1A] placeholder-[#888] font-mono focus:outline-none shadow-[2px_2px_0px_#1A1A1A] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#E63946] text-white font-bold uppercase text-xs border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
              >
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: AI Host Broadcast Launcher, Live Stats & Report Export */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trigger AI Host Broadcast Card */}
          <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] space-y-4">
            <div className="flex items-center justify-between border-b-1.5 border-[#1A1A1A] pb-2.5">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#E63946]" />
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">[03] AI HOST ON-AIR</h3>
              </div>
              <span className="label text-[#E63946]">[VOICE BROADCAST]</span>
            </div>

            <p className="text-xs text-[#666]">
              Сформировать внеочередную голосовую сводку ведущего по текущему прогрессу хакатона.
            </p>

            <div>
              <label className="text-xs font-bold text-[#666] uppercase block mb-1">Повод для объявления</label>
              <input
                type="text"
                value={broadcastReason}
                onChange={(e) => setBroadcastReason(e.target.value)}
                placeholder="Например: до дедлайна 24 часа! Загрузите MVP"
                className="w-full bg-[#F8F7F4] border-1.5 border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] placeholder-[#888] font-mono focus:outline-none shadow-[2px_2px_0px_#1A1A1A]"
              />
            </div>

            <button
              onClick={handleTriggerBroadcast}
              disabled={isBroadcasting}
              className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#E63946] disabled:opacity-50 text-white font-bold uppercase text-xs flex items-center justify-center gap-2 border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
            >
              <Radio className="w-4 h-4 text-[#E63946]" />
              <span>{isBroadcasting ? "Генерация ведущего..." : "Выпустить AI Host в эфир"}</span>
            </button>
          </div>

          {/* Quick Metrics Overview & Export Box */}
          <div className="bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_#1A1A1A] space-y-4">
            <div className="flex items-center justify-between border-b-1.5 border-[#1A1A1A] pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E63946]" />
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">[04] ТЕЛЕМЕТРИЯ И АУДИТ</h3>
              </div>
              <span className="label">[STATS]</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#F8F7F4] p-3 border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                <div className="font-display text-2xl font-bold text-[#1A1A1A]">{users.length}</div>
                <div className="text-[10px] text-[#666] font-bold uppercase">Участников</div>
              </div>
              <div className="bg-[#F8F7F4] p-3 border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                <div className="font-display text-2xl font-bold text-[#E63946]">{teams.length}</div>
                <div className="text-[10px] text-[#666] font-bold uppercase">Команд</div>
              </div>
              <div className="bg-[#F8F7F4] p-3 border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                <div className="font-display text-2xl font-bold text-[#1A1A1A]">{projects.length}</div>
                <div className="text-[10px] text-[#666] font-bold uppercase">Проектов</div>
              </div>
              <div className="bg-[#F8F7F4] p-3 border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">
                <div className="font-display text-2xl font-bold text-[#E63946]">{submissions.length}</div>
                <div className="text-[10px] text-[#666] font-bold uppercase">Сдано работ</div>
              </div>
            </div>

            {/* Dedicated Download Report CTA Box */}
            <div className="p-4 bg-[#F8F7F4] border-1.5 border-[#1A1A1A] space-y-3 shadow-[2px_2px_0px_#1A1A1A]">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-[#E63946]" />
                <span className="text-xs font-bold uppercase text-[#1A1A1A]">Полный аудит состязания</span>
              </div>
              <p className="text-[11px] text-[#555] leading-relaxed">
                Экспорт в структурированный JSON: итоговые баллы судейства, лидерборд, команды, участники, devlog и логи дуэлей.
              </p>
              <button
                onClick={handleDownloadReport}
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#1A1A1A] hover:text-[#F8F7F4] text-[#1A1A1A] font-bold uppercase text-xs border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Скачать итоговый отчет (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


