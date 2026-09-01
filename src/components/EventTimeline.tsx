import React from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Calendar, 
  Users, 
  Code, 
  Send, 
  Gavel, 
  Trophy,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { HackathonStage } from "../types";
import { CountdownTimer } from "./CountdownTimer";

interface EventTimelineProps {
  className?: string;
  onNavigateToTab?: (tab: string) => void;
}

interface PhaseInfo {
  id: HackathonStage;
  code: string;
  title: string;
  subtitle: string;
  timeframe: string;
  icon: React.ElementType;
  description: string;
  requirements: string[];
  metricsKey?: string;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ className = "", onNavigateToTab }) => {
  const { hackathon, teams, users, projects, submissions, judgements, posts } = useHackathon();

  const currentStage: HackathonStage = hackathon?.stage || "ACTIVE";

  const phases: PhaseInfo[] = [
    {
      id: "REGISTRATION",
      code: "PHASE_01",
      title: "Регистрация и сбор команд",
      subtitle: "Team Formation & Kickoff",
      timeframe: "Старт • Дни 1-2",
      icon: Users,
      description: "Формирование составов (соло или до 4 человек), выбор идеи и регистрация стэка разработки.",
      requirements: [
        "Создание профиля участника и выбор роли",
        "Объединение в команду или соло-участие",
        "Фиксация идеи проекта в системе"
      ],
      metricsKey: `${users.length} участников • ${teams.length} команд`
    },
    {
      id: "ACTIVE",
      code: "PHASE_02",
      title: "Активная разработка и Devlog",
      subtitle: "Sprint & Rapid Prototyping",
      timeframe: "Основной спринт • Дни 2-6",
      icon: Code,
      description: "Создание MVP, регулярные публикации микро-апдейтов в Devlog и участие в 1v1 дуэлях.",
      requirements: [
        "Публикация регулярных прогресс-постов (30 сек)",
        "Сборка работающего прототипа (MVP)",
        "Участие в телеметрии и дуэлях"
      ],
      metricsKey: `${posts.length} devlog-постов • ${projects.filter(p => ["MVP", "DEMO", "SUBMITTED"].includes(p.status)).length} MVP готово`
    },
    {
      id: "SUBMISSION",
      code: "PHASE_03",
      title: "Прием финальных работ",
      subtitle: "Submission & Code Freeze",
      timeframe: "Дедлайн • День 7 (18:00)",
      icon: Send,
      description: "Загрузка ссылки на GitHub-репозиторий, рабочий демо-стенд, видео-питч и инструкцию по запуску.",
      requirements: [
        "Открытый репозиторий с исходным кодом",
        "Рабочая ссылка на веб-демо / прод",
        "Скриншоты и краткий видео-обзор"
      ],
      metricsKey: `${submissions.length} проектов сдано на проверку`
    },
    {
      id: "JUDGING",
      code: "PHASE_04",
      title: "Судейство и экспертная оценка",
      subtitle: "Peer & Jury Evaluation",
      timeframe: "Финал • День 7 (18:00 - 21:00)",
      icon: Gavel,
      description: "Оценка проектов жюри и сообществом по 4 критериям: UI/UX, функционал, качество кода и оригинальность.",
      requirements: [
        "Проверка критериев: UI/UX, Code, Innovation",
        "Формирование независимых оценок жюри",
        "Автоматический аудит и выгрузка отчетов"
      ],
      metricsKey: `${judgements.length} оценок выставлено`
    },
    {
      id: "RESULTS",
      code: "PHASE_05",
      title: "Итоги, награждение и закрытие",
      subtitle: "Closing Ceremony & Awards",
      timeframe: "Финиш • День 7 (21:30)",
      icon: Trophy,
      description: "Объявление победителей состязания, вручение наград и публикация итогового подиума.",
      requirements: [
        "Публикация финального лидерборда",
        "Награждение топ-команд турнира",
        "Архивация результатов в единый реестр"
      ],
      metricsKey: "Финальный подиум и награды"
    }
  ];

  // Stage index mapping
  const stageOrder: HackathonStage[] = ["DRAFT", "REGISTRATION", "ACTIVE", "SUBMISSION", "JUDGING", "RESULTS"];
  const currentStageIndex = stageOrder.indexOf(currentStage);

  return (
    <div className={`bg-[#FFFFFF] border-2 border-[#1A1A1A] p-6 sm:p-7 shadow-[4px_4px_0px_#1A1A1A] font-mono text-[#1A1A1A] ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b-1.5 border-[#1A1A1A] pb-3 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center border border-[#1A1A1A] shadow-[2px_2px_0px_#E63946]">
            <Calendar className="w-4 h-4 text-[#E63946]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1A1A]">
                EVENT TIMELINE // КЛЮЧЕВЫЕ ЭТАПЫ
              </h3>
              <span className="px-1.5 py-0.2 text-[9px] bg-[#E63946] text-white font-bold border border-[#1A1A1A]">
                STEPPER
              </span>
            </div>
            <p className="text-[10px] text-[#666]">
              Таймлайн расписания, контрольные точки и текущий прогресс
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-[#666] bg-[#EFECE6] px-2 py-0.5 border border-[#1A1A1A]">
            ЭТАП: <strong className="text-[#E63946]">{currentStage}</strong>
          </span>
        </div>
      </div>

      {/* High-Visibility Next Milestone Countdown Banner */}
      <div className="mb-6">
        <CountdownTimer
          variant="compact"
          onNavigateToTab={onNavigateToTab}
        />
      </div>

      {/* Vertical Stepper Container */}
      <div className="relative pl-2 sm:pl-4 space-y-8">
        {/* Continuous background vertical line */}
        <div 
          className="absolute left-[23px] sm:left-[31px] top-4 bottom-6 w-[2px] bg-[#D5D2CA] -z-0"
        />

        {phases.map((phase, idx) => {
          const phaseIndex = stageOrder.indexOf(phase.id);
          const isPassed = currentStageIndex > phaseIndex;
          const isCurrent = currentStage === phase.id || (currentStage === "DRAFT" && phase.id === "REGISTRATION");
          const isPending = !isPassed && !isCurrent;
          const Icon = phase.icon;

          return (
            <div key={phase.id} className="relative flex items-start gap-4 sm:gap-6 group">
              {/* Stepper Node Bullet */}
              <div className="relative z-10 shrink-0">
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border-2 transition-all ${
                    isCurrent
                      ? "bg-[#E63946] text-white border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] ring-4 ring-[#E63946]/20 scale-105"
                      : isPassed
                      ? "bg-[#1A1A1A] text-[#F8F7F4] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                      : "bg-[#FFFFFF] text-[#888] border-[#1A1A1A] shadow-[2px_2px_0px_#D5D2CA]"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Icon className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <span className="text-xs font-bold text-[#888]">0{idx + 1}</span>
                  )}
                </div>
              </div>

              {/* Phase Content Box */}
              <div 
                className={`flex-1 p-4 sm:p-5 border-1.5 transition-all ${
                  isCurrent
                    ? "bg-[#F8F7F4] border-[#1A1A1A] shadow-[4px_4px_0px_#E63946]"
                    : isPassed
                    ? "bg-[#FFFFFF] border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]"
                    : "bg-[#FAFAFA] border-[#D5D2CA] opacity-80"
                }`}
              >
                {/* Top Meta Line */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#1A1A1A]/20 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 border ${
                      isCurrent
                        ? "bg-[#E63946] text-white border-[#1A1A1A]"
                        : isPassed
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#EFECE6] text-[#666] border-[#D5D2CA]"
                    }`}>
                      {phase.code}
                    </span>
                    <span className="text-xs text-[#666] font-bold">
                      {phase.timeframe}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#E63946] text-white border border-[#1A1A1A] animate-pulse">
                        <CircleDot className="w-3 h-3" />
                        ТЕКУЩИЙ ЭТАП
                      </span>
                    ) : isPassed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#1A1A1A] text-[#F8F7F4] border border-[#1A1A1A]">
                        [ЗАВЕРШЕН]
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-[#EFECE6] text-[#888] border border-[#D5D2CA]">
                        [ОЖИДАНИЕ]
                      </span>
                    )}
                  </div>
                </div>

                {/* Phase Main Title & Subtitle */}
                <div className="space-y-1">
                  <h4 className={`text-base sm:text-lg font-bold uppercase leading-tight ${
                    isCurrent ? "text-[#E63946]" : "text-[#1A1A1A]"
                  }`}>
                    {phase.title}
                  </h4>
                  <div className="text-[11px] text-[#666] uppercase font-bold">
                    // {phase.subtitle}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#444] mt-2 leading-relaxed">
                  {phase.description}
                </p>

                {/* Requirements / Checklist */}
                <div className="mt-3 pt-2.5 border-t border-[#1A1A1A]/10 space-y-1.5">
                  <div className="text-[9px] uppercase tracking-wider text-[#666] font-bold">
                    ЧЕКЛИСТ И ЗАДАЧИ ФАЗЫ:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    {phase.requirements.map((req, rIdx) => (
                      <div 
                        key={rIdx} 
                        className={`p-2 border text-[10px] leading-tight flex items-start gap-1.5 ${
                          isCurrent 
                            ? "bg-[#FFFFFF] border-[#1A1A1A] text-[#1A1A1A]" 
                            : isPassed 
                            ? "bg-[#F8F7F4] border-[#1A1A1A]/30 text-[#444]" 
                            : "bg-[#FFFFFF] border-[#D5D2CA] text-[#777]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 mt-1 shrink-0 ${
                          isCurrent ? "bg-[#E63946]" : isPassed ? "bg-[#1A1A1A]" : "bg-[#BBB]"
                        }`} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Metrics Footnote */}
                {phase.metricsKey && (
                  <div className="mt-3 pt-2 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] text-[#666] flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                      <Sparkles className="w-3 h-3 text-[#E63946]" />
                      <span>{phase.metricsKey}</span>
                    </span>

                    {isCurrent && onNavigateToTab && (
                      <button
                        onClick={() => {
                          if (phase.id === "ACTIVE") onNavigateToTab("devlog");
                          else if (phase.id === "SUBMISSION") onNavigateToTab("submit");
                          else if (phase.id === "JUDGING" || phase.id === "RESULTS") onNavigateToTab("leaderboard");
                          else onNavigateToTab("teams");
                        }}
                        className="text-[10px] font-bold uppercase text-[#E63946] hover:underline flex items-center gap-1"
                      >
                        <span>Перейти к задачам этапа</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
