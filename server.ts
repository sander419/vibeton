import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
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
  TeamMatchSuggestion,
  LeaderboardItem,
  HackathonStage
} from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// In-Memory Database Store with Demo Seed
interface Store {
  hackathon: Hackathon;
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
}

// Initial Rich Demo Seed
function generateInitialStore(): Store {
  const hackathon: Hackathon = {
    id: "vibeathon-2",
    title: "Вайбатон №2",
    theme: "Платформа для проведения Вайбатонов",
    description: "Создайте живую платформу для проведения онлайн-хакатонов и челленджей с акцентом на динамику, AI-хостинг, прозрачность прогресса и вовлеченность участников.",
    rules: [
      "Рабочий MVP обязателен к концу дедлайна",
      "Участие соло или в командах до 4 человек",
      "Публикуйте регулярные Devlog-апдейты в ходе разработки",
      "Демо-видео до 3 минут и ссылка на открытый репозиторий",
      "AI используется как ассистент и ядро сценария, но оценка ведётся жюри"
    ],
    criteria: [
      { id: "mvp", name: "Рабочий MVP", description: "Полнота и работоспособность основного пользовательского сценария", maxScore: 10 },
      { id: "ai_core", name: "AI как ядро / Host", description: "Качество интеграции AI-ведущего и умных функций", maxScore: 10 },
      { id: "ux_vibe", name: "UX & Live Vibe", description: "Ощущение живого соревнования, атмосфера, дизайн", maxScore: 10 },
      { id: "viability", name: "Жизнеспособность", description: "Техническая надежность, продуманность архитектуры и перспектива развития", maxScore: 10 }
    ],
    stage: "ACTIVE",
    startTime: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), // 2.5 days ago
    endTime: new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000).toISOString(),   // 4.5 days left
    submissionDeadline: new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000).toISOString(),
    maxTeamSize: 4,
    organizerId: "usr-admin",
    organizerName: "Fix-Ed Team",
    specialAwards: [
      { id: "best-vibe", title: "Лучший Live-Vibe", icon: "⚡", description: "За создание самой живой атмосферы соревнования" },
      { id: "best-ai", title: "AI-Инновация", icon: "🧠", description: "За глубокую интеграцию AI-хоста без галлюцинаций" },
      { id: "best-design", title: "Идеальный UI/UX", icon: "🎨", description: "За безупречный киберпанк/esports интерфейс" },
      { id: "speed-demon", title: "Скоростной MVP", icon: "🚀", description: "Команде, первой показавшей рабочий прототип" }
    ]
  };

  const users: User[] = [
    {
      id: "usr-admin",
      name: "Алексей Смирнов",
      username: "alex_admin",
      email: "alex@fix-ed.me",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "organizer",
      skills: ["Community Management", "Product Strategy", "Live Events"],
      stack: ["Fix-Ed Core", "Analytics", "Operations"],
      experience: "Организатор 15+ IT-событий",
      primaryRole: "Организатор",
      lookingFor: ["Менторы", "Жюри"],
      bio: "Куратор Fix-Ed и главный ведущий Вайбатона №2.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-judge-1",
      name: "Дмитрий Ветров",
      username: "dmitry_judge",
      email: "dmitry@venture.ai",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "judge",
      skills: ["Product Review", "System Architecture", "AI Evaluation"],
      stack: ["Python", "FastAPI", "Next.js", "PyTorch"],
      experience: "Tech Lead & Angel Investor",
      primaryRole: "Жюри",
      lookingFor: [],
      bio: "Оцениваю техническую глубину и реальную пользу проектов.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-judge-2",
      name: "Елена Романова",
      username: "elena_design",
      email: "elena@product.design",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "judge",
      skills: ["Design Systems", "UX Research", "Micro-interactions"],
      stack: ["Figma", "Tailwind", "Motion"],
      experience: "Principal Product Designer",
      primaryRole: "Жюри",
      lookingFor: [],
      bio: "Сужу по качеству пользовательского опыта и вниманию к деталям.",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-1",
      name: "Иван Ковалев",
      username: "ivan_dev",
      email: "ivan@example.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["React 19", "TypeScript", "Tailwind CSS", "WebSocket", "Audio API"],
      stack: ["React", "Node.js", "Express", "Vite"],
      experience: "Senior Frontend Engineer, 6 лет опыта",
      primaryRole: "Frontend Lead",
      lookingFor: ["Backend", "AI Engineer"],
      bio: "Капитан Team Pulse. Делаем ультрабыстрый Live-дашборд с AI-хостом.",
      githubUrl: "https://github.com/ivan-kovalev",
      teamId: "team-1",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-2",
      name: "София Морозова",
      username: "sofia_ai",
      email: "sofia@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["Gemini API", "Prompt Engineering", "NLP", "Python", "Vector DB"],
      stack: ["@google/genai", "LangChain", "Node.js", "FastAPI"],
      experience: "AI Researcher & Fullstack dev",
      primaryRole: "AI Engineer",
      lookingFor: ["Frontend"],
      bio: "Архитектура контекста и событийно-ориентированного AI Host для Team Pulse.",
      githubUrl: "https://github.com/sofia-m",
      teamId: "team-1",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-3",
      name: "Максим Орлов",
      username: "max_solo",
      email: "max@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["Fullstack", "Go", "Vue.js", "WebRTC", "Postgres"],
      stack: ["Go", "React", "Docker", "Tailwind"],
      experience: "Solo-хакатонщик, 8 побед",
      primaryRole: "Fullstack",
      lookingFor: [],
      bio: "Разрабатываю VibeStream — стриминговую хакатон-арену соло.",
      githubUrl: "https://github.com/max-solo",
      teamId: "team-2",
      createdAt: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-4",
      name: "Артем Васильев",
      username: "artem_cyber",
      email: "artem@example.com",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["WebGL", "Three.js", "Motion", "UI/UX"],
      stack: ["Three.js", "React", "GLSL"],
      experience: "Creative Technologist",
      primaryRole: "Creative Dev",
      lookingFor: ["Backend", "AI"],
      bio: "Капитан Team CyberVibe. Создаем 3D-комнату Вайбатона.",
      teamId: "team-3",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-5",
      name: "Анна Кузнецова",
      username: "anna_back",
      email: "anna@example.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["Node.js", "GraphQL", "Redis", "SSE", "Docker"],
      stack: ["Express", "TypeScript", "PostgreSQL"],
      experience: "Backend Engineer, 4 года",
      primaryRole: "Backend",
      lookingFor: ["Frontend", "Design"],
      bio: "Ищу команду для синергии! Готова поднять надежный бэкенд и шину событий.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "usr-6",
      name: "Денис Лебедев",
      username: "denis_ai",
      email: "denis@example.com",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      role: "participant",
      skills: ["Gemini 3.7", "Agents", "Embeddings", "TypeScript"],
      stack: ["Python", "Node.js", "Gemini API"],
      experience: "ML Engineer",
      primaryRole: "AI Engineer",
      lookingFor: ["Frontend", "Mobile"],
      bio: "Экспериментирую с агентными пайплайнами для хакатонов.",
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const teams: Team[] = [
    {
      id: "team-1",
      hackathonId: "vibeathon-2",
      name: "Team Pulse",
      tag: "PULSE",
      description: "Живая операционная система хакатона с голосовым AI Host и мгновенным Devlog.",
      avatarColor: "#10b981",
      captainId: "usr-1",
      members: [
        { userId: "usr-1", name: "Иван Ковалев", avatar: users[3].avatar, roleInTeam: "Frontend Lead", isCaptain: true },
        { userId: "usr-2", name: "София Морозова", avatar: users[4].avatar, roleInTeam: "AI & Context Architect", isCaptain: false }
      ],
      projectId: "proj-1",
      lookingForRoles: ["QA / Tester"],
      isOpen: true,
      activityCount: 28,
      createdAt: new Date(Date.now() - 2.4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "team-2",
      hackathonId: "vibeathon-2",
      name: "Solo Max Studio",
      tag: "SOLO",
      description: "Один в поле воин. Создание киберспортивной арены для онлайн-соревнований.",
      avatarColor: "#8b5cf6",
      captainId: "usr-3",
      members: [
        { userId: "usr-3", name: "Максим Орлов", avatar: users[5].avatar, roleInTeam: "Fullstack Solo Dev", isCaptain: true }
      ],
      projectId: "proj-2",
      lookingForRoles: [],
      isOpen: false,
      activityCount: 19,
      createdAt: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "team-3",
      hackathonId: "vibeathon-2",
      name: "Team CyberVibe",
      tag: "CYBER",
      description: "Виртуальное 3D-пространство и интерактивная карта активности хакатона.",
      avatarColor: "#06b6d4",
      captainId: "usr-4",
      members: [
        { userId: "usr-4", name: "Артем Васильев", avatar: users[6].avatar, roleInTeam: "Creative Dev", isCaptain: true }
      ],
      projectId: "proj-3",
      lookingForRoles: ["Backend Engineer", "AI Developer"],
      isOpen: true,
      activityCount: 14,
      createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const projects: Project[] = [
    {
      id: "proj-1",
      hackathonId: "vibeathon-2",
      teamId: "team-1",
      teamName: "Team Pulse",
      authorId: "usr-1",
      authorName: "Иван Ковалев",
      authorAvatar: users[3].avatar,
      title: "PulseOS: Live Vibeathon Station",
      tagline: "Операционная система живого соревнования со стримом событий и AI-ведущим",
      description: "PulseOS трансформирует классический дедлайн-ориентированный хакатон в непрерывное реалити-шоу: мгновенный постинг обновлений за 30 секунд, автоматический AI Host с синтезом речи, контекстная статистика без спама и прозрачная система судейства.",
      tags: ["React 19", "Express", "Gemini 3.7", "Web Audio API", "SSE"],
      status: "MVP",
      demoUrl: "https://fix-ed.me/vibeathon-pulse",
      repoUrl: "https://github.com/vibe-hack/pulse-os",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      instructions: "1. Откройте главную страницу события\n2. Нажмите 'Опубликовать прогресс' для добавления девлога\n3. Послушайте брифинг AI Host\n4. Проверьте табло активности и модуль судейства",
      screenshots: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
      ],
      mvpTimestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2.4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "proj-2",
      hackathonId: "vibeathon-2",
      teamId: "team-2",
      teamName: "Solo Max Studio",
      authorId: "usr-3",
      authorName: "Максим Орлов",
      authorAvatar: users[5].avatar,
      title: "ArenaVibe — Cyber Esports for Devs",
      tagline: "Киберспортивный интерфейс с live-ареной, таймерами и дуэлями прототипов",
      description: "Соревновательная платформа с темной эстетикой, турнирной сеткой активности и виджетами для трансляций на Twitch и YouTube.",
      tags: ["Go", "React", "WebSockets", "Dark UI"],
      status: "BUILDING",
      demoUrl: "https://arenavibe.dev",
      repoUrl: "https://github.com/max-solo/arena-vibe",
      instructions: "Запуск через docker-compose up",
      screenshots: [
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
      ],
      createdAt: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "proj-3",
      hackathonId: "vibeathon-2",
      teamId: "team-3",
      teamName: "Team CyberVibe",
      authorId: "usr-4",
      authorName: "Артем Васильев",
      authorAvatar: users[6].avatar,
      title: "HoloHack 3D",
      tagline: "Интерактивное трехмерное пространство хакатона",
      description: "Карта комнат команд в реальном времени с 3D-аватарами и визуализацией пушей кода.",
      tags: ["Three.js", "WebGL", "GLSL", "React"],
      status: "IDEA",
      demoUrl: "https://holohack.space",
      repoUrl: "https://github.com/artem/holohack",
      instructions: "Требуется поддержка WebGL 2.0",
      screenshots: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
      ],
      createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  const posts: ProgressPost[] = [
    {
      id: "post-1",
      hackathonId: "vibeathon-2",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      teamId: "team-1",
      teamName: "Team Pulse",
      authorId: "usr-1",
      authorName: "Иван Ковалев",
      authorAvatar: users[3].avatar,
      content: "Развернули каркас проекта! Собрали Tailwind тему, подключили темный киберпанк-стиль и настроили базовые роуты.",
      polishedContent: "🚀 Заложена архитектурная основа PulseOS: развернут стек React 19 + Express, внедрена темная эстетика и спроектирована шина realtime-событий.",
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      status: "BUILDING",
      milestone: "Инициализация и стек",
      category: "architecture",
      reactions: { "🔥": ["usr-3", "usr-4", "usr-admin"], "⚡": ["usr-2", "usr-5"] },
      commentsCount: 3,
      createdAt: new Date(Date.now() - 2.1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post-2",
      hackathonId: "vibeathon-2",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      teamId: "team-1",
      teamName: "Team Pulse",
      authorId: "usr-2",
      authorName: "София Морозова",
      authorAvatar: users[4].avatar,
      content: "Подключили Gemini API для AI Host! Сформулировали системные инструкции: AI знает расписание, считает дедлайны и комментирует события.",
      polishedContent: "🧠 Запущен AI Host Engine: интеграция Gemini 3.7 со строгим контекстом хакатона. Ведущий отслеживает динамику команд и генерирует живые сводки без галлюцинаций.",
      mediaType: "demo",
      mediaUrl: "https://fix-ed.me/preview-host",
      status: "MVP",
      milestone: "AI Host Engine",
      category: "ai",
      reactions: { "🧠": ["usr-admin", "usr-1", "usr-3", "usr-judge-1"], "🚀": ["usr-5"] },
      commentsCount: 4,
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post-3",
      hackathonId: "vibeathon-2",
      projectId: "proj-2",
      projectTitle: "ArenaVibe — Cyber Esports for Devs",
      teamId: "team-2",
      teamName: "Solo Max Studio",
      authorId: "usr-3",
      authorName: "Максим Орлов",
      authorAvatar: users[5].avatar,
      content: "Собрал сокет-сервер на Go для синхронизации таймеров между 500+ клиентами. Задержка менее 12мс!",
      polishedContent: "⚡ Реализован высокопроизводительный WebSocket-бэкенд на Go с субмиллисекундным бродкастом таймеров и турнирного табло.",
      mediaType: "github",
      mediaUrl: "https://github.com/max-solo/arena-vibe/commit/8f2a1b",
      status: "BUILDING",
      milestone: "Realtime WebSocket Hub",
      category: "architecture",
      reactions: { "💪": ["usr-1", "usr-2", "usr-admin"], "🔥": ["usr-4"] },
      commentsCount: 1,
      createdAt: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post-4",
      hackathonId: "vibeathon-2",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      teamId: "team-1",
      teamName: "Team Pulse",
      authorId: "usr-1",
      authorName: "Иван Ковалев",
      authorAvatar: users[3].avatar,
      content: "Добавили синтез речи для AI Host прямо в браузере! Теперь сводки можно не только читать, но и слушать голосом ведущего.",
      polishedContent: "🎙️ Интегрирован Web Audio Voice Stream: теперь AI Host озвучивает ключевые вехи хакатона в прямом эфире с футуристичными звуковыми эффектами.",
      mediaType: "demo",
      mediaUrl: "https://fix-ed.me/vibeathon-pulse",
      status: "MVP",
      milestone: "Voice Stream AI Host",
      category: "ui",
      reactions: { "🎉": ["usr-admin", "usr-3", "usr-4", "usr-judge-2"], "🔥": ["usr-2", "usr-6"] },
      commentsCount: 5,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ];

  const comments: Comment[] = [
    {
      id: "comm-1",
      postId: "post-1",
      authorId: "usr-admin",
      authorName: "Алексей Смирнов",
      authorAvatar: users[0].avatar,
      content: "Отличный темп, Team Pulse! Стиль выглядит очень свежо 🔥",
      createdAt: new Date(Date.now() - 2.0 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "comm-2",
      postId: "post-2",
      authorId: "usr-judge-1",
      authorName: "Дмитрий Ветров",
      authorAvatar: users[1].avatar,
      content: "Интересно посмотреть, как ведущий отреагирует на приближение дедлайна. Ждем демо!",
      createdAt: new Date(Date.now() - 1.4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "comm-3",
      postId: "post-4",
      authorId: "usr-3",
      authorName: "Максим Орлов",
      authorAvatar: users[5].avatar,
      content: "Голос звучит очень кинематографично, респект!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  const events: EventItem[] = [
    {
      id: "ev-1",
      hackathonId: "vibeathon-2",
      type: "HACKATHON_STARTED",
      actorId: "usr-admin",
      actorName: "Алексей Смирнов",
      message: "⚡️ Вайбатон №2 официально стартовал! 7 дней на создание платформы.",
      createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-2",
      hackathonId: "vibeathon-2",
      type: "TEAM_CREATED",
      actorId: "usr-1",
      actorName: "Иван Ковалев",
      teamId: "team-1",
      teamName: "Team Pulse",
      message: "Команда Team Pulse создана и открыта для набора.",
      createdAt: new Date(Date.now() - 2.4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-3",
      hackathonId: "vibeathon-2",
      type: "PROJECT_CREATED",
      actorId: "usr-1",
      actorName: "Иван Ковалев",
      teamId: "team-1",
      teamName: "Team Pulse",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      message: "Team Pulse опубликовала концепт проекта PulseOS.",
      createdAt: new Date(Date.now() - 2.4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-4",
      hackathonId: "vibeathon-2",
      type: "PROGRESS_POSTED",
      actorId: "usr-1",
      actorName: "Иван Ковалев",
      teamName: "Team Pulse",
      projectTitle: "PulseOS: Live Vibeathon Station",
      message: "Иван Ковалев опубликовал обновление: 'Инициализация и стек'",
      createdAt: new Date(Date.now() - 2.1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-5",
      hackathonId: "vibeathon-2",
      type: "MVP_MARKED",
      actorId: "usr-2",
      actorName: "София Морозова",
      teamName: "Team Pulse",
      projectTitle: "PulseOS: Live Vibeathon Station",
      message: "🚀 Team Pulse первыми достигли статуса рабочего MVP!",
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-6",
      hackathonId: "vibeathon-2",
      type: "PROGRESS_POSTED",
      actorId: "usr-3",
      actorName: "Максим Орлов",
      teamName: "Solo Max Studio",
      projectTitle: "ArenaVibe — Cyber Esports for Devs",
      message: "Максим Орлов поделился коммитом Go-сокетов.",
      createdAt: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "ev-7",
      hackathonId: "vibeathon-2",
      type: "PROGRESS_POSTED",
      actorId: "usr-1",
      actorName: "Иван Ковалев",
      teamName: "Team Pulse",
      projectTitle: "PulseOS: Live Vibeathon Station",
      message: "Team Pulse добавили голосовую озвучку AI Host.",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ];

  const aiMessages: AIHostMessage[] = [
    {
      id: "aimsg-1",
      hackathonId: "vibeathon-2",
      trigger: "HACKATHON_STARTED",
      title: "СТАРТ ВАЙБАТОНА №2",
      content: "Вайбатон №2 начался. У вас 7 дней. Тема: Платформа для проведения Вайбатонов. Сегодня ваша задача проста: начать. Уже участвуют 6 инженеров и 3 команды. Первый проект появился через 15 минут после старта.",
      statsSnapshot: { participants: 6, teams: 3, projects: 3, mvps: 0, submissions: 0, progressPosts: 0, hoursLeft: 168 },
      createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "aimsg-2",
      hackathonId: "vibeathon-2",
      trigger: "DAY_2_UPDATE",
      title: "ЭКВАТОР ПЕРВОЙ ПОЛОВИНЫ",
      content: "Прошло 48 часов с момента запуска. Сейчас в соревновании: 6 зарегистрированных участников, 3 сформированные команды и первый рабочий MVP от Team Pulse. До дедлайна осталось чуть больше 4 дней. Самое время перестать сомневаться и начинать собирать ядро.",
      statsSnapshot: { participants: 6, teams: 3, projects: 3, mvps: 1, submissions: 0, progressPosts: 4, hoursLeft: 108 },
      isPinned: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "msg-1",
      hackathonId: "vibeathon-2",
      authorId: "usr-admin",
      authorName: "Алексей Смирнов",
      authorAvatar: users[0].avatar,
      authorRole: "organizer",
      content: "Всем привет! Рады приветствовать участников на Вайбатоне №2. Правила в шапке, пишите любые вопросы сюда или в Devlog!",
      isPinned: true,
      createdAt: new Date(Date.now() - 2.4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "msg-2",
      hackathonId: "vibeathon-2",
      authorId: "usr-1",
      authorName: "Иван Ковалев",
      authorAvatar: users[3].avatar,
      authorRole: "participant",
      content: "Всем удачи! Мы в Team Pulse только что выкатили обновление по Devlog-постингу. Проверяйте ленту 🔥",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "msg-3",
      hackathonId: "vibeathon-2",
      authorId: "usr-3",
      authorName: "Максим Орлов",
      authorAvatar: users[5].avatar,
      authorRole: "participant",
      content: "Работа кипит! На сокетах держится супер-стабильно. Кто тоже соло пилит?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "msg-4",
      hackathonId: "vibeathon-2",
      authorId: "usr-judge-2",
      authorName: "Елена Романова",
      authorAvatar: users[2].avatar,
      authorRole: "judge",
      content: "Напоминаю: при оценке дизайна мы обращаем особое внимание на читаемость таймеров, типографику и удобство публикации с мобильных.",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: "notif-1",
      userId: "usr-1",
      type: "AI_UPDATE",
      title: "AI Host опубликовал сводку",
      message: "AI Host подвел итоги первых 48 часов хакатона.",
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  const submissions: Submission[] = [
    {
      id: "sub-1",
      hackathonId: "vibeathon-2",
      projectId: "proj-1",
      teamId: "team-1",
      teamName: "Team Pulse",
      authorId: "usr-1",
      authorName: "Иван Ковалев",
      title: "PulseOS: Live Vibeathon Station",
      description: "Командная платформа для проведения онлайн-хакатонов нового поколения: живой AI-ведущий на Gemini 3.7 с синтезом речи, быстрый Devlog за 30 секунд, сокет-таймеры и прозрачное судейство.",
      demoUrl: "https://fix-ed.me/vibeathon-pulse",
      repoUrl: "https://github.com/ivan-kovalev/pulse-os",
      videoUrl: "https://youtube.com/watch?v=demo-pulse",
      launchInstructions: "npm install && npm run dev (порт 3000)",
      techStack: ["React 19", "TypeScript", "Tailwind CSS", "Gemini 3.7", "Web Audio API", "Express"],
      checklist: {
        mvpWorks: true,
        demoAvailable: true,
        repoAvailable: true,
        instructionsAdded: true,
        videoAdded: true
      },
      status: "REVIEWED",
      submittedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "sub-2",
      hackathonId: "vibeathon-2",
      projectId: "proj-2",
      teamId: "team-2",
      teamName: "Solo Max Studio",
      authorId: "usr-3",
      authorName: "Максим Орлов",
      title: "ArenaVibe — Cyber Esports for Devs",
      description: "Турнирная кибер-арена для хакатонов с геймификацией коммитов, WebSocket-рейтингом и мгновенной синхронизацией дедлайнов.",
      demoUrl: "https://arenavibe.dev",
      repoUrl: "https://github.com/max-solo/arena-vibe",
      videoUrl: "https://youtube.com/watch?v=demo-arena",
      launchInstructions: "go run main.go && npm start",
      techStack: ["Go", "WebSocket", "React", "Tailwind CSS", "Redis"],
      checklist: {
        mvpWorks: true,
        demoAvailable: true,
        repoAvailable: true,
        instructionsAdded: true,
        videoAdded: false
      },
      status: "REVIEWED",
      submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ];

  const judgements: Judgement[] = [
    {
      id: "jdg-1",
      hackathonId: "vibeathon-2",
      submissionId: "sub-1",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      teamName: "Team Pulse",
      judgeId: "usr-judge-1",
      judgeName: "Дмитрий Ветров",
      scores: {
        mvp: 10,
        ai_core: 10,
        ux_vibe: 9,
        viability: 9
      },
      totalScore: 38,
      feedback: "Блестящая реализация AI Host и сокет-шины. Отличный темп разработки в Devlog и готовый к продакшену UX.",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "jdg-2",
      hackathonId: "vibeathon-2",
      submissionId: "sub-1",
      projectId: "proj-1",
      projectTitle: "PulseOS: Live Vibeathon Station",
      teamName: "Team Pulse",
      judgeId: "usr-judge-2",
      judgeName: "Елена Романова",
      scores: {
        mvp: 9,
        ai_core: 9,
        ux_vibe: 10,
        viability: 9
      },
      totalScore: 37,
      feedback: "Визуальная подача и звуковые эффекты создают ощущение настоящего живого стрима. Высокая эргономика мобильной верстки.",
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "jdg-3",
      hackathonId: "vibeathon-2",
      submissionId: "sub-2",
      projectId: "proj-2",
      projectTitle: "ArenaVibe — Cyber Esports for Devs",
      teamName: "Solo Max Studio",
      judgeId: "usr-judge-1",
      judgeName: "Дмитрий Ветров",
      scores: {
        mvp: 9,
        ai_core: 8,
        ux_vibe: 9,
        viability: 9
      },
      totalScore: 35,
      feedback: "Очень сильный бэкенд на Go и низкая задержка сокетов. Проект готов выдерживать сотни параллельных команд.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
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
    notifications
  };
}

let store: Store = generateInitialStore();

// Realtime SSE Clients
const sseClients: Set<express.Response> = new Set();

function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function recordEvent(type: EventItem['type'], message: string, meta: Partial<EventItem> = {}): EventItem {
  const newEvent: EventItem = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    hackathonId: store.hackathon.id,
    type,
    message,
    createdAt: new Date().toISOString(),
    ...meta
  };
  store.events.unshift(newEvent);
  if (store.events.length > 100) store.events.pop();
  broadcastSSE("event_recorded", newEvent);
  return newEvent;
}

// Compute Leaderboard by Activity Metrics
function computeLeaderboard(): LeaderboardItem[] {
  const items: LeaderboardItem[] = [];

  // Add Teams
  for (const team of store.teams) {
    const proj = store.projects.find(p => p.id === team.projectId || p.teamId === team.id);
    const teamPosts = store.posts.filter(p => p.teamId === team.id);
    const teamEvents = store.events.filter(e => e.teamId === team.id || team.members.some(m => m.userId === e.actorId));
    
    let activityScore = team.activityCount + (teamPosts.length * 3) + (teamEvents.length * 2);
    if (proj?.status === 'MVP') activityScore += 10;
    if (proj?.status === 'DEMO') activityScore += 15;
    if (proj?.status === 'SUBMITTED') activityScore += 20;

    items.push({
      teamId: team.id,
      name: team.name,
      tag: team.tag,
      avatarColor: team.avatarColor,
      eventsCount: activityScore,
      mvpReached: proj?.status === 'MVP' || proj?.status === 'DEMO' || proj?.status === 'SUBMITTED',
      demoReached: proj?.status === 'DEMO' || proj?.status === 'SUBMITTED' || !!proj?.demoUrl,
      submitted: proj?.status === 'SUBMITTED',
      lastActive: proj?.updatedAt || team.createdAt,
      projectTitle: proj?.title
    });
  }

  // Add Solo participants without team
  for (const user of store.users) {
    if (!user.teamId && user.role === 'participant') {
      const userProj = store.projects.find(p => p.authorId === user.id);
      const userPosts = store.posts.filter(p => p.authorId === user.id);
      const userEvents = store.events.filter(e => e.actorId === user.id);

      let activityScore = (userPosts.length * 3) + (userEvents.length * 2);
      if (userProj?.status === 'MVP') activityScore += 10;
      if (userProj?.status === 'SUBMITTED') activityScore += 20;

      items.push({
        authorId: user.id,
        name: user.name,
        avatarColor: "#6366f1",
        eventsCount: activityScore,
        mvpReached: userProj?.status === 'MVP' || userProj?.status === 'SUBMITTED',
        demoReached: !!userProj?.demoUrl,
        submitted: userProj?.status === 'SUBMITTED',
        lastActive: userProj?.updatedAt || user.createdAt,
        projectTitle: userProj?.title
      });
    }
  }

  return items.sort((a, b) => b.eventsCount - a.eventsCount);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// SSE Stream for Realtime Pulse
app.get("/api/events/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);
  res.write(`event: connected\ndata: {"status":"connected"}\n\n`);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

// Full state snapshot
app.get("/api/state", (req, res) => {
  const leaderboard = computeLeaderboard();
  res.json({
    ...store,
    leaderboard
  });
});

// Switch or Register Active User
app.post("/api/auth/register", (req, res) => {
  const { name, username, email, role, primaryRole, skills, stack, experience, lookingFor, bio, githubUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Имя обязательно" });
  }

  const id = `usr-${Date.now()}`;
  const newUser: User = {
    id,
    name,
    username: username || name.toLowerCase().replace(/\s+/g, "_"),
    email: email || `${id}@fix-ed.me`,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    role: role || "participant",
    primaryRole: primaryRole || "Fullstack",
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map((s: string) => s.trim()) : ["JavaScript", "React"]),
    stack: Array.isArray(stack) ? stack : (stack ? stack.split(",").map((s: string) => s.trim()) : ["React", "Node.js"]),
    experience: experience || "1-3 года",
    lookingFor: Array.isArray(lookingFor) ? lookingFor : (lookingFor ? lookingFor.split(",").map((s: string) => s.trim()) : []),
    bio: bio || "Участник Вайбатона №2",
    githubUrl: githubUrl || "",
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);
  recordEvent("USER_JOINED", `${newUser.name} присоединился к Вайбатону`, {
    actorId: newUser.id,
    actorName: newUser.name,
    actorAvatar: newUser.avatar
  });

  res.json({ user: newUser });
});

// Update Hackathon Stage & Settings (Organizer)
app.post("/api/hackathon/update", (req, res) => {
  const { stage, title, theme, description, rules, criteria, submissionDeadline, specialAwards } = req.body;
  
  const oldStage = store.hackathon.stage;
  if (stage && stage !== oldStage) {
    store.hackathon.stage = stage as HackathonStage;
    recordEvent("STAGE_CHANGED", `Этап хакатона изменен на: ${stage}`, {
      metadata: { oldStage, newStage: stage }
    });
  }

  if (title) store.hackathon.title = title;
  if (theme) store.hackathon.theme = theme;
  if (description) store.hackathon.description = description;
  if (rules) store.hackathon.rules = rules;
  if (criteria) store.hackathon.criteria = criteria;
  if (submissionDeadline) store.hackathon.submissionDeadline = submissionDeadline;
  if (specialAwards) store.hackathon.specialAwards = specialAwards;

  broadcastSSE("hackathon_updated", store.hackathon);
  res.json({ hackathon: store.hackathon });
});

// Create Team
app.post("/api/teams/create", (req, res) => {
  const { name, tag, description, captainId, lookingForRoles } = req.body;
  const captain = store.users.find(u => u.id === captainId);
  if (!captain) {
    return res.status(404).json({ error: "Капитан не найден" });
  }

  const teamId = `team-${Date.now()}`;
  const colors = ["#10b981", "#8b5cf6", "#06b6d4", "#ec4899", "#f59e0b", "#3b82f6"];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newTeam: Team = {
    id: teamId,
    hackathonId: store.hackathon.id,
    name,
    tag: (tag || name.slice(0, 5)).toUpperCase(),
    description: description || "Команда на Вайбатон №2",
    avatarColor,
    captainId,
    members: [
      {
        userId: captain.id,
        name: captain.name,
        avatar: captain.avatar,
        roleInTeam: captain.primaryRole || "Team Lead",
        isCaptain: true
      }
    ],
    lookingForRoles: lookingForRoles || [],
    isOpen: true,
    activityCount: 1,
    createdAt: new Date().toISOString()
  };

  store.teams.push(newTeam);
  captain.teamId = teamId;

  recordEvent("TEAM_CREATED", `Команда ${newTeam.name} создана`, {
    actorId: captain.id,
    actorName: captain.name,
    teamId: newTeam.id,
    teamName: newTeam.name
  });

  res.json({ team: newTeam });
});

// Join Team
app.post("/api/teams/join", (req, res) => {
  const { teamId, userId, roleInTeam } = req.body;
  const team = store.teams.find(t => t.id === teamId);
  const user = store.users.find(u => u.id === userId);

  if (!team || !user) {
    return res.status(404).json({ error: "Команда или пользователь не найдены" });
  }

  if (team.members.length >= store.hackathon.maxTeamSize) {
    return res.status(400).json({ error: "В команде достигнут лимит участников" });
  }

  if (!team.members.some(m => m.userId === userId)) {
    team.members.push({
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      roleInTeam: roleInTeam || user.primaryRole || "Участник",
      isCaptain: false
    });
    user.teamId = team.id;
    team.activityCount += 2;

    recordEvent("TEAM_INVITE", `${user.name} вступил в команду ${team.name}`, {
      actorId: user.id,
      actorName: user.name,
      teamId: team.id,
      teamName: team.name
    });
  }

  res.json({ team });
});

// Create or Update Project
app.post("/api/projects/upsert", (req, res) => {
  const { id, title, tagline, description, tags, demoUrl, repoUrl, videoUrl, instructions, status, authorId, teamId } = req.body;
  const author = store.users.find(u => u.id === authorId);

  let existing = store.projects.find(p => p.id === id);

  if (existing) {
    existing.title = title || existing.title;
    existing.tagline = tagline || existing.tagline;
    existing.description = description || existing.description;
    existing.tags = tags || existing.tags;
    existing.demoUrl = demoUrl !== undefined ? demoUrl : existing.demoUrl;
    existing.repoUrl = repoUrl !== undefined ? repoUrl : existing.repoUrl;
    existing.videoUrl = videoUrl !== undefined ? videoUrl : existing.videoUrl;
    existing.instructions = instructions !== undefined ? instructions : existing.instructions;
    
    if (status && status !== existing.status) {
      existing.status = status;
      if (status === "MVP" && !existing.mvpTimestamp) {
        existing.mvpTimestamp = new Date().toISOString();
        recordEvent("MVP_MARKED", `🚀 Проект "${existing.title}" достиг статуса рабочего MVP!`, {
          actorId: existing.authorId,
          actorName: existing.authorName,
          teamId: existing.teamId,
          teamName: existing.teamName,
          projectId: existing.id,
          projectTitle: existing.title
        });
      } else if (status === "DEMO") {
        recordEvent("DEMO_POSTED", `🎬 Для проекта "${existing.title}" опубликовано интерактивное демо!`, {
          actorId: existing.authorId,
          actorName: existing.authorName,
          projectId: existing.id,
          projectTitle: existing.title
        });
      }
    }
    existing.updatedAt = new Date().toISOString();
    broadcastSSE("project_updated", existing);
    return res.json({ project: existing });
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    hackathonId: store.hackathon.id,
    teamId: teamId || undefined,
    teamName: teamId ? store.teams.find(t => t.id === teamId)?.name : undefined,
    authorId: authorId || "usr-1",
    authorName: author?.name || "Участник",
    authorAvatar: author?.avatar,
    title: title || "Новый проект",
    tagline: tagline || "Проект на Вайбатоне",
    description: description || "Описание в процессе наполнения...",
    tags: tags || ["TypeScript", "AI"],
    status: status || "IDEA",
    demoUrl: demoUrl || "",
    repoUrl: repoUrl || "",
    videoUrl: videoUrl || "",
    instructions: instructions || "",
    screenshots: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.projects.push(newProject);
  if (teamId) {
    const t = store.teams.find(tm => tm.id === teamId);
    if (t) t.projectId = newProject.id;
  }

  recordEvent("PROJECT_CREATED", `Опубликован новый проект: "${newProject.title}"`, {
    actorId: newProject.authorId,
    actorName: newProject.authorName,
    teamId: newProject.teamId,
    teamName: newProject.teamName,
    projectId: newProject.id,
    projectTitle: newProject.title
  });

  res.json({ project: newProject });
});

// Create Devlog Progress Post (Fast 30-sec posting!)
app.post("/api/posts/create", (req, res) => {
  const { projectId, authorId, content, polishedContent, mediaType, mediaUrl, status, milestone, category } = req.body;
  const project = store.projects.find(p => p.id === projectId);
  const author = store.users.find(u => u.id === authorId);

  if (!content) {
    return res.status(400).json({ error: "Текст обновления не может быть пустым" });
  }

  const postId = `post-${Date.now()}`;
  const newPost: ProgressPost = {
    id: postId,
    hackathonId: store.hackathon.id,
    projectId: projectId || (author?.teamId ? store.projects.find(p => p.teamId === author.teamId)?.id || "proj-1" : "proj-1"),
    projectTitle: project?.title || "Проект Вайбатона",
    teamId: author?.teamId,
    teamName: author?.teamId ? store.teams.find(t => t.id === author.teamId)?.name : undefined,
    authorId: authorId || "usr-1",
    authorName: author?.name || "Участник",
    authorAvatar: author?.avatar,
    content,
    polishedContent: polishedContent || content,
    mediaType: mediaType || undefined,
    mediaUrl: mediaUrl || undefined,
    status: status || project?.status || "BUILDING",
    milestone: milestone || "Обновление",
    category: category || "architecture",
    reactions: {},
    commentsCount: 0,
    createdAt: new Date().toISOString()
  };

  store.posts.unshift(newPost);

  // Update project status if specified
  if (project && status && status !== project.status) {
    project.status = status;
    project.updatedAt = new Date().toISOString();
  }

  // Update team activity count
  if (author?.teamId) {
    const t = store.teams.find(team => team.id === author.teamId);
    if (t) t.activityCount += 3;
  }

  recordEvent("PROGRESS_POSTED", `${newPost.authorName} опубликовал Devlog: "${newPost.milestone || 'Обновление'}"`, {
    actorId: newPost.authorId,
    actorName: newPost.authorName,
    teamId: newPost.teamId,
    teamName: newPost.teamName,
    projectId: newPost.projectId,
    projectTitle: newPost.projectTitle
  });

  broadcastSSE("post_created", newPost);
  res.json({ post: newPost });
});

// React to Post
app.post("/api/posts/react", (req, res) => {
  const { postId, emoji, userId } = req.body;
  const post = store.posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Пост не найден" });
  }

  if (!post.reactions[emoji]) {
    post.reactions[emoji] = [];
  }

  const idx = post.reactions[emoji].indexOf(userId);
  if (idx > -1) {
    post.reactions[emoji].splice(idx, 1);
    if (post.reactions[emoji].length === 0) {
      delete post.reactions[emoji];
    }
  } else {
    post.reactions[emoji].push(userId);
  }

  broadcastSSE("post_reaction_updated", { postId, reactions: post.reactions });
  res.json({ post });
});

// Add Comment to Post
app.post("/api/posts/comment", (req, res) => {
  const { postId, authorId, content } = req.body;
  const post = store.posts.find(p => p.id === postId);
  const author = store.users.find(u => u.id === authorId);

  if (!post || !content) {
    return res.status(400).json({ error: "Некорректные параметры" });
  }

  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    postId,
    authorId: authorId || "usr-1",
    authorName: author?.name || "Участник",
    authorAvatar: author?.avatar,
    content,
    createdAt: new Date().toISOString()
  };

  store.comments.push(newComment);
  post.commentsCount += 1;

  broadcastSSE("comment_added", newComment);
  res.json({ comment: newComment, post });
});

// Send Chat Message
app.post("/api/chat/send", (req, res) => {
  const { authorId, content } = req.body;
  const author = store.users.find(u => u.id === authorId);

  if (!content) {
    return res.status(400).json({ error: "Текст сообщения не может быть пустым" });
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    hackathonId: store.hackathon.id,
    authorId: authorId || "guest",
    authorName: author?.name || "Гость",
    authorAvatar: author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=guest`,
    authorRole: author?.role || "guest",
    content,
    createdAt: new Date().toISOString()
  };

  store.chatMessages.push(newMsg);
  if (store.chatMessages.length > 200) store.chatMessages.shift();

  broadcastSSE("chat_message", newMsg);
  res.json({ message: newMsg });
});

// Pin / Unpin Chat Message (Organizer)
app.post("/api/chat/pin", (req, res) => {
  const { messageId } = req.body;
  const msg = store.chatMessages.find(m => m.id === messageId);
  if (msg) {
    msg.isPinned = !msg.isPinned;
    broadcastSSE("chat_pinned", msg);
  }
  res.json({ success: true, message: msg });
});

// Submit Final Project
app.post("/api/submissions/create", (req, res) => {
  const { projectId, authorId, title, description, demoUrl, repoUrl, videoUrl, launchInstructions, techStack, checklist } = req.body;
  const project = store.projects.find(p => p.id === projectId);
  const author = store.users.find(u => u.id === authorId);

  if (!repoUrl || !demoUrl || !title) {
    return res.status(400).json({ error: "Пожалуйста, заполните все обязательные поля (GitHub, Demo URL, Название)" });
  }

  const subId = `sub-${Date.now()}`;
  const submission: Submission = {
    id: subId,
    hackathonId: store.hackathon.id,
    projectId: projectId || project?.id || `proj-${Date.now()}`,
    teamId: author?.teamId,
    teamName: author?.teamId ? store.teams.find(t => t.id === author.teamId)?.name : undefined,
    authorId: authorId || "usr-1",
    authorName: author?.name || "Участник",
    title,
    description: description || project?.description || "",
    demoUrl,
    repoUrl,
    videoUrl: videoUrl || "",
    launchInstructions: launchInstructions || "",
    techStack: Array.isArray(techStack) ? techStack : (project?.tags || []),
    checklist: checklist || {
      mvpWorks: true,
      demoAvailable: true,
      repoAvailable: true,
      instructionsAdded: true,
      videoAdded: !!videoUrl
    },
    status: "SUBMITTED",
    submittedAt: new Date().toISOString()
  };

  store.submissions.push(submission);

  if (project) {
    project.status = "SUBMITTED";
    project.demoUrl = demoUrl;
    project.repoUrl = repoUrl;
    if (videoUrl) project.videoUrl = videoUrl;
    project.submittedTimestamp = submission.submittedAt;
    project.updatedAt = submission.submittedAt;
  }

  recordEvent("SUBMISSION_CREATED", `🏁 ${submission.teamName || submission.authorName} сдали финальную работу "${submission.title}"!`, {
    actorId: submission.authorId,
    actorName: submission.authorName,
    teamId: submission.teamId,
    teamName: submission.teamName,
    projectId: submission.projectId,
    projectTitle: submission.title
  });

  broadcastSSE("submission_created", submission);
  res.json({ submission });
});

// Submit Judgement Score (Judge)
app.post("/api/judgements/submit", (req, res) => {
  const { submissionId, judgeId, scores, feedback } = req.body;
  const judge = store.users.find(u => u.id === judgeId);
  const sub = store.submissions.find(s => s.id === submissionId);

  if (!sub || !judge) {
    return res.status(404).json({ error: "Заявка или судья не найдены" });
  }

  let totalScore = 0;
  for (const key in scores) {
    totalScore += Number(scores[key]) || 0;
  }

  // Check if this judge already evaluated
  const existingIdx = store.judgements.findIndex(j => j.submissionId === submissionId && j.judgeId === judgeId);
  
  const judgementItem: Judgement = {
    id: existingIdx > -1 ? store.judgements[existingIdx].id : `judge-${Date.now()}`,
    hackathonId: store.hackathon.id,
    submissionId,
    projectId: sub.projectId,
    projectTitle: sub.title,
    teamName: sub.teamName,
    judgeId,
    judgeName: judge.name,
    scores,
    totalScore,
    feedback: feedback || "",
    createdAt: new Date().toISOString()
  };

  if (existingIdx > -1) {
    store.judgements[existingIdx] = judgementItem;
  } else {
    store.judgements.push(judgementItem);
  }

  sub.status = "REVIEWED";

  broadcastSSE("judgement_submitted", judgementItem);
  res.json({ judgement: judgementItem });
});

// Publish Results (Organizer)
app.post("/api/hackathon/publish-results", (req, res) => {
  const { awards } = req.body;
  store.hackathon.stage = "RESULTS";
  
  if (awards && Array.isArray(awards)) {
    store.hackathon.specialAwards = awards;
  }

  recordEvent("RESULTS_PUBLISHED", `🏆 Результаты Вайбатона №2 официально опубликованы!`, {
    actorId: store.hackathon.organizerId,
    actorName: store.hackathon.organizerName
  });

  broadcastSSE("results_published", { hackathon: store.hackathon });
  res.json({ success: true, hackathon: store.hackathon });
});

// ----------------------------------------------------
// AI HOST & GEMINI ENGINE ENDPOINTS
// ----------------------------------------------------

// 1. Polish Devlog Post with AI (Helper, NOT replacing the human)
app.post("/api/ai/polish-post", async (req, res) => {
  const { rawText, status } = req.body;
  if (!rawText) return res.json({ polished: "", category: "architecture", milestone: "Обновление" });

  const ai = getGenAI();
  if (!ai) {
    // Fallback if no API key
    return res.json({
      polished: `🚀 ${rawText}`,
      milestone: rawText.slice(0, 30),
      category: "architecture"
    });
  }

  try {
    const prompt = `Ты — ассистент оформления Devlog-публикаций для хакатона "Вайбатон №2".
Участник написал сырой статус работы:
"${rawText}"
Текущий статус проекта: ${status || 'BUILDING'}.

Сделай:
1. Краткий, энергичный, четкий пост (1-2 предложения) с эмодзи в начале, без лишней "воды", сохраняющий смысл участника.
2. Короткий заголовок майлстоуна (2-4 слова).
3. Категорию из списка: architecture, ui, ai, mvp, demo, release, bugfix.

Ответь строго в формате JSON:
{
  "polished": "текст поста",
  "milestone": "заголовок вехи",
  "category": "одна из категорий"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("Error polishing post with Gemini:", error);
    res.json({
      polished: `⚡ ${rawText}`,
      milestone: rawText.slice(0, 25),
      category: "architecture"
    });
  }
});

// 2. Team Matching with AI
app.post("/api/ai/team-match", async (req, res) => {
  const { userId } = req.body;
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  const ai = getGenAI();
  const openTeams = store.teams.filter(t => t.isOpen && t.members.length < store.hackathon.maxTeamSize && (!user.teamId || t.id !== user.teamId));
  const soloUsers = store.users.filter(u => u.id !== userId && !u.teamId && u.role === "participant");

  if (!ai || (openTeams.length === 0 && soloUsers.length === 0)) {
    // Algorithmic fallback
    const suggestions: TeamMatchSuggestion[] = [];
    for (const t of openTeams) {
      suggestions.push({
        targetType: "team",
        targetId: t.id,
        targetName: t.name,
        matchScore: 85 + Math.floor(Math.random() * 12),
        matchReason: `Команда ищет роли: ${t.lookingForRoles.join(", ") || "разработчиков"} и отлично дополняет стек ${user.skills.slice(0, 2).join(", ")}.`,
        complementarySkills: t.lookingForRoles
      });
    }
    for (const u of soloUsers) {
      suggestions.push({
        targetType: "user",
        targetId: u.id,
        targetName: u.name,
        targetRole: u.primaryRole,
        targetAvatar: u.avatar,
        matchScore: 78 + Math.floor(Math.random() * 18),
        matchReason: `${u.name} специализируется на ${u.primaryRole} (${u.skills.slice(0, 2).join(", ")}) и ищет ${u.lookingFor.join(", ") || "команду"}.`,
        complementarySkills: u.skills
      });
    }
    return res.json({ suggestions: suggestions.slice(0, 4) });
  }

  try {
    const prompt = `Ты — AI-хост хакатона "Вайбатон №2". Помоги участнику найти синергичную команду или напарника.
Профиль участника:
- Имя: ${user.name}
- Роль: ${user.primaryRole}
- Навыки: ${user.skills.join(", ")}
- Стек: ${user.stack.join(", ")}
- Ищет: ${user.lookingFor.join(", ")}
- О себе: ${user.bio}

Открытые команды:
${JSON.stringify(openTeams.map(t => ({ id: t.id, name: t.name, lookingFor: t.lookingForRoles, members: t.members.map(m => m.roleInTeam) })))}

Одиночные участники:
${JSON.stringify(soloUsers.map(u => ({ id: u.id, name: u.name, role: u.primaryRole, skills: u.skills, lookingFor: u.lookingFor })))}

Сформируй 2-4 наиболее совместимых предложения (команды или пользователи). Рассчитай процент совпадения и обоснуй синергию.

Ответь строго JSON-массивом:
[
  {
    "targetType": "team" | "user",
    "targetId": "id",
    "targetName": "название",
    "targetRole": "роль (если user)",
    "matchScore": 85,
    "matchReason": "краткое объяснение синергии",
    "complementarySkills": ["навыки"]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const suggestions = JSON.parse(response.text || "[]");
    res.json({ suggestions });
  } catch (error) {
    console.error("AI Match error:", error);
    res.json({
      suggestions: [
        {
          targetType: "team",
          targetId: openTeams[0]?.id || "team-1",
          targetName: openTeams[0]?.name || "Team Pulse",
          matchScore: 88,
          matchReason: "Высокая совместимость по стеку и дополняемость команды.",
          complementarySkills: ["TypeScript", "AI"]
        }
      ]
    });
  }
});

// 3. AI Host Live Broadcast Engine (Strictly Context-Grounded, NO judging)
app.post("/api/ai/host-broadcast", async (req, res) => {
  const { triggerReason } = req.body;
  const ai = getGenAI();

  const stats = {
    participants: store.users.filter(u => u.role === "participant").length,
    teams: store.teams.length,
    projects: store.projects.length,
    mvps: store.projects.filter(p => p.status === "MVP" || p.status === "DEMO" || p.status === "SUBMITTED").length,
    submissions: store.submissions.length,
    progressPosts: store.posts.length,
    hoursLeft: Math.max(0, Math.round((new Date(store.hackathon.submissionDeadline).getTime() - Date.now()) / (1000 * 60 * 60)))
  };

  const recentEvents = store.events.slice(0, 8).map(e => `[${e.type}] ${e.message}`);
  const topActive = computeLeaderboard().slice(0, 3).map(l => `${l.name} (${l.eventsCount} событий)`).join(", ");

  let content = "";
  let title = "СВОДКА AI HOST";

  if (!ai) {
    // Grounded deterministic template
    content = `В эфире AI Host Вайбатона №2.\n\nСейчас в соревновании:\n${stats.participants} участников\n${stats.teams} команд\n${stats.mvps} работающих MVP\n${stats.progressPosts} записей в Devlog.\n\nЛидеры по пульсу активности: ${topActive}.\nДо дедлайна осталось ${stats.hoursLeft} часов. Продолжайте собирать и делиться обновлениями!`;
  } else {
    try {
      const prompt = `Ты — официальный AI Host (AI-ведущий) прямого эфира онлайн-хакатона "Вайбатон №2".

ВНИМАНИЕ: ТЫ НЕ СУДЬЯ!
- НЕ объявляй победителей самостоятельно.
- НЕ оценивай качество проектов.
- НЕ выдумывай ложных фактов или цифр.

Твоя роль: динамичный, бодрый, харизматичный ведущий живого кибер-ивента. Ты создаешь ощущение масштабного события, подбадриваешь участников, освещаешь реальные цифры и вехи.

ДАННЫЕ СОБЫТИЯ:
- Тема: "${store.hackathon.theme}"
- Этап: ${store.hackathon.stage}
- Участников: ${stats.participants}
- Команд: ${stats.teams}
- Проектов: ${stats.projects}
- Опубликованных MVP: ${stats.mvps}
- Финальных сдач: ${stats.submissions}
- Публикаций в Devlog: ${stats.progressPosts}
- Часов до дедлайна: ${stats.hoursLeft}
- Топ по активности: ${topActive}
- Последние события:
${recentEvents.join("\n")}
- Причина триггера: ${triggerReason || "Регулярный дайджест"}

Напиши короткую яркую реплику ведущего (3-6 емких абзацев/предложений с цифрами и призывом к действию) и броский заголовок в верхнем регистре.

Ответь строго JSON:
{
  "title": "ЗАГОЛОВОК СВОДКИ",
  "content": "Текст речи ведущего..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      title = parsed.title || title;
      content = parsed.content || content;
    } catch (e) {
      console.error("AI Host generation error:", e);
      content = `Вайбатон №2 в самом разгаре! На данный момент зафиксировано ${stats.progressPosts} обновлений от ${stats.teams} команд. До дедлайна ${stats.hoursLeft}ч.`;
    }
  }

  const newAIMessage: AIHostMessage = {
    id: `aimsg-${Date.now()}`,
    hackathonId: store.hackathon.id,
    trigger: triggerReason || "MANUAL_BROADCAST",
    title,
    content,
    statsSnapshot: stats,
    isPinned: true,
    createdAt: new Date().toISOString()
  };

  store.aiMessages.unshift(newAIMessage);
  recordEvent("AI_HOST_BROADCAST", `🎙️ AI Host: "${title}"`, {
    actorName: "AI Host"
  });

  broadcastSSE("ai_host_message", newAIMessage);
  res.json({ message: newAIMessage });
});

// 4. Ask AI Host (Interactive Q&A strictly grounded in the event with Persona support)
app.post("/api/ai/ask-host", async (req, res) => {
  const { question, userId, persona } = req.body;
  const user = store.users.find(u => u.id === userId);

  if (!question) {
    return res.status(400).json({ error: "Вопрос не может быть пустым" });
  }

  const ai = getGenAI();
  const contextData = {
    hackathon: {
      title: store.hackathon.title,
      theme: store.hackathon.theme,
      stage: store.hackathon.stage,
      deadline: store.hackathon.submissionDeadline,
      rules: store.hackathon.rules,
      criteria: store.hackathon.criteria,
      specialAwards: store.hackathon.specialAwards
    },
    stats: {
      participants: store.users.length,
      teams: store.teams.length,
      projects: store.projects.length,
      submissions: store.submissions.length,
      postsCount: store.posts.length
    },
    recentDevlogs: store.posts.slice(0, 3).map(p => ({ author: p.authorName, team: p.teamName, content: p.content, milestone: p.milestone })),
    currentUser: user ? { name: user.name, role: user.role, teamId: user.teamId, skills: user.skills } : null
  };

  const personaPrompt = persona === "mentor"
    ? "Твоя роль — TECH MENTOR (Технический архитектор). Фокусируйся на архитектуре, выборе стека, минимизации багов и быстром достижении статуса MVP."
    : persona === "roast"
    ? "Твоя роль — ROAST & VIBE CHECK (Дерзкий, энергичный критик). Подстегивай участников, оценивай темп с иронией и хакерским юмором, заряжай мотивацией."
    : persona === "timekeeper"
    ? "Твоя роль — CHRONO KEEPER (Строгий хранитель времени). Фокусируйся на дедлайнах, тайминге, чеклисте сдачи и отсечении лишних фичей."
    : "Твоя роль — LIVE STREAMER (Официальный AI Host эфира). Бодрый, харизматичный кибер-ведущий, который держит руку на пульсе Вайбатона.";

  if (!ai) {
    return res.json({
      answer: `[AI HOST // ${persona || 'STREAMER'}]: До дедлайна осталось несколько дней, тема — "${store.hackathon.theme}". Не забудьте загрузить работающий MVP, видео до 3 минут и инструкцию.`
    });
  }

  try {
    const prompt = `Ты — живая AI-сущность (AI Host) онлайн-хакатона "Вайбатон №2" в Fix-Ed.
${personaPrompt}

ПРАВИЛА И ОГРАНИЧЕНИЯ:
- Отвечай лаконично, емко (2-4 предложения или четкий список из 3 пунктов), энергично, в киберпанк/хакатон стиле.
- Используй только реальные факты из контекста ниже.
- НЕ суди и не выставляй субъективные баллы проектам за судей.

КОНТЕКСТ ХАКАТОНА:
${JSON.stringify(contextData, null, 2)}

ВОПРОС / РЕПЛИКА:
"${question}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt
    });

    res.json({ answer: response.text });
  } catch (e) {
    console.error("Ask AI Host error:", e);
    res.json({ answer: "Вайбатон №2 продолжается! Изучите правила в шапке и публикуйте Devlog в реальном времени." });
  }
});

// 5. AI Final Show Recap (Full narrative recap of the hackathon based on actual facts)
app.post("/api/ai/final-recap", async (req, res) => {
  const ai = getGenAI();
  const stats = {
    totalParticipants: store.users.filter(u => u.role === "participant").length,
    totalTeams: store.teams.length,
    totalProjects: store.projects.length,
    totalPosts: store.posts.length,
    mvpCount: store.projects.filter(p => p.status === "MVP" || p.status === "DEMO" || p.status === "SUBMITTED").length,
    submissionsCount: store.submissions.length,
    firstMvpTeam: "Team Pulse",
    firstMvpTime: "через 24 часа после старта"
  };

  // Top scored submission by human judges
  let winnerTitle = "PulseOS: Live Vibeathon Station";
  let winnerTeam = "Team Pulse";
  if (store.judgements.length > 0) {
    const scoresBySub: Record<string, { total: number, count: number, title: string, team: string }> = {};
    for (const j of store.judgements) {
      if (!scoresBySub[j.submissionId]) {
        scoresBySub[j.submissionId] = { total: 0, count: 0, title: j.projectTitle, team: j.teamName || "" };
      }
      scoresBySub[j.submissionId].total += j.totalScore;
      scoresBySub[j.submissionId].count += 1;
    }
    const sorted = Object.values(scoresBySub).sort((a, b) => (b.total / b.count) - (a.total / a.count));
    if (sorted[0]) {
      winnerTitle = sorted[0].title;
      winnerTeam = sorted[0].team;
    }
  }

  if (!ai) {
    return res.json({
      summary: `7 дней назад начался Вайбатон №2 на тему "${store.hackathon.theme}". За это время ${stats.totalParticipants} участников объединились в ${stats.totalTeams} команд, опубликовали ${stats.totalPosts} обновлений прогресса и создали ${stats.submissionsCount} законченных решений. По решению экспертного жюри победил проект ${winnerTitle} (${winnerTeam}).`,
      highlights: [
        `Первый рабочий MVP появился от ${stats.firstMvpTeam}`,
        `Опубликовано ${stats.totalPosts} записей в ленту Devlog`,
        `Все ${stats.submissionsCount} финальных работ прошли проверку жюри`
      ],
      statsHighlight: stats,
      winnerStory: `Проект ${winnerTitle} продемонстрировал непрерывную динамику и полное соответствие критериям хакатона.`,
      closingWords: "Вайбатон №2 завершен. Но история этого соревнования и созданные продукты остаются с нами!"
    });
  }

  try {
    const prompt = `Ты — AI Host хакатона "Вайбатон №2". Хакатон завершен, экспертное жюри выставило свои оценки.
Твоя задача — создать эпичный, кинематографичный итоговый обзор недели (AI Final Show).
Это НЕ твоя субъективная оценка, а хроника реальных событий и подведение итогов работы участников.

РЕАЛЬНЫЕ ДАННЫЕ:
- Статистика: ${JSON.stringify(stats)}
- Победитель по вердикту экспертного жюри: ${winnerTitle} (Команда: ${winnerTeam})
- Особые номинации: ${JSON.stringify(store.hackathon.specialAwards)}

Сформируй итоговый рассказ.
Ответь строго JSON:
{
  "summary": "Главный абзац истории недели...",
  "highlights": ["Хайлайт 1", "Хайлайт 2", "Хайлайт 3"],
  "statsHighlight": ${JSON.stringify(stats)},
  "winnerStory": "История победы проекта...",
  "closingWords": "Финальная вдохновляющая фраза ведущего..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const recap = JSON.parse(response.text || "{}");
    res.json(recap);
  } catch (e) {
    console.error("AI Final Recap error:", e);
    res.json({
      summary: `Вайбатон №2 подошел к концу! ${stats.totalParticipants} участников создали ${stats.submissionsCount} проектов.`,
      highlights: ["Активная разработка", "Регулярный Devlog", "Сплоченная работа команд"],
      statsHighlight: stats,
      winnerStory: `Победителем признан проект ${winnerTitle}`,
      closingWords: "Вайбатон закончился. Но его история осталась."
    });
  }
});

// Reset Store with Fresh Demo Seed
app.post("/api/seed/reset", (req, res) => {
  store = generateInitialStore();
  broadcastSSE("store_reset", { success: true });
  res.json({ success: true, message: "Demo данные успешно перезагружены" });
});

// ----------------------------------------------------
// SERVER LAUNCH & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ Вайбатон OS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
