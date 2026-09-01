import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  Hackathon,
  CompetitionEvent,
  EventTemplateType,
  DuelState,
  SubmissionGateReport,
  FinalShowRecap,
  User,
  Team,
  Project,
  ProgressPost,
  Comment,
  EventItem,
  AIHostMessage,
  Submission,
  Judgement,
  ChatMessage,
  NotificationItem,
  LeaderboardItem,
  HackathonStage,
  Role,
  ThemeMode,
  TeamMatchSuggestion
} from "../types";
import { sound } from "../utils/audio";
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  showNativeBrowserNotification
} from "../utils/browserNotifications";

interface HackathonContextType {
  hackathon: Hackathon | null;
  eventsList: CompetitionEvent[];
  activeEventId: string;
  duels: Record<string, DuelState>;
  recaps: Record<string, FinalShowRecap>;
  activeDuel: DuelState | null;
  activeRecap: FinalShowRecap | null;
  users: User[];
  teams: Team[];
  projects: Project[];
  posts: ProgressPost[];
  comments: Comment[];
  events: EventItem[];
  aiMessages: AIHostMessage[];
  submissions: Submission[];
  judgements: Judgement[];
  chatMessages: ChatMessage[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  browserPermission: NotificationPermission;
  leaderboard: LeaderboardItem[];
  currentUser: User | null;
  currentRole: Role;
  isLoading: boolean;
  sseConnected: boolean;
  soundEnabled: boolean;
  theme: ThemeMode;
  toggleSound: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: Role) => void;
  switchActiveUser: (userId: string) => void;
  switchEvent: (eventId: string) => Promise<void>;
  createEvent: (data: any) => Promise<CompetitionEvent>;
  controlEvent: (eventId: string, stage: HackathonStage) => Promise<void>;
  sendDuelAction: (action: string, payload?: any) => Promise<void>;
  voteDuel: (participantId: string) => Promise<void>;
  validateSubmissionGate: (data: any) => Promise<SubmissionGateReport>;
  registerUser: (userData: Partial<User>) => Promise<User>;
  updateHackathon: (data: Partial<Hackathon>) => Promise<void>;
  createTeam: (teamData: { name: string; tag?: string; description?: string; lookingForRoles?: string[] }) => Promise<Team>;
  joinTeam: (teamId: string, roleInTeam?: string) => Promise<void>;
  upsertProject: (projectData: Partial<Project>) => Promise<Project>;
  createPost: (postData: { content: string; polishedContent?: string; mediaType?: any; mediaUrl?: string; status?: any; milestone?: string; category?: any }) => Promise<ProgressPost>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  sendChatMessage: (
    content: string,
    options?: {
      channelId?: string;
      teamId?: string;
      isPrivate?: boolean;
      codeSnippet?: { language: string; code: string };
      attachmentUrl?: string;
      attachmentTitle?: string;
      attachmentType?: 'github' | 'figma' | 'demo' | 'file';
      replyTo?: { id: string; authorName: string; content: string };
    }
  ) => Promise<void>;
  reactToChatMessage: (messageId: string, emoji: string) => Promise<void>;
  togglePinChatMessage: (messageId: string) => Promise<void>;
  submitProject: (submissionData: any) => Promise<Submission>;
  submitJudgement: (submissionId: string, scores: Record<string, number>, feedback: string) => Promise<void>;
  publishResults: (awards: any[]) => Promise<void>;
  triggerAIHostBroadcast: (reason?: string) => Promise<AIHostMessage>;
  askAIHost: (question: string, persona?: string) => Promise<string>;
  polishPostAI: (rawText: string, status?: string) => Promise<{ polished: string; milestone: string; category: string }>;
  matchTeamAI: (userId: string) => Promise<TeamMatchSuggestion[]>;
  getAIFinalRecap: () => Promise<FinalShowRecap>;
  resetDemoSeed: () => Promise<void>;
  refreshState: () => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendCustomNotification: (notifData: Partial<NotificationItem>) => Promise<NotificationItem>;
  simulateNotification: (type: 'deadline' | 'mentor' | 'stage' | 'ai') => Promise<void>;
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [eventsList, setEventsList] = useState<CompetitionEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string>("vibeathon-2");
  const [duels, setDuels] = useState<Record<string, DuelState>>({});
  const [recaps, setRecaps] = useState<Record<string, FinalShowRecap>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [aiMessages, setAiMessages] = useState<AIHostMessage[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [judgements, setJudgements] = useState<Judgement[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => getBrowserNotificationPermission());
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>("participant");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("competition_theme");
      if (saved === "terminal-dark" || saved === "light") {
        return saved;
      }
    }
    return "light";
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
      if (newTheme === "terminal-dark") {
        document.documentElement.classList.add("theme-terminal-dark");
      } else {
        document.documentElement.classList.remove("theme-terminal-dark");
      }
      localStorage.setItem("competition_theme", newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "terminal-dark" : "light";
    setTheme(next);
    sound.playPop();
  }, [theme, setTheme]);

  // Sync theme on initial load
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "terminal-dark") {
        document.documentElement.classList.add("theme-terminal-dark");
      } else {
        document.documentElement.classList.remove("theme-terminal-dark");
      }
    }
  }, [theme]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  const applyState = (data: any) => {
    if (data.hackathon) setHackathon(data.hackathon);
    if (data.eventsList) setEventsList(data.eventsList);
    if (data.activeEventId) setActiveEventId(data.activeEventId);
    if (data.duels) setDuels(data.duels);
    if (data.recaps) setRecaps(data.recaps);
    if (data.users) {
      setUsers(data.users);
      // If no currentUser set yet, default to first participant or ivan
      if (!currentUser) {
        const defaultUser = data.users.find((u: User) => u.id === "usr-1") || data.users[0];
        if (defaultUser) {
          setCurrentUser(defaultUser);
          setCurrentRole(defaultUser.role);
        }
      }
    }
    if (data.teams) setTeams(data.teams);
    if (data.projects) setProjects(data.projects);
    if (data.posts) setPosts(data.posts);
    if (data.comments) setComments(data.comments);
    if (data.events) setEvents(data.events);
    if (data.aiMessages) setAiMessages(data.aiMessages);
    if (data.submissions) setSubmissions(data.submissions);
    if (data.judgements) setJudgements(data.judgements);
    if (data.chatMessages) setChatMessages(data.chatMessages);
    if (data.notifications) setNotifications(data.notifications);
    if (data.leaderboard) setLeaderboard(data.leaderboard);
  };

  const refreshState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        applyState(data);
      }
    } catch (e) {
      console.error("Failed to fetch state:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Initial Fetch & SSE Connection
  useEffect(() => {
    refreshState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events/stream");

      eventSource.addEventListener("connected", () => {
        setSseConnected(true);
      });

      eventSource.addEventListener("notification_created", (e) => {
        const notif: NotificationItem = JSON.parse(e.data);
        setNotifications(prev => [notif, ...prev.filter(n => n.id !== notif.id)]);
        sound.playBroadcastChime();
        showNativeBrowserNotification({
          title: notif.title,
          body: notif.message,
          tag: notif.id
        });
      });

      eventSource.addEventListener("event_recorded", (e) => {
        const newEvent = JSON.parse(e.data);
        setEvents(prev => [newEvent, ...prev.filter(ev => ev.id !== newEvent.id)].slice(0, 100));
        sound.playPulse();
        refreshState();
      });

      eventSource.addEventListener("event_switched", (e) => {
        const data = JSON.parse(e.data);
        if (data.activeEventId) setActiveEventId(data.activeEventId);
        if (data.hackathon) setHackathon(data.hackathon);
        sound.playPulse();
        refreshState();
      });

      eventSource.addEventListener("event_created", (e) => {
        const ev = JSON.parse(e.data);
        setEventsList(prev => [ev, ...prev.filter(x => x.id !== ev.id)]);
        sound.playCelebration();
      });

      eventSource.addEventListener("event_updated", (e) => {
        const ev = JSON.parse(e.data);
        setEventsList(prev => prev.map(x => x.id === ev.id ? ev : x));
        if (ev.id === activeEventId) {
          setHackathon(ev);
        }
      });

      eventSource.addEventListener("duel_updated", (e) => {
        const duel = JSON.parse(e.data);
        setDuels(prev => ({ ...prev, [duel.id]: duel }));
      });

      eventSource.addEventListener("duel_voted", (e) => {
        const { duelId, votesA, votesB } = JSON.parse(e.data);
        setDuels(prev => {
          if (!prev[duelId]) return prev;
          return {
            ...prev,
            [duelId]: {
              ...prev[duelId],
              participantA: { ...prev[duelId].participantA, votes: votesA },
              participantB: { ...prev[duelId].participantB, votes: votesB }
            }
          };
        });
        sound.playPop();
      });

      eventSource.addEventListener("recap_generated", (e) => {
        const { eventId, recap } = JSON.parse(e.data);
        setRecaps(prev => ({ ...prev, [eventId]: recap }));
        sound.playCelebration();
      });

      eventSource.addEventListener("post_created", (e) => {
        const newPost = JSON.parse(e.data);
        setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
        sound.playPulse();
      });

      eventSource.addEventListener("post_reaction_updated", (e) => {
        const { postId, reactions } = JSON.parse(e.data);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions } : p));
      });

      eventSource.addEventListener("comment_added", (e) => {
        const newComment = JSON.parse(e.data);
        setComments(prev => [...prev, newComment]);
        setPosts(prev => prev.map(p => p.id === newComment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      });

      eventSource.addEventListener("chat_message", (e) => {
        const msg = JSON.parse(e.data);
        setChatMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
      });

      eventSource.addEventListener("chat_reaction_updated", (e) => {
        const { messageId, reactions } = JSON.parse(e.data);
        setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
      });

      eventSource.addEventListener("chat_pinned", (e) => {
        const updatedMsg = JSON.parse(e.data);
        setChatMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      });

      eventSource.addEventListener("ai_host_message", (e) => {
        const aiMsg = JSON.parse(e.data);
        setAiMessages(prev => [aiMsg, ...prev]);
        sound.playBroadcastChime();
      });

      eventSource.addEventListener("submission_created", (e) => {
        const sub = JSON.parse(e.data);
        setSubmissions(prev => [...prev, sub]);
        sound.playCelebration();
        refreshState();
      });

      eventSource.addEventListener("judgement_submitted", (e) => {
        const j = JSON.parse(e.data);
        setJudgements(prev => [...prev.filter(x => x.id !== j.id), j]);
      });

      eventSource.addEventListener("hackathon_updated", (e) => {
        const h = JSON.parse(e.data);
        setHackathon(h);
      });

      eventSource.addEventListener("results_published", () => {
        sound.playCelebration();
        refreshState();
      });

      eventSource.addEventListener("store_reset", () => {
        refreshState();
      });

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    } catch (e) {
      console.warn("SSE init failed:", e);
    }

    // Polling safety fallback
    const interval = setInterval(refreshState, 8000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [refreshState, activeEventId]);

  const switchActiveUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
    }
  };

  const switchEvent = async (eventId: string) => {
    try {
      const res = await fetch("/api/events/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      });
      const data = await res.json();
      if (data.success && data.activeEvent) {
        setActiveEventId(eventId);
        setHackathon(data.activeEvent);
        sound.playPulse();
        refreshState();
      }
    } catch (e) {
      console.error("Failed to switch event:", e);
    }
  };

  const createEvent = async (eventData: any): Promise<CompetitionEvent> => {
    const res = await fetch("/api/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...eventData,
        organizerId: currentUser?.id,
        userRole: currentRole
      })
    });
    const data = await res.json();
    if (data.event) {
      setEventsList(prev => [data.event, ...prev]);
      sound.playCelebration();
      return data.event;
    }
    throw new Error(data.error || "Ошибка создания события");
  };

  const controlEvent = async (eventId: string, stage: HackathonStage) => {
    const res = await fetch("/api/events/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, stage })
    });
    const data = await res.json();
    if (data.event) {
      setEventsList(prev => prev.map(e => e.id === data.event.id ? data.event : e));
      if (data.event.id === activeEventId) {
        setHackathon(data.event);
      }
      sound.playCelebration();
    }
  };

  const sendDuelAction = async (action: string, payload: any = {}) => {
    const targetDuelId = payload.duelId || activeEventId || "duel-42";
    const res = await fetch("/api/duel/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duelId: targetDuelId, action, ...payload })
    });
    const data = await res.json();
    if (data.duel) {
      setDuels(prev => ({ ...prev, [data.duel.id]: data.duel }));
      sound.playPulse();
    }
  };

  const voteDuel = async (participantId: string) => {
    const targetDuelId = activeEventId === "duel-42" ? "duel-42" : (duels[activeEventId]?.id || "duel-42");
    const res = await fetch("/api/duel/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        duelId: targetDuelId,
        participantId,
        voterId: currentUser?.id || `voter-${Math.random().toString(36).substr(2, 6)}`
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Ошибка при голосовании");
    }
    sound.playCelebration();
  };

  const validateSubmissionGate = async (data: any): Promise<SubmissionGateReport> => {
    const res = await fetch("/api/submissions/validate-gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    return resData.report;
  };

  const registerUser = async (userData: Partial<User>): Promise<User> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.user) {
      setUsers(prev => [...prev, data.user]);
      setCurrentUser(data.user);
      setCurrentRole(data.user.role);
      sound.playCelebration();
      return data.user;
    }
    throw new Error(data.error || "Ошибка регистрации");
  };

  const updateHackathon = async (data: Partial<Hackathon>) => {
    const res = await fetch("/api/hackathon/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (resData.hackathon) {
      setHackathon(resData.hackathon);
    }
  };

  const createTeam = async (teamData: { name: string; tag?: string; description?: string; lookingForRoles?: string[] }): Promise<Team> => {
    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...teamData,
        captainId: currentUser?.id || "usr-1"
      })
    });
    const data = await res.json();
    if (data.team) {
      setTeams(prev => [...prev, data.team]);
      if (currentUser) {
        const updatedUser = { ...currentUser, teamId: data.team.id };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      }
      sound.playCelebration();
      return data.team;
    }
    throw new Error(data.error || "Ошибка создания команды");
  };

  const joinTeam = async (teamId: string, roleInTeam?: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        userId: currentUser.id,
        roleInTeam: roleInTeam || currentUser.primaryRole
      })
    });
    const data = await res.json();
    if (data.team) {
      setTeams(prev => prev.map(t => t.id === data.team.id ? data.team : t));
      const updatedUser = { ...currentUser, teamId: data.team.id };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      sound.playPop();
    }
  };

  const upsertProject = async (projectData: Partial<Project>): Promise<Project> => {
    const res = await fetch("/api/projects/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...projectData,
        teamId: currentUser?.teamId,
        authorId: currentUser?.id || "usr-1"
      })
    });
    const data = await res.json();
    if (data.project) {
      setProjects(prev => {
        const exists = prev.find(p => p.id === data.project.id);
        if (exists) {
          return prev.map(p => p.id === data.project.id ? data.project : p);
        }
        return [...prev, data.project];
      });
      sound.playCelebration();
      return data.project;
    }
    throw new Error(data.error || "Ошибка сохранения проекта");
  };

  const createPost = async (postData: { content: string; polishedContent?: string; mediaType?: any; mediaUrl?: string; status?: any; milestone?: string; category?: any }): Promise<ProgressPost> => {
    if (!currentUser) throw new Error("Пользователь не авторизован");
    const userProj = projects.find(p => p.authorId === currentUser.id || p.teamId === currentUser.teamId);

    const res = await fetch("/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...postData,
        authorId: currentUser.id,
        teamId: currentUser.teamId,
        projectId: userProj?.id
      })
    });
    const data = await res.json();
    if (data.post) {
      setPosts(prev => [data.post, ...prev.filter(p => p.id !== data.post.id)]);
      sound.playPulse();
      return data.post;
    }
    throw new Error(data.error || "Ошибка создания записи");
  };

  const reactToPost = async (postId: string, emoji: string) => {
    const res = await fetch("/api/posts/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        emoji,
        userId: currentUser?.id || "guest"
      })
    });
    const data = await res.json();
    if (data.reactions) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: data.reactions } : p));
      sound.playPop();
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/posts/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        authorId: currentUser.id,
        content
      })
    });
    const data = await res.json();
    if (data.comment) {
      setComments(prev => [...prev, data.comment]);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      sound.playPop();
    }
  };

  const sendChatMessage = async (
    content: string,
    options?: {
      channelId?: string;
      teamId?: string;
      isPrivate?: boolean;
      codeSnippet?: { language: string; code: string };
      attachmentUrl?: string;
      attachmentTitle?: string;
      attachmentType?: 'github' | 'figma' | 'demo' | 'file';
      replyTo?: { id: string; authorName: string; content: string };
    }
  ) => {
    if (!currentUser) return;
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorId: currentUser.id,
        content,
        channelId: options?.channelId || "general",
        teamId: options?.teamId,
        isPrivate: options?.isPrivate,
        codeSnippet: options?.codeSnippet,
        attachmentUrl: options?.attachmentUrl,
        attachmentTitle: options?.attachmentTitle,
        attachmentType: options?.attachmentType,
        replyTo: options?.replyTo
      })
    });
    const data = await res.json();
    if (data.message) {
      setChatMessages(prev => [...prev.filter(m => m.id !== data.message.id), data.message]);
      sound.playPop();
    }
  };

  const reactToChatMessage = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/chat/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId,
        emoji,
        userId: currentUser.id
      })
    });
    const data = await res.json();
    if (data.message) {
      setChatMessages(prev => prev.map(m => m.id === messageId ? data.message : m));
      sound.playPop();
    }
  };

  const togglePinChatMessage = async (messageId: string) => {
    const res = await fetch("/api/chat/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId })
    });
    const data = await res.json();
    if (data.message) {
      setChatMessages(prev => prev.map(m => m.id === messageId ? data.message : m));
    }
  };

  const submitProject = async (submissionData: any): Promise<Submission> => {
    if (!currentUser) throw new Error("Пользователь не авторизован");
    const userProj = projects.find(p => p.authorId === currentUser.id || p.teamId === currentUser.teamId);

    const res = await fetch("/api/submissions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submissionData,
        authorId: currentUser.id,
        projectId: userProj?.id || submissionData.projectId,
        userRole: currentRole
      })
    });
    const data = await res.json();
    if (data.submission) {
      setSubmissions(prev => [...prev, data.submission]);
      sound.playCelebration();
      return data.submission;
    }
    throw new Error(data.error || "Ошибка отправки проекта");
  };

  const submitJudgement = async (submissionId: string, scores: Record<string, number>, feedback: string) => {
    if (!currentUser) return;
    const res = await fetch("/api/judgements/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId,
        judgeId: currentUser.id,
        scores,
        feedback
      })
    });
    const data = await res.json();
    if (data.judgement) {
      setJudgements(prev => [...prev.filter(j => j.id !== data.judgement.id), data.judgement]);
      sound.playPop();
    }
  };

  const publishResults = async (awards: any[]) => {
    const res = await fetch("/api/hackathon/publish-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ awards })
    });
    const data = await res.json();
    if (data.hackathon) {
      setHackathon(data.hackathon);
      sound.playCelebration();
    }
  };

  const triggerAIHostBroadcast = async (reason?: string): Promise<AIHostMessage> => {
    const res = await fetch("/api/ai/host-broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggerReason: reason })
    });
    const data = await res.json();
    if (data.message) {
      setAiMessages(prev => [data.message, ...prev]);
      sound.playBroadcastChime();
      return data.message;
    }
    throw new Error("Не удалось сгенерировать сводку AI Host");
  };

  const askAIHost = async (question: string, persona?: string): Promise<string> => {
    const res = await fetch("/api/ai/ask-host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, userId: currentUser?.id, persona })
    });
    const data = await res.json();
    return data.answer || "AI Host временно недоступен";
  };

  const polishPostAI = async (rawText: string, status?: string) => {
    const res = await fetch("/api/ai/polish-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText, status })
    });
    return res.json();
  };

  const matchTeamAI = async (userId: string): Promise<TeamMatchSuggestion[]> => {
    const res = await fetch("/api/ai/team-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    return data.suggestions || [];
  };

  const getAIFinalRecap = async (): Promise<FinalShowRecap> => {
    const res = await fetch("/api/ai/final-recap", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    if (data && hackathon?.id) {
      setRecaps(prev => ({ ...prev, [hackathon.id]: data }));
    }
    return data;
  };

  const resetDemoSeed = async () => {
    await fetch("/api/seed/reset", { method: "POST" });
    await refreshState();
    sound.playCelebration();
  };

  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (perm === "granted") {
      sound.playCelebration();
      showNativeBrowserNotification({
        title: "🔔 PUSH-УВЕДОМЛЕНИЯ АКТИВИРОВАНЫ",
        body: "Теперь вы будете мгновенно получать предупреждения о дедлайнах и сообщения менторов прямо на рабочий стол."
      });
    }
    return perm;
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn("Failed to mark notification read:", e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    sound.playClick();
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST"
      });
    } catch (e) {
      console.warn("Failed to mark all notifications read:", e);
    }
  };

  const sendCustomNotification = async (notifData: Partial<NotificationItem>): Promise<NotificationItem> => {
    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifData)
    });
    const data = await res.json();
    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev.filter(n => n.id !== data.notification.id)]);
      sound.playBroadcastChime();
      showNativeBrowserNotification({
        title: data.notification.title,
        body: data.notification.message,
        tag: data.notification.id
      });
      return data.notification;
    }
    throw new Error(data.error || "Не удалось отправить уведомление");
  };

  const simulateNotification = async (type: 'deadline' | 'mentor' | 'stage' | 'ai') => {
    let payload: Partial<NotificationItem> = {};

    if (type === 'deadline') {
      payload = {
        type: 'DEADLINE_WARNING',
        category: 'deadline',
        title: '⏳ ПРЕДУПРЕЖДЕНИЕ: 1 ЧАС ДО ДЕДЛАЙНА!',
        message: 'Прием работ на «Вайбатон №2» завершается через 60 минут. Обязательно проверьте ссылку на видеодемо и README.',
        link: '#submit',
        actionTab: 'submit',
        priority: 'urgent',
        senderName: 'Event Chrono Gate',
        senderRole: 'organizer'
      };
    } else if (type === 'mentor') {
      const mentors = users.filter(u => u.role === 'judge') || [];
      const mentor = mentors[0] || { name: 'Елена Романова', role: 'judge', avatar: '' };
      payload = {
        type: 'MENTOR_MESSAGE',
        category: 'mentor',
        title: `👨‍🏫 НОВОЕ СООБЩЕНИЕ МЕНТОРА: ${mentor.name.toUpperCase()}`,
        message: '«Командам: протестируйте сценарий отказа сети в сокетах. Жюри ценит обработку краевых случаев и чистый UI/UX».',
        link: '#chat',
        actionTab: 'chat',
        priority: 'high',
        senderName: mentor.name,
        senderRole: mentor.role,
        senderAvatar: mentor.avatar
      };
    } else if (type === 'stage') {
      payload = {
        type: 'STAGE_CHANGE',
        category: 'stage',
        title: '⚡ СМЕНА СТАТУСА: ЭТАП [SUBMISSION] ОТКРЫТ',
        message: 'Прием финальных проектов официально стартовал. Форма валидации репозитория и чеклист MVP активны.',
        link: '#submit',
        actionTab: 'submit',
        priority: 'urgent',
        senderName: 'Competition OS Core',
        senderRole: 'system'
      };
    } else if (type === 'ai') {
      payload = {
        type: 'AI_BROADCAST',
        category: 'ai',
        title: '🎙️ AI HOST: ВЫПУЩЕН LIVE-ОБЗОР ЭКВАТОРА',
        message: 'AI Host проанализировал темп хакатона. Опубликована аналитика активности постов и готовности MVP.',
        link: '#live',
        actionTab: 'live',
        priority: 'normal',
        senderName: 'AI Host Gemini 3.7',
        senderRole: 'system'
      };
    }

    await sendCustomNotification(payload);
  };

  const activeDuel = duels[activeEventId] || duels["duel-42"] || null;
  const activeRecap = recaps[activeEventId] || null;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <HackathonContext.Provider
      value={{
        hackathon,
        eventsList,
        activeEventId,
        duels,
        recaps,
        activeDuel,
        activeRecap,
        users,
        teams,
        projects,
        posts,
        comments,
        events,
        aiMessages,
        submissions,
        judgements,
        chatMessages,
        notifications,
        unreadNotificationsCount,
        browserPermission,
        leaderboard,
        currentUser,
        currentRole,
        isLoading,
        sseConnected,
        soundEnabled,
        theme,
        toggleSound,
        setTheme,
        toggleTheme,
        setCurrentUser,
        setCurrentRole,
        switchActiveUser,
        switchEvent,
        createEvent,
        controlEvent,
        sendDuelAction,
        voteDuel,
        validateSubmissionGate,
        registerUser,
        updateHackathon,
        createTeam,
        joinTeam,
        upsertProject,
        createPost,
        reactToPost,
        addComment,
        sendChatMessage,
        reactToChatMessage,
        togglePinChatMessage,
        submitProject,
        submitJudgement,
        publishResults,
        triggerAIHostBroadcast,
        askAIHost,
        polishPostAI,
        matchTeamAI,
        getAIFinalRecap,
        resetDemoSeed,
        refreshState,
        requestBrowserPermission,
        markNotificationRead,
        markAllNotificationsRead,
        sendCustomNotification,
        simulateNotification
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
};

export const useHackathon = () => {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error("useHackathon must be used within a HackathonProvider");
  }
  return context;
};
