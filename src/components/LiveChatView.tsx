import React, { useState, useMemo, useRef, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Send,
  Pin,
  Radio,
  Hash,
  Lock,
  Users,
  Code,
  Paperclip,
  Sparkles,
  Smile,
  Reply,
  X,
  Check,
  ExternalLink,
  Copy,
  ChevronRight,
  Plus,
  Search,
  Bot,
  Zap,
  Shield,
  MessageSquare,
  Globe,
  Terminal,
  Layers,
  Crown
} from "lucide-react";
import { sound } from "../utils/audio";
import type { ChatMessage, Team } from "../types";

const EMOJI_LIST = ["🔥", "🚀", "💯", "⚡", "💡", "🙌", "❤️", "👀"];
const CODE_LANGUAGES = ["typescript", "javascript", "python", "rust", "go", "sql", "bash", "json"];

export const LiveChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    reactToChatMessage,
    togglePinChatMessage,
    currentUser,
    currentRole,
    teams,
    projects,
    askAIHost
  } = useHackathon();

  // Channel State
  const [activeChannelId, setActiveChannelId] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Message Input State
  const [inputText, setInputText] = useState("");
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [codeContent, setCodeContent] = useState("");

  const [isAttachmentDrawerOpen, setIsAttachmentDrawerOpen] = useState(false);
  const [attachmentTitle, setAttachmentTitle] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<"github" | "figma" | "demo" | "file">("github");

  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string; content: string } | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiResponseStatus, setAiResponseStatus] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find user's current team
  const userTeam: Team | undefined = useMemo(() => {
    if (!currentUser?.teamId) return undefined;
    return teams.find(t => t.id === currentUser.teamId);
  }, [currentUser, teams]);

  // Associated project of current active team channel
  const activeTeam: Team | undefined = useMemo(() => {
    if (!activeChannelId.startsWith("team_")) return undefined;
    const teamId = activeChannelId.replace("team_", "");
    return teams.find(t => t.id === teamId);
  }, [activeChannelId, teams]);

  const activeProject = useMemo(() => {
    if (!activeTeam) return undefined;
    return projects.find(p => p.teamId === activeTeam.id || p.id === activeTeam.projectId);
  }, [activeTeam, projects]);

  // Available Channels Definition
  const publicChannels = useMemo(() => [
    {
      id: "general",
      name: "general",
      title: "Арена-Чат",
      desc: "Общий чат хакатона, знакомства и обсуждения",
      icon: Hash,
      badge: "LIVE"
    },
    {
      id: "announcements",
      name: "announcements",
      title: "Анонсы Оргкомитета",
      desc: "Официальные дедлайны, чеклисты и правила",
      icon: Radio,
      badge: "OFFICIAL"
    },
    {
      id: "mentors",
      name: "mentors-qna",
      title: "Вопросы Менторам & Жюри",
      desc: "Прямая связь с экспертами и техническая помощь",
      icon: Sparkles,
      badge: "HELP"
    }
  ], []);

  // Team Private Channels
  const isPrivilegedUser = currentUser?.role === "organizer" || currentUser?.role === "admin" || currentUser?.role === "judge";

  const teamChannels = useMemo(() => {
    if (isPrivilegedUser) {
      return teams.map(t => ({
        id: `team_${t.id}`,
        name: t.tag.toLowerCase(),
        title: t.name,
        desc: `Приватный канал команды ${t.name}`,
        isMyTeam: t.id === currentUser?.teamId,
        team: t
      }));
    } else if (userTeam) {
      return [{
        id: `team_${userTeam.id}`,
        name: userTeam.tag.toLowerCase(),
        title: userTeam.name,
        desc: `Приватный штаб команды ${userTeam.name}`,
        isMyTeam: true,
        team: userTeam
      }];
    }
    return [];
  }, [teams, userTeam, isPrivilegedUser, currentUser]);

  // Filter messages for the current active channel
  const channelMessages = useMemo(() => {
    return chatMessages.filter(msg => {
      // Legacy messages without channelId default to 'general'
      const channel = msg.channelId || "general";
      if (channel !== activeChannelId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          msg.content.toLowerCase().includes(q) ||
          msg.authorName.toLowerCase().includes(q) ||
          msg.codeSnippet?.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [chatMessages, activeChannelId, searchQuery]);

  const pinnedMessages = useMemo(() => {
    return channelMessages.filter(m => m.isPinned);
  }, [channelMessages]);

  // Unread / message counts per channel
  const messageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chatMessages.forEach(m => {
      const ch = m.channelId || "general";
      counts[ch] = (counts[ch] || 0) + 1;
    });
    return counts;
  }, [chatMessages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length, activeChannelId]);

  // Send Message Handler
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !codeContent.trim() && !attachmentUrl.trim()) return;

    const isTeamChannel = activeChannelId.startsWith("team_");
    const teamId = isTeamChannel ? activeChannelId.replace("team_", "") : undefined;

    await sendChatMessage(inputText.trim(), {
      channelId: activeChannelId,
      teamId,
      isPrivate: isTeamChannel,
      codeSnippet: codeContent.trim() ? { language: codeLanguage, code: codeContent } : undefined,
      attachmentUrl: attachmentUrl.trim() || undefined,
      attachmentTitle: attachmentTitle.trim() || undefined,
      attachmentType: attachmentUrl.trim() ? attachmentType : undefined,
      replyTo: replyTo || undefined
    });

    setInputText("");
    setCodeContent("");
    setIsCodeDrawerOpen(false);
    setAttachmentUrl("");
    setAttachmentTitle("");
    setIsAttachmentDrawerOpen(false);
    setReplyTo(null);
    inputRef.current?.focus();
  };

  // Quick @mention in input
  const handleMentionUser = (name: string) => {
    setInputText(prev => `${prev} @${name} `);
    inputRef.current?.focus();
  };

  // Copy code snippet
  const handleCopyCode = (snippetId: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedSnippetId(snippetId);
    sound.playPulse();
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Ask AI Team Assistant directly in channel
  const handleAskAITeamCoPilot = async () => {
    if (!currentUser) return;
    setIsAskingAi(true);
    setAiResponseStatus("Генерация совета для команды...");
    sound.playBroadcastChime();

    try {
      const prompt = `Дай краткий (3-4 предложения), максимально точный и прикладной совет для команды "${activeTeam?.name || 'Pulse'}" (хакатон-проект "${activeProject?.title || 'Проект'}", стек: ${activeProject?.tags?.join(', ') || 'React, TS'}) по теме: ${inputText || 'быстрый чеклист перед дедлайном и синхронизация задач'}.`;
      const aiReply = await askAIHost(prompt, "team_mentor");

      // Send as AI bot message to team channel
      await sendChatMessage(aiReply, {
        channelId: activeChannelId,
        teamId: activeTeam?.id,
        isPrivate: true,
        attachmentTitle: "✨ Совет AI-ментора для команды",
        attachmentType: "file"
      });

      setInputText("");
      setAiResponseStatus(null);
    } catch {
      setAiResponseStatus("Не удалось получить ответ AI");
      setTimeout(() => setAiResponseStatus(null), 3000);
    } finally {
      setIsAskingAi(false);
    }
  };

  const getRoleBadge = (role?: string, authorId?: string) => {
    if (activeTeam && activeTeam.captainId === authorId) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40 flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5" /> CAPTAIN
        </span>
      );
    }
    switch (role) {
      case "organizer":
      case "admin":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">ORG</span>;
      case "judge":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#222] text-[#BAFF00] border border-[#444]">JUDGE</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#151515] text-[#888] border border-[#333]">DEV</span>;
    }
  };

  const isCurrentChannelPrivate = activeChannelId.startsWith("team_");

  return (
    <div className="bg-[#0A0A0A] border border-[#2B2B2F] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[780px] mb-8 font-mono relative">
      
      {/* Top Banner & Multi-Channel Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#222] bg-[#111] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#18181B] text-[#BAFF00] border border-[#333] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(186,255,0,0.15)]">
            {isCurrentChannelPrivate ? (
              <Lock className="w-5 h-5 text-[#BAFF00]" />
            ) : (
              <Radio className="w-5 h-5 animate-pulse text-[#BAFF00]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                {isCurrentChannelPrivate ? (
                  <>
                    <span className="text-[#BAFF00]">🔒 #{activeTeam?.tag.toLowerCase() || 'team'}</span>
                    <span className="text-white">({activeTeam?.name || 'Приватный штаб'})</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#BAFF00]">#{publicChannels.find(c => c.id === activeChannelId)?.name || 'general'}</span>
                    <span className="text-white">— {publicChannels.find(c => c.id === activeChannelId)?.title || 'Live Чат'}</span>
                  </>
                )}
              </h3>
              {isCurrentChannelPrivate && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#BAFF00]/15 text-[#BAFF00] border border-[#BAFF00]/30 uppercase tracking-widest">
                  {userTeam?.id === activeTeam?.id ? "ШТАБ МОЕЙ КОМАНДЫ" : "SUPERVISOR VIEW"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#888] font-mono hidden sm:block">
              {isCurrentChannelPrivate
                ? `Защищенный командный канал сквозного взаимодействия // Участников: ${activeTeam?.members?.length || 1}`
                : publicChannels.find(c => c.id === activeChannelId)?.desc}
            </p>
          </div>
        </div>

        {/* Search & Channel Switcher on Mobile */}
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по сообщениям..."
              className="bg-[#151515] border border-[#2B2B2F] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] w-48 lg:w-56 font-mono"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777] hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
            className="md:hidden px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#333] text-xs text-[#BAFF00] font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Каналы ({Object.keys(messageCounts).length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar Channels + Message Feed + Team Cockpit) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 1. CHANNELS SIDEBAR */}
        <div
          className={`w-64 lg:w-72 bg-[#0D0D0E] border-r border-[#222] flex flex-col shrink-0 transition-all duration-200 z-20 ${
            sidebarOpenMobile
              ? "absolute inset-y-0 left-0 shadow-2xl bg-[#0D0D0E]"
              : "hidden md:flex"
          }`}
        >
          <div className="p-3 border-b border-[#1E1E22] flex items-center justify-between text-xs text-[#777]">
            <span className="font-bold tracking-wider text-[11px] text-[#888] uppercase flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#BAFF00]" />
              КАНАЛЫ СООБЩЕСТВА
            </span>
            <button
              onClick={() => setSidebarOpenMobile(false)}
              className="md:hidden text-[#888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* Public Channels List */}
            <div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#555] uppercase tracking-wider">
                ОБЩИЕ КАНАЛЫ (PUBLIC)
              </div>
              <div className="space-y-1 mt-1">
                {publicChannels.map(ch => {
                  const Icon = ch.icon;
                  const isActive = activeChannelId === ch.id;
                  const count = messageCounts[ch.id] || 0;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setSidebarOpenMobile(false);
                        sound.playPulse();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-all group ${
                        isActive
                          ? "bg-[#BAFF00]/15 text-[#BAFF00] font-bold border border-[#BAFF00]/30 shadow-[0_0_10px_rgba(186,255,0,0.1)]"
                          : "text-[#AAA] hover:bg-[#151517] hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#BAFF00]" : "text-[#666] group-hover:text-white"}`} />
                        <span className="truncate">#{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {ch.badge && (
                          <span className={`text-[8px] font-bold px-1 rounded ${
                            isActive ? "bg-[#BAFF00] text-black" : "bg-[#222] text-[#777]"
                          }`}>
                            {ch.badge}
                          </span>
                        )}
                        {count > 0 && (
                          <span className="text-[10px] text-[#666] font-mono">
                            {count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team Specific Private Channels List */}
            <div>
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#555] uppercase tracking-wider flex items-center justify-between">
                <span>ПРИВАТНЫЕ КОМАНДЫ (ROOMS)</span>
                <Lock className="w-2.5 h-2.5 text-[#BAFF00]" />
              </div>

              <div className="space-y-1 mt-1">
                {teamChannels.length > 0 ? (
                  teamChannels.map(tc => {
                    const isActive = activeChannelId === tc.id;
                    const count = messageCounts[tc.id] || 0;
                    return (
                      <button
                        key={tc.id}
                        onClick={() => {
                          setActiveChannelId(tc.id);
                          setSidebarOpenMobile(false);
                          sound.playPulse();
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all group ${
                          isActive
                            ? "bg-[#BAFF00] text-black font-bold shadow-[0_0_15px_rgba(186,255,0,0.25)]"
                            : tc.isMyTeam
                            ? "bg-[#14180c] border border-[#BAFF00]/30 text-[#BAFF00] hover:bg-[#1a2110]"
                            : "text-[#AAA] hover:bg-[#151517] hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-black" : tc.isMyTeam ? "text-[#BAFF00]" : "text-[#777]"}`} />
                          <div className="truncate">
                            <div className="truncate leading-tight">#{tc.name}</div>
                            <div className={`text-[9px] truncate ${isActive ? "text-black/70 font-normal" : "text-[#666]"}`}>
                              {tc.title}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {tc.isMyTeam && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive ? "bg-black text-[#BAFF00]" : "bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40"
                            }`}>
                              МОЯ
                            </span>
                          )}
                          {count > 0 && (
                            <span className={`text-[10px] font-mono ${isActive ? "text-black/80 font-bold" : "text-[#666]"}`}>
                              {count}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 bg-[#131316] border border-[#222] rounded-2xl text-center space-y-2 my-2">
                    <p className="text-[11px] text-[#777] leading-relaxed">
                      У вас пока нет активной команды для открытия защищенного канала.
                    </p>
                    <div className="text-[10px] text-[#BAFF00] font-bold">
                      Вступите в команду во вкладке «Проекты»
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Context Card */}
            {userTeam && (
              <div className="p-3 bg-[#121214] border border-[#26262B] rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#888]">
                  <span>МОЙ СТАТУС:</span>
                  <span className="text-[#BAFF00] font-bold">В КОМАНДЕ</span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {userTeam.name} [{userTeam.tag}]
                </div>
                <div className="text-[10px] text-[#666] flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#888]" />
                  <span>{userTeam.members.length} участников онлайн</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. MAIN CHAT ARENA */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
          
          {/* TEAM ROOM TOP COCKPIT BAR (Shown only in team-specific private channels) */}
          {isCurrentChannelPrivate && activeTeam && (
            <div className="bg-[#11140c] border-b border-[#2a3814] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-[#BAFF00] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>ШТАБ КОМАНДЫ: {activeTeam.name}</span>
                </div>
                
                {/* Team Roster with click to @mention */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#777]">СОСТАВ:</span>
                  {activeTeam.members.map(m => (
                    <button
                      key={m.userId}
                      onClick={() => handleMentionUser(m.name)}
                      className="px-2 py-0.5 rounded-lg bg-[#181e0f] hover:bg-[#253314] text-[#BAFF00] text-[10px] font-mono border border-[#BAFF00]/30 flex items-center gap-1 transition-colors"
                      title="Кликните, чтобы тегнуть сокомандника"
                    >
                      {m.isCaptain && <Crown className="w-2.5 h-2.5 text-[#BAFF00]" />}
                      <span>{m.name}</span>
                      <span className="text-[#777]">({m.roleInTeam})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Shortcuts */}
              <div className="flex items-center gap-2">
                {activeProject?.repoUrl && (
                  <a
                    href={activeProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded bg-[#18181B] hover:bg-[#222] text-[#DDD] text-[10px] flex items-center gap-1 border border-[#333]"
                  >
                    <Code className="w-3 h-3 text-[#BAFF00]" />
                    <span>Repo</span>
                  </a>
                )}
                {activeProject?.demoUrl && (
                  <a
                    href={activeProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded bg-[#18181B] hover:bg-[#222] text-[#DDD] text-[10px] flex items-center gap-1 border border-[#333]"
                  >
                    <ExternalLink className="w-3 h-3 text-[#BAFF00]" />
                    <span>Demo</span>
                  </a>
                )}
                <button
                  onClick={handleAskAITeamCoPilot}
                  disabled={isAskingAi}
                  className="px-2.5 py-1 rounded-lg bg-[#BAFF00] hover:bg-[#cbf731] text-black font-bold text-[10px] flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Запросить AI-консультацию для команды прямо в этот чат"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isAskingAi ? "Генерация..." : "AI Ментор"}</span>
                </button>
              </div>
            </div>
          )}

          {/* PINNED MESSAGES BANNER */}
          {pinnedMessages.length > 0 && (
            <div className="bg-[#141416] border-b border-[#222] p-3 space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#BAFF00] uppercase font-bold tracking-wider">
                <Pin className="w-3 h-3" />
                <span>ЗАКРЕПЛЕННЫЕ СООБЩЕНИЯ В #{activeChannelId}:</span>
              </div>
              {pinnedMessages.map((pin) => (
                <div key={pin.id} className="text-xs text-[#DDD] flex items-center justify-between gap-2 bg-[#0D0D0E] p-2 rounded-xl border border-[#2B2B2F]">
                  <span className="truncate"><strong>{pin.authorName}:</strong> {pin.content}</span>
                  {(currentUser?.role === 'organizer' || currentUser?.role === 'admin' || activeTeam?.captainId === currentUser?.id) && (
                    <button onClick={() => togglePinChatMessage(pin.id)} className="text-[10px] text-[#888] hover:text-[#BAFF00] uppercase font-mono shrink-0">
                      Открепить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* MESSAGE FEED */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-mono">
            {channelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-3xl bg-[#141416] border border-[#2B2B2F] flex items-center justify-center text-[#BAFF00]">
                  {isCurrentChannelPrivate ? <Lock className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
                </div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">
                  {isCurrentChannelPrivate ? `Штаб команды ${activeTeam?.name}` : `Канал #${activeChannelId}`}
                </div>
                <p className="text-xs text-[#777] max-w-md">
                  {isCurrentChannelPrivate
                    ? "Здесь команда может безопасно обсуждать архитектуру, делиться сниппетами кода, распределять задачи и готовиться к защите."
                    : "Сообщений пока нет. Будьте первыми, кто начнет обсуждение в этом канале!"}
                </p>
                {isCurrentChannelPrivate && (
                  <button
                    onClick={handleAskAITeamCoPilot}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#222] border border-[#BAFF00]/40 text-[#BAFF00] text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Сгенерировать стартовый чеклист для команды</span>
                  </button>
                )}
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMe = currentUser?.id === msg.authorId;
                const isCaptain = activeTeam?.captainId === msg.authorId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {/* User Avatar */}
                    {msg.authorAvatar ? (
                      <img
                        src={msg.authorAvatar}
                        alt={msg.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-[#333]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#18181B] text-[#BAFF00] border border-[#333] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {msg.authorName[0]}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                        isMe
                          ? "bg-[#161B0E] border border-[#BAFF00]/40 text-[#FFF] shadow-[0_0_15px_rgba(186,255,0,0.1)]"
                          : "bg-[#111113] border border-[#26262B] text-[#DDD]"
                      }`}
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={isMe ? "text-[#BAFF00]" : "text-white"}>{msg.authorName}</span>
                          {getRoleBadge(msg.authorRole, msg.authorId)}
                          {isCaptain && (
                            <span className="text-[9px] text-[#BAFF00] font-mono flex items-center gap-0.5">
                              [CAPTAIN]
                            </span>
                          )}
                        </div>
                        <span className="text-[#666]">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Reply-To Preview (if any) */}
                      {msg.replyTo && (
                        <div className="bg-[#0A0A0B] border-l-2 border-[#BAFF00] p-2 rounded-r-lg text-[10px] text-[#888] space-y-0.5">
                          <div className="font-bold text-[#AAA] flex items-center gap-1">
                            <Reply className="w-2.5 h-2.5" />
                            <span>В ответ на {msg.replyTo.authorName}:</span>
                          </div>
                          <div className="truncate italic">{msg.replyTo.content}</div>
                        </div>
                      )}

                      {/* Text Content */}
                      {msg.content && (
                        <div className="whitespace-pre-line text-xs font-normal text-[#E2E2E2]">
                          {msg.content}
                        </div>
                      )}

                      {/* Code Snippet Attachment */}
                      {msg.codeSnippet && (
                        <div className="bg-[#080809] border border-[#2B2B2F] rounded-xl overflow-hidden font-mono text-[11px] mt-2">
                          <div className="bg-[#141416] px-3 py-1.5 border-b border-[#222] flex items-center justify-between text-[10px] text-[#888]">
                            <span className="flex items-center gap-1.5 text-[#BAFF00] font-bold">
                              <Terminal className="w-3 h-3" />
                              <span>{msg.codeSnippet.language.toUpperCase()}</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(msg.id, msg.codeSnippet!.code)}
                              className="text-[#888] hover:text-[#BAFF00] flex items-center gap-1 transition-colors"
                            >
                              {copiedSnippetId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-[#BAFF00]" />
                                  <span className="text-[#BAFF00]">Скопировано</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Копировать</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 overflow-x-auto text-[#CE9178] leading-tight font-mono text-[11px]">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}

                      {/* Resource Attachment */}
                      {msg.attachmentUrl && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block p-2.5 rounded-xl bg-[#151518] hover:bg-[#1C1C20] border border-[#333] transition-all group/link"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-3.5 h-3.5 text-[#BAFF00] shrink-0" />
                              <span className="text-xs font-bold text-white truncate group-hover/link:text-[#BAFF00]">
                                {msg.attachmentTitle || msg.attachmentUrl}
                              </span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-[#777] group-hover/link:text-white shrink-0" />
                          </div>
                          <span className="text-[10px] text-[#666] truncate block mt-0.5 font-mono">
                            {msg.attachmentUrl}
                          </span>
                        </a>
                      )}

                      {/* Reactions & Interaction Bar */}
                      <div className="flex items-center justify-between pt-1 gap-2 border-t border-[#1F1F24]/50">
                        {/* Reaction Badges */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {msg.reactions && Object.entries(msg.reactions).map(([emoji, rawIds]) => {
                            const userIds = Array.isArray(rawIds) ? (rawIds as string[]) : [];
                            if (userIds.length === 0) return null;
                            const hasReacted = !!currentUser && userIds.includes(currentUser.id);
                            return (
                              <button
                                key={emoji}
                                onClick={() => reactToChatMessage(msg.id, emoji)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono flex items-center gap-1 border transition-all ${
                                  hasReacted
                                    ? "bg-[#BAFF00]/20 border-[#BAFF00]/60 text-[#BAFF00] font-bold"
                                    : "bg-[#18181A] border-[#2E2E33] text-[#AAA] hover:border-[#555]"
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{userIds.length}</span>
                              </button>
                            );
                          })}

                          {/* Quick Emoji Reaction Pill */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-[#18181B] border border-[#333] rounded-full px-1 py-0.5">
                            {EMOJI_LIST.slice(0, 4).map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => reactToChatMessage(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-[11px] px-0.5"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions (Reply, Pin) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] text-[#888]">
                          <button
                            onClick={() => {
                              setReplyTo({ id: msg.id, authorName: msg.authorName, content: msg.content || "Код/вложение" });
                              inputRef.current?.focus();
                            }}
                            className="hover:text-[#BAFF00] flex items-center gap-1 transition-colors"
                          >
                            <Reply className="w-2.5 h-2.5" />
                            <span>Ответить</span>
                          </button>

                          {(currentUser?.role === 'organizer' || currentUser?.role === 'admin' || isCaptain) && (
                            <button
                              onClick={() => togglePinChatMessage(msg.id)}
                              className="hover:text-[#BAFF00] flex items-center gap-1 transition-colors"
                            >
                              <Pin className="w-2.5 h-2.5" />
                              <span>{msg.isPinned ? "Открепить" : "Закрепить"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. RICH MESSAGE COMPOSER */}
          <div className="border-t border-[#222] bg-[#0E0E10] p-3 sm:p-4 space-y-2">
            
            {/* Active Reply Banner */}
            {replyTo && (
              <div className="bg-[#141418] border border-[#2B2B2F] p-2 rounded-xl flex items-center justify-between text-xs font-mono text-[#AAA]">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-[#BAFF00] shrink-0" />
                  <span className="truncate">Ответ пользователю <strong>{replyTo.authorName}</strong>: {replyTo.content}</span>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-[#777] hover:text-white ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Code Snippet Drawer */}
            {isCodeDrawerOpen && (
              <div className="bg-[#121215] border border-[#333] rounded-2xl p-3 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <span className="text-[#BAFF00] font-bold flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>СНИППЕТ КОДА ДЛЯ КОМАНДЫ</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="bg-[#1B1B1E] border border-[#333] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                    >
                      {CODE_LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button onClick={() => setIsCodeDrawerOpen(false)} className="text-[#777] hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  placeholder="// Вставьте фрагмент кода или функцию..."
                  rows={4}
                  className="w-full bg-[#080809] border border-[#2A2A2E] rounded-xl p-2.5 text-xs text-[#BAFF00] font-mono focus:outline-none focus:border-[#BAFF00] resize-none"
                />
              </div>
            )}

            {/* Attachment Drawer */}
            {isAttachmentDrawerOpen && (
              <div className="bg-[#121215] border border-[#333] rounded-2xl p-3 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-[#888]">
                  <span className="text-[#BAFF00] font-bold flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>ПРИКРЕПИТЬ ССЫЛКУ / РЕСУРС</span>
                  </span>
                  <button onClick={() => setIsAttachmentDrawerOpen(false)} className="text-[#777] hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={attachmentTitle}
                    onChange={(e) => setAttachmentTitle(e.target.value)}
                    placeholder="Название (например, Figma Макет или GitHub PR)"
                    className="bg-[#080809] border border-[#2A2A2E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                  />
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://github.com/... или https://figma.com/..."
                    className="bg-[#080809] border border-[#2A2A2E] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#BAFF00]"
                  />
                </div>
              </div>
            )}

            {/* Main Input Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              {/* Tool Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isCodeDrawerOpen || codeContent
                      ? "bg-[#BAFF00]/20 text-[#BAFF00] border-[#BAFF00]/50"
                      : "bg-[#161618] text-[#888] hover:text-white border-[#2E2E33]"
                  }`}
                  title="Прикрепить сниппет кода"
                >
                  <Code className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAttachmentDrawerOpen(!isAttachmentDrawerOpen)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isAttachmentDrawerOpen || attachmentUrl
                      ? "bg-[#BAFF00]/20 text-[#BAFF00] border-[#BAFF00]/50"
                      : "bg-[#161618] text-[#888] hover:text-white border-[#2E2E33]"
                  }`}
                  title="Прикрепить ссылку на репозиторий/макет"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {isCurrentChannelPrivate && (
                  <button
                    type="button"
                    onClick={handleAskAITeamCoPilot}
                    disabled={isAskingAi}
                    className="p-2.5 rounded-xl bg-[#161618] hover:bg-[#202024] text-[#BAFF00] border border-[#2E2E33] transition-all disabled:opacity-50"
                    title="Задать вопрос AI Ментору для команды"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isCurrentChannelPrivate
                    ? `Сообщение в приватный штаб #${activeTeam?.tag.toLowerCase() || 'team'}...`
                    : `Сообщение в #${activeChannelId}...`
                }
                className="flex-1 bg-[#151518] border border-[#2E2E33] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !codeContent.trim() && !attachmentUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-40 text-black font-bold font-mono uppercase text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(186,255,0,0.25)] transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Отправить</span>
              </button>
            </form>

            {/* Status notification */}
            {aiResponseStatus && (
              <div className="text-[10px] text-[#BAFF00] font-mono animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{aiResponseStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
