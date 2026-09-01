import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useHackathon } from "../context/HackathonContext";
import {
  INITIAL_PAST_HACKATHONS,
  INITIAL_USER_REGISTRATIONS
} from "../data/userDashboardData";
import {
  PastHackathonRecord,
  UserRegistrationRecord,
  Project,
  Submission
} from "../types";
import {
  User as UserIcon,
  Trophy,
  Layers,
  Sparkles,
  ExternalLink,
  Github,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Calendar,
  Share2,
  Edit3,
  Plus,
  ArrowRight,
  Shield,
  FileText,
  Copy,
  Check,
  Zap,
  Users,
  MessageSquare,
  Flame,
  Download,
  Filter,
  Search,
  ChevronRight,
  X
} from "lucide-react";

interface ParticipantDashboardProps {
  onOpenSubmission?: () => void;
  onOpenRegister?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  onOpenSubmission,
  onOpenRegister,
  onNavigateToTab
}) => {
  const {
    currentUser,
    users,
    switchActiveUser,
    projects,
    submissions,
    judgements,
    posts,
    teams,
    eventsList,
    switchEvent,
    hackathon,
    registerUser
  } = useHackathon();

  const [activeSubTab, setActiveSubTab] = useState<"projects" | "registrations" | "history" | "portfolio">("projects");
  const [selectedCertificate, setSelectedCertificate] = useState<PastHackathonRecord | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedPortfolio, setCopiedPortfolio] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Editable profile state
  const [editBio, setEditBio] = useState(currentUser?.bio || "");
  const [editStack, setEditStack] = useState(currentUser?.stack.join(", ") || "");
  const [editSkills, setEditSkills] = useState(currentUser?.skills.join(", ") || "");
  const [editGithub, setEditGithub] = useState(currentUser?.githubUrl || "");
  const [editPrimaryRole, setEditPrimaryRole] = useState(currentUser?.primaryRole || "");
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // Sync edit profile form when user switches
  useEffect(() => {
    if (currentUser) {
      setEditBio(currentUser.bio || "");
      setEditStack(currentUser.stack ? currentUser.stack.join(", ") : "");
      setEditSkills(currentUser.skills ? currentUser.skills.join(", ") : "");
      setEditGithub(currentUser.githubUrl || "");
      setEditPrimaryRole(currentUser.primaryRole || "");
    }
  }, [currentUser?.id]);

  const currentUserId = currentUser?.id || "usr-1";

  // Get user's user team and projects
  const userTeam = teams.find((t) =>
    t.members.some((m) => m.userId === currentUserId) || t.captainId === currentUserId
  );

  const userProjects: Project[] = projects.filter(
    (p) => p.authorId === currentUserId || (userTeam && p.teamId === userTeam.id)
  );

  const userSubmissions: Submission[] = submissions.filter(
    (s) => s.authorId === currentUserId || (userTeam && s.teamId === userTeam.id)
  );

  const userPosts = posts.filter(
    (p) => p.authorId === currentUserId || (userTeam && p.teamId === userTeam.id)
  );

  // Get user's registrations and past records
  const userRegistrations: UserRegistrationRecord[] =
    INITIAL_USER_REGISTRATIONS[currentUserId] || [
      {
        id: `reg-vibe2-${currentUserId}`,
        eventId: "vibeathon-2",
        eventTitle: "Вайбатон №2: Платформа для проведения Вайбатонов",
        eventTheme: "Платформа для проведения Вайбатонов с AI Host",
        templateType: "VIBEATHON",
        stage: "ACTIVE",
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
        teamName: userTeam?.name || "Индивидуальный участник",
        roleInTeam: currentUser?.primaryRole || "Участник",
        deadline: hackathon?.submissionDeadline || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        hasSubmission: userSubmissions.length > 0
      }
    ];

  const userPastHackathons: PastHackathonRecord[] =
    INITIAL_PAST_HACKATHONS[currentUserId] || [];

  // Total awards count across history
  const totalAwardsWon = userPastHackathons.reduce((acc, h) => acc + (h.awards?.length || 0), 0);

  // Handle saving profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await registerUser({
      id: currentUser.id,
      bio: editBio,
      primaryRole: editPrimaryRole,
      githubUrl: editGithub,
      stack: editStack.split(",").map((s) => s.trim()).filter(Boolean),
      skills: editSkills.split(",").map((s) => s.trim()).filter(Boolean)
    });

    setSaveProfileSuccess(true);
    setTimeout(() => {
      setSaveProfileSuccess(false);
      setIsEditingProfile(false);
    }, 1200);
  };

  // Copy portfolio summary text to clipboard
  const handleCopyPortfolio = () => {
    if (!currentUser) return;
    const portfolioText = `
=== PORTFOLIO // COMPETITION OS PARTICIPANT ===
Имя: ${currentUser.name} (@${currentUser.username})
Роль: ${currentUser.primaryRole || currentUser.role}
Стек: ${currentUser.stack.join(", ")}
Навыки: ${currentUser.skills.join(", ")}
GitHub: ${currentUser.githubUrl || "https://github.com/" + currentUser.username}

[АКТИВНЫЕ ПРОЕКТЫ]:
${userProjects.map((p) => `- ${p.title} (${p.status}): ${p.tagline} | Demo: ${p.demoUrl || "N/A"}`).join("\n")}

[ИСТОРИЯ И НАГРАДЫ ХАКАТОНОВ]:
${userPastHackathons.map((h) => `- ${h.eventTitle} -> ${h.placement} (${h.projectTitle}) | Награды: ${h.awards?.join(", ")}`).join("\n")}
================================================
    `.trim();

    navigator.clipboard.writeText(portfolioText);
    setCopiedPortfolio(true);
    setTimeout(() => setCopiedPortfolio(false), 2000);
  };

  return (
    <div id="participant-dashboard-view" className="space-y-6">
      {/* Top Header / Identity Matrix */}
      <div className="border border-[#111113] bg-[#FFFFFF] shadow-[4px_4px_0px_#111113] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* User Info Column */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                alt={currentUser?.name || "Participant"}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-none border-2 border-[#111113] object-cover shadow-[2px_2px_0px_#111113]"
                referrerPolicy="no-referrer"
              />
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border border-[#111113] rounded-full"
                title="Онлайн в арене соревнования"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display font-black text-xl sm:text-2xl text-[#111113] uppercase tracking-tight">
                  {currentUser?.name || "Участник"}
                </h1>
                <span className="px-2 py-0.5 bg-[#2563EB] text-white text-[10px] font-mono font-bold tracking-wider uppercase border border-[#111113]">
                  [{currentUser?.primaryRole || currentUser?.role || "PARTICIPANT"}]
                </span>
                {userTeam && (
                  <span className="px-2 py-0.5 bg-[#EFECE6] text-[#111113] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#111113]">
                    TEAM: {userTeam.name}
                  </span>
                )}
              </div>

              <div className="text-xs text-[#555] font-mono flex flex-wrap items-center gap-3">
                <span className="font-bold text-[#111113]">@{currentUser?.username || "dev"}</span>
                <span>•</span>
                <span>{currentUser?.email || "user@fix-ed.me"}</span>
                {currentUser?.githubUrl && (
                  <>
                    <span>•</span>
                    <a
                      href={currentUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </a>
                  </>
                )}
              </div>

              <p className="text-xs text-[#444] max-w-2xl leading-relaxed">
                {currentUser?.bio || "Участник соревнований и хакатонов платформы Fix-Ed."}
              </p>

              {/* Stack Pills */}
              {currentUser?.stack && currentUser.stack.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-[#777] uppercase font-bold mr-1">Стек:</span>
                  {currentUser.stack.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 bg-[#F4F3EF] text-[#222] text-[10px] border border-[#111113]/30 font-mono"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Participant Switcher */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 border-t lg:border-t-0 border-[#111113]/20 pt-4 lg:pt-0">
            {/* Quick Switch Persona Selector */}
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-mono font-bold uppercase text-[#666] mb-1">
                [СМЕНИТЬ УЧАСТНИКА ДЛЯ ТЕСТА]:
              </label>
              <select
                id="participant-switcher-select"
                value={currentUser?.id || "usr-1"}
                onChange={(e) => switchActiveUser(e.target.value)}
                className="w-full sm:w-60 bg-[#F8F7F4] border border-[#111113] px-2.5 py-1.5 text-xs font-bold font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#2563EB] shadow-[1px_1px_0px_#111113]"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.primaryRole || u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EAE8E2] text-xs font-bold font-mono uppercase transition-colors shadow-[1px_1px_0px_#111113]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? "Закрыть" : "Профиль"}</span>
              </button>

              <button
                id="copy-portfolio-btn"
                onClick={handleCopyPortfolio}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-xs font-bold font-mono uppercase transition-colors shadow-[2px_2px_0px_#111113]"
                title="Скопировать текстовое портфолио с достижениями"
              >
                {copiedPortfolio ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPortfolio ? "Скопировано!" : "Экспорт CV"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Inline Profile Editor Drawer */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#111113] mt-5 pt-5"
            >
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold font-mono uppercase text-[#111113] flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Редактирование профиля участника</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="text-xs text-[#777] hover:text-[#111113]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">
                      Основная роль:
                    </label>
                    <input
                      type="text"
                      value={editPrimaryRole}
                      onChange={(e) => setEditPrimaryRole(e.target.value)}
                      placeholder="e.g. Frontend Lead, AI Engineer, Fullstack"
                      className="w-full bg-[#F8F7F4] border border-[#111113] px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">
                      Ссылка на GitHub:
                    </label>
                    <input
                      type="text"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-[#F8F7F4] border border-[#111113] px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">
                      Технологический стек (через запятую):
                    </label>
                    <input
                      type="text"
                      value={editStack}
                      onChange={(e) => setEditStack(e.target.value)}
                      placeholder="React 19, Node.js, Gemini API, Tailwind"
                      className="w-full bg-[#F8F7F4] border border-[#111113] px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">
                      О себе / Биография:
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Расскажите о своем опыте, роли в команде и целях на хакатоне..."
                      className="w-full bg-[#F8F7F4] border border-[#111113] px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {saveProfileSuccess && (
                    <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Профиль сохранен!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase transition-colors shadow-[2px_2px_0px_#2563EB]"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 Key Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#111113]/20 font-mono">
          {/* Metric 1 */}
          <div className="p-3 bg-[#F8F7F4] border border-[#111113] flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase text-[#666] flex items-center justify-between">
              <span>ПРОЕКТЫ & MVP</span>
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-[#111113]">
                {userProjects.length.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-[#777]">
                ({userSubmissions.length} сдан)
              </span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-3 bg-[#F8F7F4] border border-[#111113] flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase text-[#666] flex items-center justify-between">
              <span>РЕГИСТРАЦИИ</span>
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-[#111113]">
                {userRegistrations.length.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-green-700 font-bold">
                [АКТИВНЫ]
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-3 bg-[#F8F7F4] border border-[#111113] flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase text-[#666] flex items-center justify-between">
              <span>ХАКАТОНЫ В АРХИВЕ</span>
              <Trophy className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-[#111113]">
                {userPastHackathons.length.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-[#777]">
                событий
              </span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-3 bg-[#F8F7F4] border border-[#111113] flex flex-col justify-between">
            <div className="text-[10px] font-bold uppercase text-[#666] flex items-center justify-between">
              <span>НАГРАДЫ & МЕДАЛИ</span>
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl text-[#111113]">
                {totalAwardsWon.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-amber-600 font-bold">
                наград
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#111113] pb-2 font-mono">
        <button
          id="dashboard-tab-projects"
          onClick={() => setActiveSubTab("projects")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border border-[#111113] transition-all ${
            activeSubTab === "projects"
              ? "bg-[#111113] text-[#F8F7F4] shadow-[2px_2px_0px_#2563EB]"
              : "bg-[#F8F7F4] text-[#111113] hover:bg-[#EBEAE5]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>[01] Мои проекты и сдачи</span>
          <span className="px-1.5 py-0.2 bg-[#2563EB] text-white text-[10px] font-bold">
            {userProjects.length}
          </span>
        </button>

        <button
          id="dashboard-tab-registrations"
          onClick={() => setActiveSubTab("registrations")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border border-[#111113] transition-all ${
            activeSubTab === "registrations"
              ? "bg-[#111113] text-[#F8F7F4] shadow-[2px_2px_0px_#2563EB]"
              : "bg-[#F8F7F4] text-[#111113] hover:bg-[#EBEAE5]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>[02] Активные регистрации</span>
          <span className="px-1.5 py-0.2 bg-[#2563EB] text-white text-[10px] font-bold">
            {userRegistrations.length}
          </span>
        </button>

        <button
          id="dashboard-tab-history"
          onClick={() => setActiveSubTab("history")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border border-[#111113] transition-all ${
            activeSubTab === "history"
              ? "bg-[#111113] text-[#F8F7F4] shadow-[2px_2px_0px_#2563EB]"
              : "bg-[#F8F7F4] text-[#111113] hover:bg-[#EBEAE5]"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>[03] История и архив хакатонов</span>
          <span className="px-1.5 py-0.2 bg-[#2563EB] text-white text-[10px] font-bold">
            {userPastHackathons.length}
          </span>
        </button>

        <button
          id="dashboard-tab-portfolio"
          onClick={() => setActiveSubTab("portfolio")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase border border-[#111113] transition-all ${
            activeSubTab === "portfolio"
              ? "bg-[#111113] text-[#F8F7F4] shadow-[2px_2px_0px_#2563EB]"
              : "bg-[#F8F7F4] text-[#111113] hover:bg-[#EBEAE5]"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>[04] Награды и дипломы</span>
          <span className="px-1.5 py-0.2 bg-[#2563EB] text-white text-[10px] font-bold">
            {totalAwardsWon}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SUBMITTED PROJECTS & MVP BUILDS */}
      {/* ========================================================================= */}
      {activeSubTab === "projects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 border border-[#111113] shadow-[2px_2px_0px_#111113]">
            <div>
              <h2 className="font-display font-bold text-base text-[#111113] uppercase tracking-tight">
                Проекты и сданные решения текущего пользователя
              </h2>
              <p className="text-xs text-[#666]">
                Отслеживание статуса разработки MVP, чек-листа соответствия правилам и оценок экспертного жюри.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="submit-project-top-action-btn"
                onClick={onOpenSubmission}
                className="px-3.5 py-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111113] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Сдать / Обновить проект</span>
              </button>
            </div>
          </div>

          {userProjects.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border border-[#111113] shadow-[2px_2px_0px_#111113] space-y-3">
              <Layers className="w-10 h-10 text-[#999] mx-auto" />
              <h3 className="font-bold text-sm text-[#111113] uppercase">
                У вас пока нет зарегистрированных проектов
              </h3>
              <p className="text-xs text-[#666] max-w-md mx-auto">
                Создайте команду или начните индивидуальное участие в текущем событии «{hackathon?.title || "Вайбатон"}», чтобы привязать репозиторий и демо.
              </p>
              <button
                onClick={onOpenSubmission}
                className="px-4 py-2 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase"
              >
                + Зарегистрировать проект
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {userProjects.map((project) => {
                const submission = userSubmissions.find((s) => s.projectId === project.id);
                const projectJudgements = judgements.filter((j) => j.projectId === project.id);
                const avgScore =
                  projectJudgements.length > 0
                    ? (
                        projectJudgements.reduce((acc, j) => acc + j.totalScore, 0) /
                        projectJudgements.length
                      ).toFixed(1)
                    : null;

                return (
                  <div
                    key={project.id}
                    className="border border-[#111113] bg-[#FFFFFF] shadow-[4px_4px_0px_#111113] p-5 sm:p-6 space-y-5"
                  >
                    {/* Project Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#111113]/20 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-[#111113] text-white text-[10px] font-bold uppercase tracking-widest font-mono">
                            [{project.hackathonId === "vibeathon-2" ? "ВАЙБАТОН №2" : project.hackathonId.toUpperCase()}]
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border border-[#111113] ${
                              project.status === "MVP"
                                ? "bg-green-100 text-green-800"
                                : project.status === "SUBMITTED"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            СТАТУС: [{project.status}]
                          </span>
                        </div>
                        <h3 className="font-display font-black text-lg sm:text-xl text-[#111113] uppercase tracking-tight">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#555] font-mono">{project.tagline}</p>
                      </div>

                      {/* Action Links Pill */}
                      <div className="flex flex-wrap items-center gap-2">
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[1px_1px_0px_#111113]"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Демо-стенд</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {project.repoUrl && (
                          <a
                            href={project.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EBEAE5] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[1px_1px_0px_#111113]"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Репозиторий</span>
                          </a>
                        )}
                        <button
                          onClick={onOpenSubmission}
                          className="px-3 py-1.5 bg-[#111113] text-white hover:bg-[#333] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Обновить скрепку</span>
                        </button>
                      </div>
                    </div>

                    {/* Description & Tech Tags */}
                    <div className="space-y-2 text-xs">
                      <p className="text-[#333] leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-[#666]">Теги стека:</span>
                        {project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#F4F3EF] border border-[#111113]/30 text-[10px] font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Submission Verification Checklist */}
                    <div className="p-4 bg-[#F8F7F4] border border-[#111113] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111113]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                          <span>Чек-лист сдачи проекта на оценку:</span>
                        </span>
                        <span className="text-[10px] text-[#666] font-mono">
                          {submission ? "ОТПРАВЛЕНО В ЖЮРИ" : "ЧЕРНОВИК"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${project.status === "MVP" || submission?.checklist.mvpWorks ? "bg-green-600 text-white" : "bg-neutral-300"}`}>✓</span>
                          <span>Рабочий MVP запущен</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${project.repoUrl || submission?.checklist.repoAvailable ? "bg-green-600 text-white" : "bg-neutral-300"}`}>✓</span>
                          <span>Открытый Git-репозиторий</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${project.demoUrl || submission?.checklist.demoAvailable ? "bg-green-600 text-white" : "bg-neutral-300"}`}>✓</span>
                          <span>Публичный демо-стенд</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${project.instructions || submission?.checklist.instructionsAdded ? "bg-green-600 text-white" : "bg-neutral-300"}`}>✓</span>
                          <span>Инструкция по запуску</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${project.videoUrl || submission?.checklist.videoAdded ? "bg-green-600 text-white" : "bg-neutral-300"}`}>✓</span>
                          <span>Видео-демонстрация</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#111113]/20">
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                          <span>Devlog: {userPosts.length} постов</span>
                        </div>
                      </div>
                    </div>

                    {/* Judge Reviews & Feedback Section */}
                    {projectJudgements.length > 0 && (
                      <div className="p-4 bg-[#FFFFFF] border-2 border-[#111113] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#2563EB]" />
                            <h4 className="font-display font-bold text-xs sm:text-sm text-[#111113] uppercase tracking-tight">
                              Оценки и отзывы судейской коллегии
                            </h4>
                          </div>
                          <span className="px-2.5 py-0.5 bg-[#111113] text-white text-xs font-mono font-bold">
                            СРЕДНИЙ БАЛЛ: {avgScore} / 40
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {projectJudgements.map((judgement) => (
                            <div
                              key={judgement.id}
                              className="p-3 bg-[#F8F7F4] border border-[#111113] space-y-2 text-xs font-mono"
                            >
                              <div className="flex items-center justify-between border-b border-[#111113]/20 pb-1.5">
                                <span className="font-bold text-[#111113]">
                                  {judgement.judgeName}
                                </span>
                                <span className="font-bold text-[#2563EB]">
                                  [{judgement.totalScore} / 40 БАЛЛОВ]
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-1 text-[10px] text-[#666]">
                                <div>MVP: <span className="font-bold text-[#111113]">{judgement.scores.mvp ?? 10}/10</span></div>
                                <div>AI: <span className="font-bold text-[#111113]">{judgement.scores.ai_core ?? 10}/10</span></div>
                                <div>UX: <span className="font-bold text-[#111113]">{judgement.scores.ux_vibe ?? 9}/10</span></div>
                                <div>VIAB: <span className="font-bold text-[#111113]">{judgement.scores.viability ?? 9}/10</span></div>
                              </div>

                              <p className="text-[11px] text-[#333] italic bg-white p-2 border border-[#111113]/10">
                                «{judgement.feedback}»
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Quick Navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono">
                      <div className="flex items-center gap-3 text-[#666]">
                        <span>Капитан: <strong className="text-[#111113]">{project.authorName}</strong></span>
                        <span>•</span>
                        <span>Создан: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab("devlog")}
                            className="px-3 py-1 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EAE8E2] font-bold uppercase transition-colors"
                          >
                            Лента Devlog ({userPosts.length})
                          </button>
                        )}
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab("leaderboard")}
                            className="px-3 py-1 bg-[#111113] text-white hover:bg-[#2563EB] font-bold uppercase transition-colors"
                          >
                            Позиция в табло →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ACTIVE REGISTRATIONS & LIVE COMPETITIONS */}
      {/* ========================================================================= */}
      {activeSubTab === "registrations" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 border border-[#111113] shadow-[2px_2px_0px_#111113]">
            <div>
              <h2 className="font-display font-bold text-base text-[#111113] uppercase tracking-tight">
                Текущие и предстоящие состязания участника
              </h2>
              <p className="text-xs text-[#666]">
                События, в которых подтверждена регистрация. Следите за дедлайнами и переключайтесь на арену события.
              </p>
            </div>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("discovery")}
                className="px-3.5 py-2 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[2px_2px_0px_#2563EB]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Каталог всех событий</span>
              </button>
            )}
          </div>

          {/* Registration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRegistrations.map((reg) => {
              const matchedEvent = eventsList.find((e) => e.id === reg.eventId) || hackathon;
              const isCurrentlyActiveEvent = hackathon?.id === reg.eventId;

              return (
                <div
                  key={reg.id}
                  className={`border border-[#111113] bg-[#FFFFFF] shadow-[3px_3px_0px_#111113] p-5 space-y-4 flex flex-col justify-between relative ${
                    isCurrentlyActiveEvent ? "border-l-4 border-l-[#2563EB]" : ""
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                          {reg.templateType}
                        </span>
                        <span className="px-2 py-0.5 bg-[#EFECE6] text-[#111113] text-[10px] font-bold uppercase tracking-wider font-mono border border-[#111113]">
                          [{reg.stage}]
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-green-700 font-mono bg-green-50 px-2 py-0.5 border border-green-300">
                        ● {reg.status}
                      </span>
                    </div>

                    {/* Title & Theme */}
                    <div>
                      <h3 className="font-display font-bold text-base text-[#111113] uppercase tracking-tight leading-snug">
                        {reg.eventTitle}
                      </h3>
                      <p className="text-xs text-[#555] font-mono mt-0.5">{reg.eventTheme}</p>
                    </div>

                    {/* Team & Role details */}
                    <div className="p-3 bg-[#F8F7F4] border border-[#111113]/30 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[#666]">Команда / Роль:</span>
                        <span className="font-bold text-[#111113]">
                          {reg.teamName || "Индивидуальный участник"} ({reg.roleInTeam || "Участник"})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#666]">Сдача проекта:</span>
                        <span className={`font-bold ${reg.hasSubmission ? "text-green-700" : "text-amber-600"}`}>
                          {reg.hasSubmission ? "[✓ СДАН]" : "[В РАЗРАБОТКЕ]"}
                        </span>
                      </div>

                      {reg.deadline && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#111113]/10">
                          <span className="text-[#666] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#2563EB]" /> Дедлайн:
                          </span>
                          <span className="font-bold text-[#111113]">
                            {new Date(reg.deadline).toLocaleDateString()} в {new Date(reg.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-[#111113]/20 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        switchEvent(reg.eventId);
                        if (onNavigateToTab) onNavigateToTab(reg.templateType === "DUEL" ? "duel" : "live");
                      }}
                      className="px-3 py-1.5 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[1px_1px_0px_#111113]"
                    >
                      <span>Перейти на арену</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={onOpenSubmission}
                      className="px-3 py-1.5 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EAE8E2] text-xs font-bold uppercase transition-colors"
                    >
                      {reg.hasSubmission ? "Обновить скрепку" : "Сдать проект"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Catalog Quick Connect Bar */}
          <div className="p-5 bg-[#FFFFFF] border border-[#111113] shadow-[2px_2px_0px_#111113] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-display font-bold text-xs sm:text-sm text-[#111113] uppercase tracking-tight">
                  Другие доступные события в каталоге
                </h3>
              </div>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab("discovery")}
                  className="text-xs font-bold text-[#2563EB] hover:underline uppercase"
                >
                  Все события →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {eventsList
                .filter((e) => !userRegistrations.some((r) => r.eventId === e.id))
                .slice(0, 3)
                .map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-[#F8F7F4] border border-[#111113] space-y-2 text-xs font-mono flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="px-1.5 py-0.2 bg-[#111113] text-white text-[9px] font-bold uppercase">
                          {event.templateType}
                        </span>
                        <span className="px-1.5 py-0.2 bg-white text-[#111113] text-[9px] font-bold border border-[#111113]">
                          [{event.stage}]
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#111113] uppercase leading-tight line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-[10px] text-[#666] line-clamp-2 mt-0.5">{event.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        switchEvent(event.id);
                        if (onOpenRegister) onOpenRegister();
                      }}
                      className="w-full mt-2 py-1 bg-white border border-[#111113] hover:bg-[#2563EB] hover:text-white text-[10px] font-bold uppercase transition-colors text-center"
                    >
                      + Зарегистрироваться
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: HISTORY OF PAST HACKATHONS & ACHIEVEMENTS */}
      {/* ========================================================================= */}
      {activeSubTab === "history" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 border border-[#111113] shadow-[2px_2px_0px_#111113]">
            <div>
              <h2 className="font-display font-bold text-base text-[#111113] uppercase tracking-tight">
                Архив завершенных хакатонов и турнирная история
              </h2>
              <p className="text-xs text-[#666]">
                Хроника прошлых сезонов, занятые места, оценки судей и полученные верифицированные сертификаты.
              </p>
            </div>

            <button
              onClick={handleCopyPortfolio}
              className="px-3.5 py-2 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EAE8E2] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[1px_1px_0px_#111113]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать выписку достижений</span>
            </button>
          </div>

          {userPastHackathons.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border border-[#111113] shadow-[2px_2px_0px_#111113] space-y-3">
              <Trophy className="w-10 h-10 text-[#999] mx-auto" />
              <h3 className="font-bold text-sm text-[#111113] uppercase">
                История завершенных состязаний пока пуста
              </h3>
              <p className="text-xs text-[#666] max-w-md mx-auto">
                Примите участие в текущем Вайбатоне №2, завершите проект и получите верифицированный диплом участника в зале славы.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPastHackathons.map((record) => (
                <div
                  key={record.id}
                  className="border border-[#111113] bg-[#FFFFFF] shadow-[3px_3px_0px_#111113] p-5 sm:p-6 space-y-4 font-mono"
                >
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#111113]/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#111113] text-white text-[10px] font-bold uppercase">
                          {record.templateType}
                        </span>
                        <span className="text-xs text-[#666] flex items-center gap-1 font-bold">
                          <Calendar className="w-3 h-3 text-[#2563EB]" />
                          {record.dateRange}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-lg sm:text-xl text-[#111113] uppercase tracking-tight">
                        {record.eventTitle}
                      </h3>
                      <p className="text-xs text-[#555]">{record.eventTheme}</p>
                    </div>

                    {/* Placement Medal Badge */}
                    <div className="flex flex-col sm:items-end">
                      <div className="px-3 py-1.5 bg-[#2563EB] text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111113]">
                        <Trophy className="w-4 h-4 text-amber-300" />
                        <span>{record.placement}</span>
                      </div>
                      {record.totalTeams && (
                        <span className="text-[10px] text-[#666] mt-1">
                          Ранг: #{record.rank} из {record.totalTeams} команд
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project & Result Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Left: Project Submitted */}
                    <div className="p-3.5 bg-[#F8F7F4] border border-[#111113] space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#666] flex items-center justify-between">
                        <span>СДАННЫЙ ПРОЕКТ:</span>
                        <span className="text-[#2563EB]">{record.teamName}</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#111113] uppercase">
                        {record.projectTitle}
                      </h4>
                      <p className="text-xs text-[#444]">{record.projectTagline}</p>

                      <div className="flex items-center gap-2 pt-1">
                        {record.projectDemoUrl && (
                          <a
                            href={record.projectDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2563EB] hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3 h-3" /> Демо
                          </a>
                        )}
                        {record.projectRepoUrl && (
                          <a
                            href={record.projectRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#111113] hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Github className="w-3 h-3" /> Репозиторий
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Score & Judge Feedback */}
                    <div className="p-3.5 bg-[#F8F7F4] border border-[#111113] space-y-2">
                      <div className="text-[10px] uppercase font-bold text-[#666] flex items-center justify-between">
                        <span>ОЦЕНКА & ВЕРДИКТ:</span>
                        <span className="font-bold text-[#111113]">
                          ИТОГО: {record.score} / {record.maxPossibleScore || 40}
                        </span>
                      </div>
                      <p className="text-xs text-[#333] italic leading-relaxed">
                        «{record.feedbackSummary}»
                      </p>

                      {/* Awards Chips */}
                      {record.awards && record.awards.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {record.awards.map((award, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 text-[10px] font-bold"
                            >
                              {award}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#111113]/20">
                    <span className="text-[10px] text-[#777]">
                      Верификация: SHA-256 // FIX-ED_LEDGER_ARCHIVE
                    </span>
                    <button
                      onClick={() => setSelectedCertificate(record)}
                      className="px-3 py-1.5 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-[1px_1px_0px_#111113]"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Посмотреть диплом / сертификат</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: PORTFOLIO & DIPLOMAS WALL */}
      {/* ========================================================================= */}
      {activeSubTab === "portfolio" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 border border-[#111113] shadow-[2px_2px_0px_#111113]">
            <div>
              <h2 className="font-display font-bold text-base text-[#111113] uppercase tracking-tight">
                Стена наград и зал славы участника
              </h2>
              <p className="text-xs text-[#666]">
                Коллекция заработанных бейджей, дипломов и подтвержденных достижений в хакатонах Fix-Ed.
              </p>
            </div>

            <button
              onClick={handleCopyPortfolio}
              className="px-3.5 py-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111113]"
            >
              {copiedPortfolio ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPortfolio ? "Скопировано!" : "Скопировать резюме"}</span>
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 bg-white border border-[#111113] shadow-[3px_3px_0px_#111113] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-xs text-[#111113] uppercase">Гран-При Победитель</h4>
                  <p className="text-[10px] text-[#666]">Вайбатон №1: Telegram AI Mini Apps</p>
                </div>
              </div>
              <p className="text-xs text-[#444]">
                Высшая награда за создание лучшего автономного агента первого сезона соревнований.
              </p>
              <div className="text-[10px] text-[#2563EB] font-bold uppercase pt-1">
                [GOLD_STATUS: VERIFIED]
              </div>
            </div>

            <div className="p-4 bg-white border border-[#111113] shadow-[3px_3px_0px_#111113] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-xs text-[#111113] uppercase">Лучший Live-Vibe</h4>
                  <p className="text-[10px] text-[#666]">Вайбатон №1 & №2</p>
                </div>
              </div>
              <p className="text-xs text-[#444]">
                За регулярную публикацию прозрачных Devlog-обновлений и высокую активность в чате.
              </p>
              <div className="text-[10px] text-[#2563EB] font-bold uppercase pt-1">
                [COMMUNITY_BADGE]
              </div>
            </div>

            <div className="p-4 bg-white border border-[#111113] shadow-[3px_3px_0px_#111113] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <div>
                  <h4 className="font-bold text-xs text-[#111113] uppercase">AI Pioneer</h4>
                  <p className="text-[10px] text-[#666]">Gemini 3.7 Core Integration</p>
                </div>
              </div>
              <p className="text-xs text-[#444]">
                За интеграцию AI-хоста, потоковой генерации и контекстных голосовых сводок.
              </p>
              <div className="text-[10px] text-[#2563EB] font-bold uppercase pt-1">
                [GENAI_MASTER]
              </div>
            </div>
          </div>

          {/* Interactive Certificate Preview List */}
          <div className="border border-[#111113] bg-[#FFFFFF] p-5 shadow-[3px_3px_0px_#111113] space-y-4">
            <h3 className="font-display font-bold text-sm text-[#111113] uppercase tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" />
              <span>Доступные сертификаты для предпросмотра:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userPastHackathons.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedCertificate(h)}
                  className="p-4 bg-[#F8F7F4] border border-[#111113] hover:bg-[#EAE8E2] cursor-pointer transition-all flex items-center justify-between shadow-[1px_1px_0px_#111113]"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-[#111113] uppercase font-mono">
                        {h.eventTitle}
                      </div>
                      <div className="text-[10px] text-[#666] font-mono">
                        {h.placement} // {h.projectTitle}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#777]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CERTIFICATE MODAL PREVIEW */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#F8F7F4] border-2 border-[#111113] shadow-[8px_8px_0px_#111113] max-w-2xl w-full p-6 sm:p-8 space-y-6 relative overflow-hidden font-mono"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 p-1 hover:bg-[#E5E5E0] text-[#111113]"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Canvas */}
              <div className="border-4 border-double border-[#111113] p-6 sm:p-8 bg-white text-center space-y-4 relative">
                {/* Seal background watermark */}
                <div className="text-[10px] tracking-widest text-[#999] uppercase font-bold">
                  ★ FIX-ED COMPETITION OS OFFICIAL CREDENTIAL ★
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#111113] uppercase tracking-tight">
                  ДИПЛОМ УЧАСТНИКА
                </h2>

                <div className="text-xs text-[#666] uppercase">
                  Настоящим подтверждается, что
                </div>

                <div className="font-display font-black text-xl sm:text-2xl text-[#2563EB] uppercase tracking-tight py-1 border-b-2 border-[#111113] inline-block">
                  {currentUser?.name || "Иван Ковалев"}
                </div>

                <p className="text-xs text-[#333] max-w-lg mx-auto leading-relaxed">
                  принял(а) участие в соревновании <strong>«{selectedCertificate.eventTitle}»</strong> в составе команды <strong>«{selectedCertificate.teamName}»</strong> с проектом <strong>«{selectedCertificate.projectTitle}»</strong> и удостоен(а) награды:
                </p>

                <div className="py-2 px-4 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-sm sm:text-base uppercase inline-block">
                  {selectedCertificate.placement}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#111113]/20 text-[10px] text-left">
                  <div>
                    <div className="text-[#888] uppercase">Итоговый балл:</div>
                    <div className="font-bold text-[#111113]">{selectedCertificate.score} / {selectedCertificate.maxPossibleScore || 40} баллов</div>
                    <div className="text-[#888] uppercase mt-2">Дата выдачи:</div>
                    <div className="font-bold text-[#111113]">{selectedCertificate.dateRange}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#888] uppercase">Организатор:</div>
                    <div className="font-bold text-[#111113]">Fix-Ed Live Arena</div>
                    <div className="text-[#888] uppercase mt-2">ID Сертификата:</div>
                    <div className="font-mono text-[#2563EB] font-bold">FXD-{selectedCertificate.eventId.toUpperCase()}-001</div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="px-4 py-2 bg-[#111113] text-white hover:bg-[#2563EB] text-xs font-bold uppercase shadow-[2px_2px_0px_#2563EB]"
                >
                  Закрыть предпросмотр
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
