import React, { useState, useEffect, useMemo, useRef } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Radio,
  Pause,
  Play,
  Zap,
  Users,
  Clock,
  MessageSquare,
  Sparkles,
  Swords,
  Award,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  X,
  ExternalLink,
  ShieldAlert,
  Flame,
  Volume2
} from "lucide-react";
import { NotificationItem, EventItem } from "../types";
import { sound } from "../utils/audio";

export interface TickerItem {
  id: string;
  category: "TEAM" | "DEADLINE" | "MENTOR" | "DUEL" | "DEVLOG" | "AI_HOST" | "JUDGING" | "SYSTEM";
  badge: string;
  text: string;
  subtext?: string;
  timestamp: string;
  actionTab?: string;
  actionType?: "OPEN_SUBMISSION" | "OPEN_REGISTER" | "NAVIGATE" | "OPEN_CHAT";
  priority?: "low" | "normal" | "high" | "urgent";
}

interface LiveEventTickerProps {
  onNavigateToTab: (tab: string) => void;
  onOpenSubmission?: () => void;
  onOpenRegister?: () => void;
}

const DEFAULT_TICKER_ITEMS: TickerItem[] = [
  {
    id: "tick-deadline-1",
    category: "DEADLINE",
    badge: "ДЕДЛАЙН",
    text: "Submission window closing in 1h — проверьте статус MVP и деплой демо-стенда!",
    subtext: "18:00 UTC",
    timestamp: "Только что",
    actionType: "OPEN_SUBMISSION",
    actionTab: "projects",
    priority: "urgent"
  },
  {
    id: "tick-team-1",
    category: "TEAM",
    badge: "РЕГИСТРАЦИЯ",
    text: "New team registered: 'Team NeuralVibe' (Стек: Gemini 2.0 Flash + React 19)",
    subtext: "Капитан: @alex_dev",
    timestamp: "2 мин назад",
    actionType: "NAVIGATE",
    actionTab: "projects",
    priority: "normal"
  },
  {
    id: "tick-mentor-1",
    category: "MENTOR",
    badge: "МЕНТОР ОНЛАЙН",
    text: "Mentor joined chat: Алексей Романов (Senior AI Architect) подключился к #voice-consulting",
    subtext: "Канал: #general",
    timestamp: "4 мин назад",
    actionType: "NAVIGATE",
    actionTab: "chat",
    priority: "high"
  },
  {
    id: "tick-duel-1",
    category: "DUEL",
    badge: "1v1 BATTLE",
    text: "Cyber Duel #42: Иван Ковалев против Софии Морозовой — зрительское голосование открыто!",
    subtext: "Раунд 2 / 3",
    timestamp: "6 мин назад",
    actionType: "NAVIGATE",
    actionTab: "duel",
    priority: "high"
  },
  {
    id: "tick-devlog-1",
    category: "DEVLOG",
    badge: "DEVLOG",
    text: "Team Pulse опубликовала видео-демо: 'Realtime WebSockets + Live Speech синтез'",
    subtext: "12 реакций 🔥",
    timestamp: "9 мин назад",
    actionType: "NAVIGATE",
    actionTab: "devlog",
    priority: "normal"
  },
  {
    id: "tick-ai-1",
    category: "AI_HOST",
    badge: "AI HOST",
    text: "Телеметрия арены: 14 активных команд, 48 коммитов за час, средний пинг синхронизации 12ms",
    subtext: "System Nominal",
    timestamp: "12 мин назад",
    actionType: "NAVIGATE",
    actionTab: "live",
    priority: "normal"
  },
  {
    id: "tick-judge-1",
    category: "JUDGING",
    badge: "ЖЮРИ",
    text: "Судейская коллегия: 4 независимых эксперта сформировали шкалу оценки соответствия критериям",
    subtext: "Критерии: MVP, AI, UX",
    timestamp: "15 мин назад",
    actionType: "NAVIGATE",
    actionTab: "judging",
    priority: "normal"
  }
];

