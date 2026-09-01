import React, { useState, useEffect, useMemo } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  Code,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
  Target
} from "lucide-react";
import { sound } from "../utils/audio";
import type { HackathonStage, CompetitionEvent } from "../types";

export interface MilestoneItem {
  id: string;
  title: string;
  subtitle: string;
  targetTime: Date;
  stage: HackathonStage;
  icon: React.ElementType;
  description: string;
  actionText?: string;
  actionTab?: string;
  actionType?: "SUBMISSION" | "REGISTER" | "DEVLOG" | "NAVIGATE";
  isUrgent?: boolean;
}

export interface CountdownTimerProps {
  variant?: "hero" | "compact" | "hud" | "banner";
  customTargetTime?: string | Date;
  customTitle?: string;
  onOpenSubmission?: () => void;
  onOpenRegister?: () => void;
  onOpenDevlog?: () => void;
  onNavigateToTab?: (tab: string) => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  variant = "hero",
  customTargetTime,
  customTitle,
  onOpenSubmission,
  onOpenRegister,
  onOpenDevlog,
  onNavigateToTab,
  className = ""
}) => {
  const { hackathon, activeEventId, eventsList, currentUser, teams, projects, posts } = useHackathon();

  // Active competition event object
  const currentEvent: CompetitionEvent | null = useMemo(() => {
    return eventsList.find((e) => e.id === activeEventId) || hackathon;
  }, [eventsList, activeEventId, hackathon]);

  // Generate milestone timeline based on real event dates from HackathonProvider
  const milestones: MilestoneItem[] = useMemo(() => {
    if (!currentEvent) return [];

    const start = new Date(currentEvent.startTime || Date.now() - 2 * 24 * 3600 * 1000).getTime();
    const submission = new Date(currentEvent.submissionDeadline || Date.now() + 4 * 24 * 3600 * 1000).getTime();
    const end = new Date(currentEvent.endTime || Date.now() + 5 * 24 * 3600 * 1000).getTime();

    // Intermediate calculated checkpoints
    const duration = submission - start;
    const checkpoint1 = new Date(start + duration * 0.25);
    const checkpoint2 = new Date(start + duration * 0.65);
    const judgingEnd = new Date(submission + (end - submission) * 0.7);

    return [
      {
        id: "ms-reg",
        title: "Старт и регистрация",
        subtitle: "Team Kickoff",
        targetTime: new Date(start),
        stage: "REGISTRATION",
        icon: Users,
        description: "Формирование команд, выбор ролей и фиксация темы проекта.",
        actionText: "Регистрация",
        actionTab: "projects",
        actionType: "REGISTER"
      },
      {
        id: "ms-cp1",
        title: "Архитектурный чекпоинт",
        subtitle: "Architecture & Stack Lock",
        targetTime: checkpoint1,
        stage: "ACTIVE",
        icon: Code,
        description: "Утверждение стека, создание репозитория и первый devlog-пост.",
        actionText: "+ Devlog",
        actionTab: "devlog",
        actionType: "DEVLOG"
      },
      {
        id: "ms-cp2",
        title: "MVP Прототип Чекпоинт",
        subtitle: "Mid-Sprint Working Prototype",
        targetTime: checkpoint2,
        stage: "ACTIVE",
        icon: Sparkles,
        description: "Демонстрация базового функционала и прохождение автоматического аудита.",
        actionText: "+ Devlog",
        actionTab: "devlog",
        actionType: "DEVLOG"
      },
      {
        id: "ms-submission",
        title: "Финальный дедлайн сдачи",
        subtitle: "Submission & Code Freeze",
        targetTime: new Date(submission),
        stage: "SUBMISSION",
        icon: Send,
        description: "Деплой MVP, загрузка GitHub-репозитория и видео-презентации.",
        actionText: "Сдать проект",
        actionTab: "projects",
        actionType: "SUBMISSION",
        isUrgent: true
      },
      {
        id: "ms-judging",
        title: "Оценка жюри и коллегии",
        subtitle: "Jury & Peer Scoring",
        targetTime: judgingEnd,
        stage: "JUDGING",
        icon: ShieldAlert,
        description: "Проверка критериев: UI/UX, AI Core, Инновация, Стабильность.",
        actionText: "Судейство",
        actionTab: "judging",
        actionType: "NAVIGATE"
      },
      {
        id: "ms-finale",
        title: "Итоговое шоу и награждение",
        subtitle: "Grand Finale & Awards",
        targetTime: new Date(end),
        stage: "RESULTS",
        icon: Trophy,
        description: "Объявление победителей, распределение призового фонда и AI Recap.",
        actionText: "Таблица лидеров",
        actionTab: "leaderboard",
        actionType: "NAVIGATE"
      }
    ];
  }, [currentEvent]);

  // Selected or dynamic upcoming milestone
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);

  // Determine next active milestone
  const nextActiveMilestone = useMemo(() => {
    if (customTargetTime) {
      return {
        id: "custom",
        title: customTitle || "Целевой дедлайн",
        subtitle: "Event Milestone",
        targetTime: new Date(customTargetTime),
        stage: currentEvent?.stage || "ACTIVE",
        icon: Clock,
        description: "Время до наступления контрольной точки события.",
        actionText: "Сдать работу",
        actionType: "SUBMISSION" as const,
        isUrgent: true
      };
    }

    if (selectedMilestoneId) {
      const found = milestones.find((m) => m.id === selectedMilestoneId);
      if (found) return found;
    }

    const now = Date.now();
    // Find first milestone in future
    const upcoming = milestones.find((m) => m.targetTime.getTime() > now);
    // If all passed, pick the submission or last one
    return upcoming || milestones.find((m) => m.id === "ms-submission") || milestones[milestones.length - 1];
  }, [milestones, selectedMilestoneId, customTargetTime, customTitle, currentEvent]);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    totalMs: number;
    isExpired: boolean;
    percentProgress: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    totalMs: 0,
    isExpired: false,
    percentProgress: 0
  });

  useEffect(() => {
    if (!nextActiveMilestone) return;

    const targetMs = nextActiveMilestone.targetTime.getTime();
    const eventStartMs = new Date(currentEvent?.startTime || Date.now() - 24 * 3600 * 1000).getTime();
    const totalInterval = Math.max(1, targetMs - eventStartMs);

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          totalMs: 0,
          isExpired: true,
          percentProgress: 100
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((diff % 1000) / 100);

      const elapsed = Math.max(0, now - eventStartMs);
      const progress = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        totalMs: diff,
        isExpired: false,
        percentProgress: progress
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [nextActiveMilestone, currentEvent]);

  // Action Dispatcher
  const handleAction = (item: MilestoneItem) => {
    sound.playClick();
    if (item.actionType === "SUBMISSION" && onOpenSubmission) {
      onOpenSubmission();
      return;
    }
    if (item.actionType === "REGISTER" && onOpenRegister) {
      onOpenRegister();
      return;
    }
    if (item.actionType === "DEVLOG" && onOpenDevlog) {
      onOpenDevlog();
      return;
    }
    if (item.actionTab && onNavigateToTab) {
      onNavigateToTab(item.actionTab);
    }
  };

  // Urgency classification
  const isCriticalUrgent = !timeLeft.isExpired && timeLeft.totalMs < 2 * 60 * 60 * 1000; // < 2h
  const isWarningUrgent = !timeLeft.isExpired && timeLeft.totalMs < 24 * 60 * 60 * 1000; // < 24h

  // Formatted date string of the milestone
  const formattedMilestoneDate = useMemo(() => {
    if (!nextActiveMilestone) return "";
    return nextActiveMilestone.targetTime.toLocaleString("ru-RU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [nextActiveMilestone]);

  // COMPACT VARIANT
  if (variant === "compact") {
    return (
      <div
        id="compact-event-countdown"
        className={`bg-[#FFFFFF] border-2 border-[#111113] p-3 sm:p-4 shadow-[4px_4px_0px_#111113] font-mono select-none ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 border border-[#111113] ${isCriticalUrgent ? "bg-[#DC2626] text-white animate-pulse" : "bg-[#2563EB] text-white"}`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider">
                  [СЛЕДУЮЩИЙ РУБЕЖ]
                </span>
                {isCriticalUrgent && (
                  <span className="px-1.5 py-0.2 text-[9px] bg-[#DC2626] text-white font-bold uppercase animate-pulse">
                    CRITICAL
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#111113] uppercase truncate max-w-[280px]">
                {nextActiveMilestone?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 text-center">
              <div className="bg-[#F8F7F4] border border-[#111113] px-2 py-1 min-w-[38px]">
                <span className="font-display text-sm sm:text-base font-bold text-[#111113]">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="block text-[8px] text-[#666] uppercase font-bold">дн</span>
              </div>
              <span className="font-bold text-[#111113]">:</span>
              <div className="bg-[#F8F7F4] border border-[#111113] px-2 py-1 min-w-[38px]">
                <span className="font-display text-sm sm:text-base font-bold text-[#111113]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="block text-[8px] text-[#666] uppercase font-bold">час</span>
              </div>
              <span className="font-bold text-[#111113]">:</span>
              <div className="bg-[#F8F7F4] border border-[#111113] px-2 py-1 min-w-[38px]">
                <span className="font-display text-sm sm:text-base font-bold text-[#111113]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="block text-[8px] text-[#666] uppercase font-bold">мин</span>
              </div>
              <span className="font-bold text-[#111113]">:</span>
              <div className="bg-[#111113] border border-[#111113] px-2 py-1 min-w-[38px] shadow-[1px_1px_0px_#2563EB]">
                <span className="font-display text-sm sm:text-base font-bold text-[#2563EB]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="block text-[8px] text-[#F8F7F4] uppercase font-bold">сек</span>
              </div>
            </div>

            {nextActiveMilestone?.actionText && (
              <button
                onClick={() => nextActiveMilestone && handleAction(nextActiveMilestone)}
                className="px-3 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-[11px] font-bold uppercase border border-[#111113] shadow-[2px_2px_0px_#111113] active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap"
              >
                {nextActiveMilestone.actionText} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // HUD VARIANT
  if (variant === "hud") {
    return (
      <div
        id="hud-event-countdown"
        className={`bg-[#111113] text-[#F8F7F4] border-2 border-[#2563EB] p-4 shadow-[4px_4px_0px_#000000] font-mono select-none ${className}`}
      >
        <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-[10px] uppercase font-bold text-[#2563EB] tracking-wider">
              [HUD // NEXT_MILESTONE_LOCK]
            </span>
          </div>
          <span className="text-[10px] text-[#888] font-mono">{formattedMilestoneDate}</span>
        </div>

        <div className="mb-3">
          <div className="text-xs text-[#AAA] uppercase font-bold">{nextActiveMilestone?.title}</div>
          <div className="text-[10px] text-[#666]">{nextActiveMilestone?.subtitle}</div>
        </div>

        {/* Big HUD Segmented Display */}
        <div className="grid grid-cols-4 gap-2 text-center my-2">
          <div className="bg-[#1A1A1E] border border-[#333] p-2">
            <div className="text-2xl font-bold font-display text-white">{String(timeLeft.days).padStart(2, "0")}</div>
            <div className="text-[8px] text-[#888] uppercase">ДНЕЙ</div>
          </div>
          <div className="bg-[#1A1A1E] border border-[#333] p-2">
            <div className="text-2xl font-bold font-display text-white">{String(timeLeft.hours).padStart(2, "0")}</div>
            <div className="text-[8px] text-[#888] uppercase">ЧАСОВ</div>
          </div>
          <div className="bg-[#1A1A1E] border border-[#333] p-2">
            <div className="text-2xl font-bold font-display text-white">{String(timeLeft.minutes).padStart(2, "0")}</div>
            <div className="text-[8px] text-[#888] uppercase">МИНУТ</div>
          </div>
          <div className="bg-[#2563EB] border border-[#2563EB] p-2 shadow-[0_0_12px_rgba(37,99,235,0.4)]">
            <div className="text-2xl font-bold font-display text-white">{String(timeLeft.seconds).padStart(2, "0")}</div>
            <div className="text-[8px] text-white/90 uppercase font-bold">СЕКУНД</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[9px] text-[#888]">
            <span>ВРЕМЕННОЙ ПРОГРЕСС</span>
            <span className="text-[#2563EB] font-bold">{Math.round(timeLeft.percentProgress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#222] border border-[#444] overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{ width: `${timeLeft.percentProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // HERO HIGH-VISIBILITY INDUSTRIAL COCKPIT VARIANT (Default)
  return (
    <div
      id="high-visibility-event-countdown"
      className={`bg-[#FFFFFF] border-2 border-[#111113] p-5 sm:p-7 shadow-[6px_6px_0px_#111113] font-mono select-none ${className}`}
    >
      {/* Header Bar with Telemetry Indicators */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-[#111113] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full border border-[#111113] ${
              isCriticalUrgent
                ? "bg-[#DC2626] animate-ping"
                : isWarningUrgent
                ? "bg-[#CA8A04] animate-pulse"
                : "bg-[#10B981]"
            }`}
          />
          <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#111113]">
            [03] ВЫСОКОТОЧНЫЙ ТАЙМЕР РУБЕЖЕЙ
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-[#EFECE6] border border-[#111113] font-bold uppercase text-[#555] hidden md:inline">
            EVENT: {currentEvent?.title || "BATTLE ENGINE"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-[#666] font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>ДАТА РУБЕЖА: <strong className="text-[#111113]">{formattedMilestoneDate}</strong></span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setAudioFeedback(!audioFeedback);
            }}
            className={`p-1 border border-[#111113] text-[10px] transition-colors ${
              audioFeedback ? "bg-[#2563EB] text-white" : "bg-[#F8F7F4] text-[#666] hover:text-[#111113]"
            }`}
            title={audioFeedback ? "Звуковые сигналы включены" : "Включить звуковые сигналы"}
          >
            {audioFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main High-Visibility Segmented Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols: Giant Digital Numbers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#888] uppercase tracking-wider">
                ДО НАСТУПЛЕНИЯ:
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#2563EB] uppercase bg-[#EBF2FE] px-2 py-0.5 border border-[#2563EB]/40">
                {nextActiveMilestone?.title}
              </span>
            </div>

            {isCriticalUrgent && (
              <span className="px-2 py-0.5 text-[10px] bg-[#DC2626] text-white font-bold uppercase tracking-wider animate-bounce flex items-center gap-1 border border-[#111113]">
                <AlertTriangle className="w-3 h-3" />
                МЕНЕЕ 2 ЧАСОВ!
              </span>
            )}
          </div>

          {/* Segmented Clock Digits */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Days Block */}
            <div className="bg-[#F8F7F4] border-2 border-[#111113] p-3 sm:p-4 text-center shadow-[3px_3px_0px_#111113] relative overflow-hidden group">
              <div className="font-display text-4xl sm:text-6xl font-bold text-[#111113] leading-none tracking-tight">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-[#666] uppercase font-bold mt-2 tracking-widest">
                ДНЕЙ
              </div>
              <div className="absolute top-1 right-1 text-[8px] text-[#BBB] font-mono">D:00</div>
            </div>

            {/* Hours Block */}
            <div className="bg-[#F8F7F4] border-2 border-[#111113] p-3 sm:p-4 text-center shadow-[3px_3px_0px_#111113] relative overflow-hidden group">
              <div className="font-display text-4xl sm:text-6xl font-bold text-[#111113] leading-none tracking-tight">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-[#666] uppercase font-bold mt-2 tracking-widest">
                ЧАСОВ
              </div>
              <div className="absolute top-1 right-1 text-[8px] text-[#BBB] font-mono">H:24</div>
            </div>

            {/* Minutes Block */}
            <div className="bg-[#F8F7F4] border-2 border-[#111113] p-3 sm:p-4 text-center shadow-[3px_3px_0px_#111113] relative overflow-hidden group">
              <div className="font-display text-4xl sm:text-6xl font-bold text-[#111113] leading-none tracking-tight">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-[#666] uppercase font-bold mt-2 tracking-widest">
                МИНУТ
              </div>
              <div className="absolute top-1 right-1 text-[8px] text-[#BBB] font-mono">M:60</div>
            </div>

            {/* Seconds (Pulsing High Impact) Block */}
            <div
              className={`p-3 sm:p-4 text-center border-2 border-[#111113] relative overflow-hidden shadow-[3px_3px_0px_#111113] transition-all ${
                isCriticalUrgent
                  ? "bg-[#DC2626] text-white shadow-[3px_3px_0px_#7F1D1D]"
                  : "bg-[#111113] text-[#2563EB] shadow-[3px_3px_0px_#2563EB]"
              }`}
            >
              <div className="font-display text-4xl sm:text-6xl font-bold leading-none tracking-tight">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] sm:text-xs text-[#F8F7F4] uppercase font-bold mt-2 tracking-widest">
                СЕКУНД
              </div>
              <div className="absolute top-1 right-1 text-[8px] text-white/40 font-mono">
                .{timeLeft.milliseconds}s
              </div>
            </div>
          </div>

          {/* Progress Bar with Percentage and Elapsed Milestones */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#666]">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>ИНТЕРВАЛЬНЫЙ ПРОГРЕСС СТАДИИ</span>
              </span>
              <span className="text-[#111113] font-mono">
                {Math.round(timeLeft.percentProgress)}% ВЫПОЛНЕНО
              </span>
            </div>

            <div className="w-full h-3 bg-[#EFECE6] border-2 border-[#111113] overflow-hidden p-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  isCriticalUrgent
                    ? "bg-[#DC2626]"
                    : "bg-[#2563EB]"
                }`}
                style={{ width: `${timeLeft.percentProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Milestone Context Card & Primary Action CTA */}
        <div className="lg:col-span-5 bg-[#F8F7F4] border-2 border-[#111113] p-4 sm:p-5 shadow-[3px_3px_0px_#111113] flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[#888] border-b border-[#111113] pb-1.5 text-xs font-bold">
              <span className="text-[#111113] uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{nextActiveMilestone?.subtitle}</span>
              </span>
              <span className="px-1.5 py-0.2 bg-[#111113] text-[#F8F7F4] text-[9px] uppercase">
                {nextActiveMilestone?.stage}
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-[#111113] leading-snug">
              {nextActiveMilestone?.title}
            </h3>

            <p className="text-xs text-[#555] leading-relaxed">
              {nextActiveMilestone?.description}
            </p>

            {/* Quick stats contextual metrics */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#444]">
              <div className="bg-[#FFFFFF] border border-[#111113] p-2">
                <span className="text-[#888] block text-[9px] uppercase font-bold">КОМАНД:</span>
                <span className="font-bold text-[#111113]">{teams.length} активных</span>
              </div>
              <div className="bg-[#FFFFFF] border border-[#111113] p-2">
                <span className="text-[#888] block text-[9px] uppercase font-bold">DEVLOG:</span>
                <span className="font-bold text-[#111113]">{posts.length} отчетов</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          {nextActiveMilestone?.actionText && (
            <button
              onClick={() => handleAction(nextActiveMilestone)}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-[#111113] shadow-[3px_3px_0px_#111113] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{nextActiveMilestone.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Milestone Selector Strip */}
      <div className="mt-6 pt-5 border-t-2 border-[#111113]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#666] uppercase tracking-wider">
            [ВСЕ РУБЕЖИ И КОНТРОЛЬНЫЕ ТОЧКИ СОРЕВНОВАНИЯ]
          </span>
          <span className="text-[10px] text-[#888] font-mono">
            Кликните по рубежу для переключения таймера
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {milestones.map((m, idx) => {
            const isSelected = nextActiveMilestone?.id === m.id;
            const isPassed = m.targetTime.getTime() < Date.now();
            const IconComp = m.icon;

            return (
              <button
                key={m.id}
                onClick={() => {
                  sound.playPop();
                  setSelectedMilestoneId(m.id);
                }}
                className={`p-2.5 text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#111113] text-[#F8F7F4] border-[#111113] shadow-[3px_3px_0px_#2563EB] translate-y-[-2px]"
                    : isPassed
                    ? "bg-[#EFECE6] text-[#666] border-[#D5D2CA] hover:border-[#111113]"
                    : "bg-[#FFFFFF] text-[#111113] border-[#111113] hover:bg-[#F8F7F4]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold opacity-70">
                      0{idx + 1} // {m.stage}
                    </span>
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <IconComp className={`w-3 h-3 ${isSelected ? "text-[#2563EB]" : "text-[#888]"}`} />
                    )}
                  </div>
                  <div className="text-[11px] font-bold uppercase leading-tight line-clamp-1">
                    {m.title}
                  </div>
                </div>

                <div className="text-[9px] font-mono opacity-80 mt-2 border-t border-current/20 pt-1">
                  {m.targetTime.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}{" "}
                  {m.targetTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
