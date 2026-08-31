import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  FolderKanban, 
  Users, 
  ExternalLink, 
  Github, 
  Play, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Flame, 
  FileCode,
  Layers,
  X,
  Bot
} from "lucide-react";
import type { Project, ProjectStatus, Team } from "../types";
import { TeamMatchingView } from "./TeamMatchingView";

export const ProjectsTeamsSection: React.FC = () => {
  const { projects, teams, posts, currentUser, createTeam, joinTeam, upsertProject } = useHackathon();

  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'teams' | 'matching'>('projects');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

  // New Team Form State
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamLookingFor, setTeamLookingFor] = useState("Backend, AI Developer");

  // New Project Form State
  const [projTitle, setProjTitle] = useState("");
  const [projTagline, setProjTagline] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDemo, setProjDemo] = useState("");
  const [projRepo, setProjRepo] = useState("");
  const [projTags, setProjTags] = useState("React, Express, Gemini");

  const filteredProjects = projects.filter(p => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    await createTeam({
      name: teamName,
      tag: teamTag.trim() || teamName.slice(0, 4).toUpperCase(),
      description: teamDesc,
      lookingForRoles: teamLookingFor.split(",").map(s => s.trim()).filter(Boolean)
    });
    setTeamName("");
    setTeamTag("");
    setTeamDesc("");
    setShowCreateTeamModal(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    await upsertProject({
      title: projTitle,
      tagline: projTagline,
      description: projDesc,
      demoUrl: projDemo,
      repoUrl: projRepo,
      tags: projTags.split(",").map(s => s.trim()).filter(Boolean),
      status: "BUILDING"
    });
    setProjTitle("");
    setProjTagline("");
    setProjDesc("");
    setProjDemo("");
    setProjRepo("");
    setShowCreateProjectModal(false);
  };

  const getStatusBadge = (st: ProjectStatus) => {
    switch (st) {
      case "MVP":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">🚀 MVP</span>;
      case "DEMO":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🎬 DEMO</span>;
      case "SUBMITTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00] text-black">🏁 SUBMITTED</span>;
      case "BUILDING":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#BAFF00] border border-[#333]">⚡ BUILDING</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#151515] text-[#888] border border-[#262626]">💡 IDEA</span>;
    }
  };

  return (
    <div className="space-y-6 mb-8 font-mono">
      {/* Sub-Nav & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A0A0A] p-4 sm:p-5 rounded-3xl border border-[#333]">
        <div className="flex items-center gap-2 bg-[#111] p-1.5 rounded-2xl border border-[#262626]">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'projects'
                ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                : "text-[#888] hover:text-white"
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Проекты ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'teams'
                ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Команды ({teams.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('matching')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
              activeSubTab === 'matching'
                ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                : "text-[#888] hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Матчмейкинг</span>
          </button>
        </div>

        {/* Action & Filter Strip */}
        <div className="flex flex-wrap items-center gap-3">
          {activeSubTab === 'projects' && (
            <div className="flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-[#262626] text-xs">
              {['ALL', 'MVP', 'DEMO', 'BUILDING', 'SUBMITTED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition-colors uppercase ${
                    statusFilter === f ? "bg-[#BAFF00] text-black font-bold" : "text-[#888] hover:text-white"
                  }`}
                >
                  {f === 'ALL' ? 'Все' : f}
                </button>
              ))}
            </div>
          )}

          {activeSubTab === 'projects' && (
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#333] hover:border-[#BAFF00] text-xs font-bold font-mono uppercase text-white flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-[#BAFF00]" />
              <span>Создать проект</span>
            </button>
          )}
          {activeSubTab === 'teams' && (
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black text-xs font-bold font-mono uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Создать команду</span>
            </button>
          )}
        </div>
      </div>

      {/* Matching Sub-View */}
      {activeSubTab === 'matching' && (
        <TeamMatchingView />
      )}

      {/* Projects Grid */}
      {activeSubTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const projPosts = posts.filter(p => p.projectId === proj.id);
            return (
              <div
                key={proj.id}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#BAFF00]/50 rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getStatusBadge(proj.status)}
                    <span className="text-[10px] font-mono text-[#666]">
                      {new Date(proj.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#BAFF00] transition-colors font-mono uppercase">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-[#AAA] font-mono mt-1 line-clamp-2">
                    {proj.tagline || proj.description}
                  </p>

                  {/* Team / Author tag */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#888] font-mono">
                    <span className="text-[#666]">Автор:</span>
                    <span className="text-white font-semibold">{proj.teamName || proj.authorName}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {proj.tags.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151515] text-[#AAA] border border-[#262626]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222] flex items-center justify-between gap-2">
                  <div className="text-[11px] font-mono text-[#888]">
                    {projPosts.length} записей Devlog
                  </div>

                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="px-3 py-1.5 rounded-xl bg-[#111] hover:bg-[#181818] hover:text-[#BAFF00] border border-[#333] text-xs font-bold font-mono transition-colors"
                  >
                    Подробнее →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teams Grid */}
      {activeSubTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const isMember = team.members.some(m => m.userId === currentUser?.id);

            return (
              <div
                key={team.id}
                className="bg-[#0A0A0A] border border-[#262626] hover:border-[#444] rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-black font-mono"
                        style={{ backgroundColor: team.avatarColor || '#BAFF00' }}
                      >
                        {team.tag || team.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white font-mono uppercase">{team.name}</h4>
                        <span className="text-[10px] font-mono text-[#888]">{team.members.length}/4 участников</span>
                      </div>
                    </div>

                    {team.isOpen ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#BAFF00]/10 text-[#BAFF00] border border-[#BAFF00]/30">
                        ОТКРЫТА
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151515] text-[#666] border border-[#262626]">
                        ЗАКРЫТА
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#AAA] mt-2 leading-relaxed font-mono">
                    {team.description}
                  </p>

                  {/* Members List */}
                  <div className="mt-4 space-y-1.5 font-mono">
                    <div className="text-[10px] text-[#666] uppercase">Состав:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {team.members.map((m) => (
                        <div key={m.userId} className="flex items-center gap-1.5 bg-[#111] px-2 py-1 rounded-lg border border-[#262626] text-xs text-[#DDD]">
                          <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full border border-[#333]" />
                          <span>{m.name}</span>
                          <span className="text-[9px] text-[#777]">({m.roleInTeam})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Looking For */}
                  {team.lookingForRoles.length > 0 && (
                    <div className="mt-3 font-mono">
                      <div className="text-[10px] text-[#BAFF00] uppercase">Ищут в команду:</div>
                      <div className="text-xs text-[#BBB] mt-0.5">
                        {team.lookingForRoles.join(", ")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#222] flex items-center justify-between font-mono">
                  <div className="text-xs text-[#666]">
                    {team.activityCount} событий
                  </div>

                  {!isMember && team.isOpen && team.members.length < 4 ? (
                    <button
                      onClick={() => joinTeam(team.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black text-xs font-bold uppercase transition-all"
                    >
                      Вступить
                    </button>
                  ) : isMember ? (
                    <span className="text-xs text-[#BAFF00] font-semibold">Ваша команда ✓</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col font-mono">
            <div className="p-6 border-b border-[#262626] flex items-start justify-between bg-[#111]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedProject.status)}
                  <span className="text-xs text-[#888] font-mono">
                    Автор: {selectedProject.teamName || selectedProject.authorName}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase">{selectedProject.title}</h3>
                <p className="text-xs sm:text-sm text-[#AAA] mt-1">{selectedProject.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 rounded-xl bg-[#151515] hover:bg-[#222] text-[#888] hover:text-white border border-[#333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Links Bar */}
              <div className="flex flex-wrap items-center gap-3">
                {selectedProject.demoUrl && (
                  <a
                    href={selectedProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#BAFF00] text-black font-bold text-xs font-mono uppercase flex items-center gap-2 shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Открыть Live Demo</span>
                  </a>
                )}
                {selectedProject.repoUrl && (
                  <a
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#151515] hover:bg-[#202020] text-white border border-[#333] font-bold text-xs font-mono uppercase flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub Репозиторий</span>
                  </a>
                )}
              </div>

              <div>
                <h4 className="text-xs font-mono text-[#888] uppercase tracking-wider mb-2">ОПИСАНИЕ РЕШЕНИЯ</h4>
                <p className="text-xs sm:text-sm text-[#DDD] leading-relaxed whitespace-pre-line bg-[#111] p-4 rounded-2xl border border-[#262626]">
                  {selectedProject.description}
                </p>
              </div>

              {selectedProject.instructions && (
                <div>
                  <h4 className="text-xs font-mono text-[#888] uppercase tracking-wider mb-2">ИНСТРУКЦИЯ ЗАПУСКА</h4>
                  <pre className="text-xs font-mono text-[#AAA] bg-black p-4 rounded-2xl border border-[#262626] overflow-x-auto whitespace-pre-line">
                    {selectedProject.instructions}
                  </pre>
                </div>
              )}

              {/* Devlog Timeline for this Project */}
              <div>
                <h4 className="text-xs font-mono text-[#BAFF00] uppercase tracking-wider mb-3">
                  ИСТОРИЯ СОЗДАНИЯ (DEVLOG ХРОНИКА)
                </h4>
                <div className="space-y-3">
                  {posts.filter(p => p.projectId === selectedProject.id).length === 0 ? (
                    <div className="text-xs text-[#666] italic">Пока нет записей Devlog для этого проекта</div>
                  ) : (
                    posts.filter(p => p.projectId === selectedProject.id).map((post) => (
                      <div key={post.id} className="p-3.5 rounded-2xl bg-[#111] border border-[#262626] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white font-mono">{post.milestone || "Обновление"}</span>
                          <span className="text-[#666] text-[10px] font-mono">
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#BBB] leading-relaxed">{post.polishedContent || post.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-lg shadow-2xl p-6 font-mono">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Создать команду</h3>
              <button onClick={() => setShowCreateTeamModal(false)} className="text-[#888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Название команды</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Например: CyberVibe, Team Pulse"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Тег команды (3-5 символов)</label>
                <input
                  type="text"
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value)}
                  placeholder="VIBE"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Краткое описание / Цель</label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Создаем лучший дашборд для хакатонов..."
                  className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#BAFF00] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Кого ищете в команду?</label>
                <input
                  type="text"
                  value={teamLookingFor}
                  onChange={(e) => setTeamLookingFor(e.target.value)}
                  placeholder="Backend, AI Specialist, Designer"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#888] hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-lg shadow-2xl p-6 font-mono">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Новый проект</h3>
              <button onClick={() => setShowCreateProjectModal(false)} className="text-[#888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Название проекта</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="PulseOS Live Hackathon"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Краткий слоган (Tagline)</label>
                <input
                  type="text"
                  value={projTagline}
                  onChange={(e) => setProjTagline(e.target.value)}
                  placeholder="Операционная система для живых соревнований"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Подробное описание</label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Что решает проект, какие технологии используются..."
                  className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#BAFF00] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#888] uppercase block mb-1">Demo URL (если есть)</label>
                  <input
                    type="url"
                    value={projDemo}
                    onChange={(e) => setProjDemo(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#888] uppercase block mb-1">GitHub Repo</label>
                  <input
                    type="url"
                    value={projRepo}
                    onChange={(e) => setProjRepo(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Теги / Стек (через запятую)</label>
                <input
                  type="text"
                  value={projTags}
                  onChange={(e) => setProjTags(e.target.value)}
                  placeholder="React, TypeScript, Express, AI"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#888] hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(186,255,0,0.3)]"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
