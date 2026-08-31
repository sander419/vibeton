import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type {
  Hackathon,
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
  TeamMatchSuggestion,
  FinalShowRecap
} from "../types";
import { sound } from "../utils/audio";

interface HackathonContextType {
  hackathon: Hackathon | null;
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
  leaderboard: LeaderboardItem[];
  currentUser: User | null;
  currentRole: Role;
  isLoading: boolean;
  sseConnected: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentRole: (role: Role) => void;
  switchActiveUser: (userId: string) => void;
  registerUser: (userData: Partial<User>) => Promise<User>;
  updateHackathon: (data: Partial<Hackathon>) => Promise<void>;
  createTeam: (teamData: { name: string; tag?: string; description?: string; lookingForRoles?: string[] }) => Promise<Team>;
  joinTeam: (teamId: string, roleInTeam?: string) => Promise<void>;
  upsertProject: (projectData: Partial<Project>) => Promise<Project>;
  createPost: (postData: { content: string; polishedContent?: string; mediaType?: any; mediaUrl?: string; status?: any; milestone?: string; category?: any }) => Promise<ProgressPost>;
  reactToPost: (postId: string, emoji: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
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
}

const HackathonContext = createContext<HackathonContextType | undefined>(undefined);

export const HackathonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>("participant");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  const applyState = (data: any) => {
    if (data.hackathon) setHackathon(data.hackathon);
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

      eventSource.addEventListener("event_recorded", (e) => {
        const newEvent = JSON.parse(e.data);
        setEvents(prev => [newEvent, ...prev.filter(ev => ev.id !== newEvent.id)].slice(0, 100));
        sound.playPulse();
        // Refresh leaderboard & activity
        refreshState();
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
        setChatMessages(prev => [...prev, msg]);
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
  }, [refreshState]);

  const switchActiveUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentRole(found.role);
    }
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
        authorId: currentUser?.id || "usr-1",
        teamId: currentUser?.teamId
      })
    });
    const data = await res.json();
    if (data.project) {
      setProjects(prev => {
        const idx = prev.findIndex(p => p.id === data.project.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx] = data.project;
          return next;
        }
        return [...prev, data.project];
      });
      sound.playCelebration();
      return data.project;
    }
    throw new Error(data.error || "Ошибка сохранения проекта");
  };

  const createPost = async (postData: any): Promise<ProgressPost> => {
    const userTeam = teams.find(t => t.id === currentUser?.teamId);
    const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);

    const res = await fetch("/api/posts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...postData,
        projectId: userProject?.id || "proj-1",
        authorId: currentUser?.id || "usr-1"
      })
    });
    const data = await res.json();
    if (data.post) {
      setPosts(prev => [data.post, ...prev]);
      sound.playPop();
      return data.post;
    }
    throw new Error(data.error || "Ошибка публикации поста");
  };

  const reactToPost = async (postId: string, emoji: string) => {
    if (!currentUser) return;
    sound.playPop();
    // Optimistic
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...p.reactions };
      if (!reactions[emoji]) reactions[emoji] = [];
      const idx = reactions[emoji].indexOf(currentUser.id);
      if (idx > -1) {
        reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...reactions[emoji], currentUser.id];
      }
      return { ...p, reactions };
    }));

    await fetch("/api/posts/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, emoji, userId: currentUser.id })
    });
  };

  const addComment = async (postId: string, content: string) => {
    if (!currentUser || !content.trim()) return;
    const res = await fetch("/api/posts/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, authorId: currentUser.id, content })
    });
    const data = await res.json();
    if (data.comment) {
      setComments(prev => [...prev, data.comment]);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      sound.playPop();
    }
  };

  const sendChatMessage = async (content: string) => {
    if (!content.trim()) return;
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        authorId: currentUser?.id || "guest"
      })
    });
    const data = await res.json();
    if (data.message) {
      setChatMessages(prev => [...prev, data.message]);
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
    const userProj = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);
    const res = await fetch("/api/submissions/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...submissionData,
        projectId: userProj?.id || submissionData.projectId,
        authorId: currentUser?.id || "usr-1"
      })
    });
    const data = await res.json();
    if (data.submission) {
      setSubmissions(prev => [...prev, data.submission]);
      sound.playCelebration();
      refreshState();
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
    return res.json();
  };

  const resetDemoSeed = async () => {
    await fetch("/api/seed/reset", { method: "POST" });
    await refreshState();
    sound.playCelebration();
  };

  return (
    <HackathonContext.Provider
      value={{
        hackathon,
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
        leaderboard,
        currentUser,
        currentRole,
        isLoading,
        sseConnected,
        soundEnabled,
        toggleSound,
        setCurrentUser,
        setCurrentRole,
        switchActiveUser,
        registerUser,
        updateHackathon,
        createTeam,
        joinTeam,
        upsertProject,
        createPost,
        reactToPost,
        addComment,
        sendChatMessage,
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
        refreshState
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