export const LiveEventTicker: React.FC<LiveEventTickerProps> = ({
  onNavigateToTab,
  onOpenSubmission,
  onOpenRegister
}) => {
  const {
    notifications,
    events,
    posts,
    hackathon,
    sseConnected,
    teams
  } = useHackathon();

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<"normal" | "slow" | "fast">("normal");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [simulatedItems, setSimulatedItems] = useState<TickerItem[]>([]);
  const [clickedItem, setClickedItem] = useState<TickerItem | null>(null);

  // Merge dynamic events & notifications from context with initial items
  const dynamicTickerItems = useMemo(() => {
    const customList: TickerItem[] = [];

    // 1. Check if deadline is approaching
    if (hackathon?.submissionDeadline) {
      const deadlineDate = new Date(hackathon.submissionDeadline).getTime();
      const now = Date.now();
      const diffHours = Math.max(0, Math.round((deadlineDate - now) / (1000 * 60 * 60)));
      if (diffHours > 0 && diffHours <= 6) {
        customList.push({
          id: "dyn-deadline-warning",
          category: "DEADLINE",
          badge: "ДЕДЛАЙН",
          text: `Submission window closing in ${diffHours}h! Проверьте заполнение чек-листа проекта.`,
          subtext: `${new Date(hackathon.submissionDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          timestamp: "Дедлайн",
          actionType: "OPEN_SUBMISSION",
          actionTab: "projects",
          priority: "urgent"
        });
      }
    }

    // 2. Add real notifications from context
    notifications.slice(0, 4).forEach((n) => {
      let cat: TickerItem["category"] = "SYSTEM";
      if (n.category === "mentor" || n.type.includes("MENTOR")) cat = "MENTOR";
      else if (n.category === "deadline" || n.type.includes("DEADLINE")) cat = "DEADLINE";
      else if (n.category === "ai" || n.type.includes("AI")) cat = "AI_HOST";

      customList.push({
        id: `dyn-notif-${n.id}`,
        category: cat,
        badge: cat === "MENTOR" ? "МЕНТОР" : cat === "DEADLINE" ? "ДЕДЛАЙН" : "ОБНОВЛЕНИЕ",
        text: `${n.title}: ${n.message}`,
        timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionTab: n.actionTab || (cat === "MENTOR" ? "chat" : "live"),
        actionType: "NAVIGATE",
        priority: n.priority || "normal"
      });
    });

    // 3. Add latest live event logs
    events.slice(0, 3).forEach((ev) => {
      let cat: TickerItem["category"] = "SYSTEM";
      let badge = "СОБЫТИЕ";
      let actionTab = "live";

      if (ev.type === "TEAM_CREATED") {
        cat = "TEAM";
        badge = "НОВАЯ КОМАНДА";
        actionTab = "projects";
      } else if (ev.type === "PROGRESS_POSTED") {
        cat = "DEVLOG";
        badge = "DEVLOG";
        actionTab = "devlog";
      } else if (ev.type === "DUEL_STARTED" || ev.type === "DUEL_CREATED") {
        cat = "DUEL";
        badge = "ДУЭЛЬ";
        actionTab = "duel";
      }

      customList.push({
        id: `dyn-ev-${ev.id}`,
        category: cat,
        badge,
        text: ev.message,
        timestamp: new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionTab,
        actionType: "NAVIGATE",
        priority: "normal"
      });
    });

    // 4. Combine simulated items + custom dynamic + defaults
    const combined = [...simulatedItems, ...customList, ...DEFAULT_TICKER_ITEMS];

    // Filter by unique texts to prevent clutter
    const seen = new Set<string>();
    const filteredUnique = combined.filter((item) => {
      const key = item.badge + item.text;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return filteredUnique;
  }, [notifications, events, hackathon, simulatedItems]);

  // Apply Category Filter if any
  const displayedItems = useMemo(() => {
    if (selectedFilter === "ALL") return dynamicTickerItems;
    return dynamicTickerItems.filter((i) => i.category === selectedFilter);
  }, [dynamicTickerItems, selectedFilter]);

  // Handler to trigger simulated event for instant live feel
  const handleTriggerSimulatedEvent = () => {
    sound.playBroadcastChime();
    const sampleSims: TickerItem[] = [
      {
        id: `sim-${Date.now()}-1`,
        category: "MENTOR",
        badge: "МЕНТОР В ЭФИРЕ",
        text: "Mentor joined chat: Дарья Смирнова (Staff ML Lead) начала разбор кейсов по RAG в чате!",
        subtext: "Канал: #ai-assist",
        timestamp: "Прямо сейчас",
        actionType: "NAVIGATE",
        actionTab: "chat",
        priority: "high"
      },
      {
        id: `sim-${Date.now()}-2`,
        category: "TEAM",
        badge: "НОВАЯ КОМАНДА",
        text: "New team registered: 'CyberAgents OS' (Стек: Python FastAPI + LangChain + Gemini)",
        subtext: "3 участника",
        timestamp: "Прямо сейчас",
        actionType: "NAVIGATE",
        actionTab: "projects",
        priority: "normal"
      },
      {
        id: `sim-${Date.now()}-3`,
        category: "DEADLINE",
        badge: "СРОЧНО",
        text: "Submission window closing in 45 min — Не забудьте прикрепить ссылку на репозиторий GitHub!",
        subtext: "Осталось 45м",
        timestamp: "Прямо сейчас",
        actionType: "OPEN_SUBMISSION",
        actionTab: "projects",
        priority: "urgent"
      },
      {
        id: `sim-${Date.now()}-4`,
        category: "DEVLOG",
        badge: "DEVLOG",
        text: "Team Solo Max опубликовал пост: 'Запустили WebRTC стриминг 60fps прямо в Telegram WebApp'",
        subtext: "Статус: MVP",
        timestamp: "Прямо сейчас",
        actionType: "NAVIGATE",
        actionTab: "devlog",
        priority: "normal"
      }
    ];

    const pick = sampleSims[Math.floor(Math.random() * sampleSims.length)];
    setSimulatedItems((prev) => [pick, ...prev.slice(0, 10)]);
  };

  // Handle clicking on an individual ticker item
  const handleItemClick = (item: TickerItem) => {
    sound.playClick();
    setClickedItem(item);

    if (item.actionType === "OPEN_SUBMISSION" && onOpenSubmission) {
      onOpenSubmission();
      return;
    }

    if (item.actionType === "OPEN_REGISTER" && onOpenRegister) {
      onOpenRegister();
      return;
    }

    if (item.actionTab) {
      onNavigateToTab(item.actionTab);
    }
  };

  // Speed duration mapping in seconds
  const speedDuration = speed === "slow" ? "65s" : speed === "fast" ? "22s" : "38s";

  const getCategoryColor = (cat: TickerItem["category"], priority?: string) => {
    if (priority === "urgent" || cat === "DEADLINE") {
      return "bg-[#DC2626] text-white border-[#DC2626]";
    }
    switch (cat) {
      case "MENTOR":
        return "bg-[#7C3AED] text-white border-[#7C3AED]";
      case "TEAM":
        return "bg-[#16A34A] text-white border-[#16A34A]";
      case "DUEL":
        return "bg-[#EA580C] text-white border-[#EA580C]";
      case "DEVLOG":
        return "bg-[#2563EB] text-white border-[#2563EB]";
      case "AI_HOST":
        return "bg-[#0284C7] text-white border-[#0284C7]";
      case "JUDGING":
        return "bg-[#CA8A04] text-white border-[#CA8A04]";
      default:
        return "bg-[#111113] text-[#F8F7F4] border-[#333]";
    }
  };

  const getCategoryIcon = (cat: TickerItem["category"]) => {
    switch (cat) {
      case "DEADLINE":
        return <Clock className="w-3 h-3 text-red-400" />;
      case "MENTOR":
        return <Users className="w-3 h-3 text-purple-300" />;
      case "TEAM":
        return <Zap className="w-3 h-3 text-green-400" />;
      case "DUEL":
        return <Swords className="w-3 h-3 text-orange-400" />;
      case "DEVLOG":
        return <Sparkles className="w-3 h-3 text-blue-300" />;
      case "AI_HOST":
        return <Radio className="w-3 h-3 text-cyan-300" />;
      case "JUDGING":
        return <Award className="w-3 h-3 text-amber-300" />;
      default:
        return <Radio className="w-3 h-3 text-white" />;
    }
  };

  if (isMinimized) {
    return (
      <div className="bg-[#111113] text-white px-4 py-1 flex items-center justify-between border-b border-[#2563EB]/40 font-mono text-[11px] select-none z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          <span className="font-bold text-[#F8F7F4] uppercase tracking-wider text-[10px]">
            [LIVE TICKER MINIMIZED]
          </span>
          <span className="text-[#888] text-[10px] hidden sm:inline">
            • {displayedItems.length} live-апдейтов в потоке
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="px-2 py-0.5 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-[10px] font-bold uppercase transition-colors"
        >
          Развернуть бегущую строку ↑
        </button>
      </div>
    );
  }

  return (
    <div
      id="persistent-live-event-ticker"
      className="sticky top-0 z-50 bg-[#111113] text-[#F8F7F4] border-b border-[#2563EB]/40 font-mono text-xs select-none shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-all"
    >
      <div className="flex items-center justify-between h-8 sm:h-9 relative overflow-hidden">
        {/* Left Fixed Badge / Status Indicator */}
        <div className="flex items-center gap-2 pl-3 sm:pl-4 pr-3 bg-[#111113] border-r border-[#333] shrink-0 z-20 h-full">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          </div>

          <div className="flex items-center gap-1.5 font-bold tracking-wider text-[10px] sm:text-[11px] text-white uppercase">
            <Radio className="w-3.5 h-3.5 text-[#2563EB] animate-pulse" />
            <span className="hidden md:inline text-[#2563EB]">ARENA</span>
            <span>LIVE</span>
          </div>

          <span className="text-[#444] text-[10px] hidden lg:inline">|</span>
          <span className="text-[9px] font-mono text-[#888] hidden lg:inline">
            {sseConnected ? "12ms" : "SYNC"}
          </span>
        </div>

        {/* Center: The Continuous Infinite Scrolling Marquee Track */}
        <div
          className="flex-1 overflow-hidden relative flex items-center h-full cursor-pointer group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          title="Нажмите на карточку события для быстрого перехода"
        >
          {/* Subtle Left/Right Fade Mask */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#111113] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#111113] to-transparent z-10 pointer-events-none" />

          {/* Marquee Wrapper with duplicated elements for seamless loop */}
          <div
            className="flex items-center whitespace-nowrap"
            style={{
              animation: `tickerSlide ${speedDuration} linear infinite`,
              animationPlayState: isPaused ? "paused" : "running"
            }}
          >
            {/* First Set of Items */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6">
              {displayedItems.map((item, idx) => (
                <div
                  key={`${item.id}-set1-${idx}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-2 hover:bg-[#222226] px-2 py-1 rounded transition-colors text-[11px] sm:text-xs shrink-0 group/item"
                >
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono border flex items-center gap-1 ${getCategoryColor(
                      item.category,
                      item.priority
                    )}`}
                  >
                    {getCategoryIcon(item.category)}
                    <span>{item.badge}</span>
                  </span>

                  <span className="font-medium text-[#EAE8E2] group-hover/item:text-white group-hover/item:underline">
                    {item.text}
                  </span>

                  {item.subtext && (
                    <span className="text-[10px] text-[#888] font-mono bg-[#1E1E22] px-1.5 py-0.2 rounded border border-[#333]">
                      {item.subtext}
                    </span>
                  )}

                  <span className="text-[10px] text-[#555] font-mono">
                    [{item.timestamp}]
                  </span>

                  <ChevronRight className="w-3 h-3 text-[#555] group-hover/item:text-[#2563EB] transition-colors" />

                  <span className="text-[#333] select-none ml-2">///</span>
                </div>
              ))}
            </div>

            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6" aria-hidden="true">
              {displayedItems.map((item, idx) => (
                <div
                  key={`${item.id}-set2-${idx}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-2 hover:bg-[#222226] px-2 py-1 rounded transition-colors text-[11px] sm:text-xs shrink-0 group/item"
                >
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono border flex items-center gap-1 ${getCategoryColor(
                      item.category,
                      item.priority
                    )}`}
                  >
                    {getCategoryIcon(item.category)}
                    <span>{item.badge}</span>
                  </span>

                  <span className="font-medium text-[#EAE8E2] group-hover/item:text-white group-hover/item:underline">
                    {item.text}
                  </span>

                  {item.subtext && (
                    <span className="text-[10px] text-[#888] font-mono bg-[#1E1E22] px-1.5 py-0.2 rounded border border-[#333]">
                      {item.subtext}
                    </span>
                  )}

                  <span className="text-[10px] text-[#555] font-mono">
                    [{item.timestamp}]
                  </span>

                  <ChevronRight className="w-3 h-3 text-[#555] group-hover/item:text-[#2563EB] transition-colors" />

                  <span className="text-[#333] select-none ml-2">///</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Quick Controls Toolbar */}
        <div className="flex items-center gap-1.5 pr-2 sm:pr-4 pl-2 bg-[#111113] border-l border-[#333] shrink-0 z-20 h-full">
          {/* Pause / Play Toggle Button */}
          <button
            onClick={() => {
              sound.playPop();
              setIsPaused(!isPaused);
            }}
            className={`p-1 text-[10px] uppercase font-bold border transition-colors flex items-center gap-1 ${
              isPaused
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-[#1E1E22] text-[#888] hover:text-white border-[#333]"
            }`}
            title={isPaused ? "Запустить прокрутку" : "Приостановить прокрутку"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Quick Simulation Trigger Button */}
          <button
            onClick={handleTriggerSimulatedEvent}
            className="p-1 text-[10px] bg-[#1E1E22] text-[#AAA] hover:text-white hover:bg-[#2563EB] border border-[#333] transition-colors flex items-center gap-1 font-bold uppercase"
            title="Сгенерировать live-событие (New Team, Mentor, Deadline)"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span className="hidden xl:inline text-[9px]">+ Pulse</span>
          </button>

          {/* Filter / Speed Settings Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowControls(!showControls)}
              className={`p-1 text-[10px] border transition-colors flex items-center gap-1 ${
                showControls || selectedFilter !== "ALL"
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-[#1E1E22] text-[#888] hover:text-white border-[#333]"
              }`}
              title="Фильтры и скорость бегущей строки"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {selectedFilter !== "ALL" && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>

            {/* Dropdown controls modal */}
            {showControls && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-[#111113] border-2 border-[#2563EB] shadow-[4px_4px_0px_#000000] p-3 z-50 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-[#333] pb-1.5">
                  <span className="font-bold text-[10px] text-white uppercase tracking-wider">
                    [НАСТРОЙКИ LIVE TICKER]
                  </span>
                  <button
                    onClick={() => setShowControls(false)}
                    className="text-[#888] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#888] uppercase font-bold">
                    Категория событий:
                  </label>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {[
                      { id: "ALL", label: "Все потоки" },
                      { id: "DEADLINE", label: "Дедлайны ⏳" },
                      { id: "MENTOR", label: "Менторы 🎓" },
                      { id: "TEAM", label: "Команды 🚀" },
                      { id: "DUEL", label: "Дуэли ⚔️" },
                      { id: "DEVLOG", label: "Devlog ⚡" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={`px-1.5 py-1 text-left uppercase text-[9px] font-bold border transition-colors ${
                          selectedFilter === f.id
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-[#1E1E22] text-[#AAA] border-[#333] hover:bg-[#2A2A30]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Controls */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#888] uppercase font-bold">
                    Скорость прокрутки:
                  </label>
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {[
                      { id: "slow", label: "Медленно" },
                      { id: "normal", label: "Нормально" },
                      { id: "fast", label: "Быстро" }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSpeed(s.id as any)}
                        className={`px-1.5 py-1 uppercase text-[9px] font-bold border text-center transition-colors ${
                          speed === s.id
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "bg-[#1E1E22] text-[#AAA] border-[#333] hover:bg-[#2A2A30]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="pt-2 border-t border-[#333] flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedFilter("ALL");
                      setSpeed("normal");
                      setIsPaused(false);
                    }}
                    className="text-[9px] text-[#888] hover:text-white underline uppercase"
                  >
                    Сбросить
                  </button>

                  <button
                    onClick={handleTriggerSimulatedEvent}
                    className="px-2 py-0.5 bg-[#2563EB] text-white text-[9px] font-bold uppercase hover:bg-[#1d4ed8]"
                  >
                    + Симулировать Pulse
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Minimize / Close Ticker button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-[#666] hover:text-white transition-colors"
            title="Свернуть бегущую строку"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
