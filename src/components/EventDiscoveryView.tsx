import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Sparkles,
  Trophy,
  Swords,
  Zap,
  Users,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  Plus,
  Play,
  Clock,
  Search,
  Filter
} from "lucide-react";
import type { EventTemplateType, CompetitionEvent } from "../types";

interface EventDiscoveryViewProps {
  onSelectEvent?: (eventId: string) => void;
  onOpenCreateModal?: () => void;
}

export const EventDiscoveryView: React.FC<EventDiscoveryViewProps> = ({
  onSelectEvent,
  onOpenCreateModal
}) => {
  const { eventsList, activeEventId, switchEvent, currentUser, currentRole, createEvent } = useHackathon();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTagline, setNewEventTagline] = useState("");
  const [newEventTemplate, setNewEventTemplate] = useState<EventTemplateType>("VIBEATHON");
  const [newEventTheme, setNewEventTheme] = useState("");
  const [newEventPrizePool, setNewEventPrizePool] = useState("100 000 ₽");
  const [newEventMaxTeam, setNewEventMaxTeam] = useState(4);

  const filteredEvents = eventsList.filter((ev) => {
    const matchesFilter = filterType === "ALL" || ev.templateType === filterType;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTemplateBadge = (templateType: EventTemplateType) => {
    switch (templateType) {
      case "DUEL":
        return {
          label: "1v1 Cyber Duel",
          color: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: Swords
        };
      case "SPEED_RUN":
        return {
          label: "Speed Run",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: Zap
        };
      case "COMMUNITY_JAM":
        return {
          label: "Community Jam",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
          icon: Users
        };
      case "VIBEATHON":
      default:
        return {
          label: "Vibeathon Classic",
          color: "bg-[#BAFF00]/10 text-[#BAFF00] border-[#BAFF00]/30",
          icon: Trophy
        };
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setCreateError(null);

    try {
      const created = await createEvent({
        title: newEventTitle,
        tagline: newEventTagline || "Live Competition by Competition OS",
        theme: newEventTheme || "Next-Gen AI & Real-time Web",
        templateType: newEventTemplate,
        prizePool: newEventPrizePool,
        maxTeamSize: Number(newEventMaxTeam) || 4
      });
      setIsCreating(false);
      setNewEventTitle("");
      setNewEventTagline("");
      setNewEventTheme("");
      if (onSelectEvent) onSelectEvent(created.id);
    } catch (err: any) {
      setCreateError(err.message || "Ошибка при создании события");
    }
  };

  return (
    <div className="space-y-6 font-mono animate-in fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#111] via-[#0D0D0D] to-[#151515] border border-[#262626] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#BAFF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#BAFF00]/10 border border-[#BAFF00]/30 text-[#BAFF00] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Event Hub • Competition OS</span>
              </span>
              <span className="text-xs text-[#888]">
                Всего событий: <strong className="text-white">{eventsList.length}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Каталог соревнований и дуэлей
            </h1>
            <p className="text-xs sm:text-sm text-[#999] leading-relaxed">
              Выбирайте активные хакатоны, 1v1 баттлы кода и спринты. Переключайтесь в один клик
              или запустите свой кастомный формат с AI Host и автоматическими гейтами.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="self-start md:self-center px-5 py-3 rounded-2xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold uppercase text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(186,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Создать событие</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-8 pt-6 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "Все форматы" },
              { id: "VIBEATHON", label: "Вайбатоны" },
              { id: "DUEL", label: "1v1 Дуэли" },
              { id: "SPEED_RUN", label: "Speed Runs" },
              { id: "COMMUNITY_JAM", label: "Community Jams" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap uppercase font-bold transition-all border ${
                  filterType === tab.id
                    ? "bg-[#BAFF00] text-black border-[#BAFF00] shadow-[0_0_12px_rgba(186,255,0,0.25)]"
                    : "bg-[#141414] text-[#888] hover:text-white border-[#262626] hover:border-[#444]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию/теме..."
              className="w-full bg-[#141414] border border-[#262626] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((ev) => {
          const badge = getTemplateBadge(ev.templateType);
          const BadgeIcon = badge.icon;
          const isActive = ev.id === activeEventId;

          return (
            <div
              key={ev.id}
              className={`relative rounded-3xl bg-[#0D0D0D] border p-5 sm:p-6 transition-all flex flex-col justify-between ${
                isActive
                  ? "border-[#BAFF00] shadow-[0_0_25px_rgba(186,255,0,0.15)] bg-gradient-to-b from-[#141414] to-[#0D0D0D]"
                  : "border-[#222] hover:border-[#444] bg-[#0E0E0E]"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#BAFF00] text-black text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  <span>ТЕКУЩИЙ КОНТЕКСТ</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase flex items-center gap-1.5 ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888] text-[10px] uppercase font-mono border border-[#333]">
                    {ev.stage}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-mono tracking-tight">{ev.title}</h3>
                  <p className="text-xs text-[#BAFF00] mt-0.5 font-mono">{ev.tagline}</p>
                </div>

                <p className="text-xs text-[#888] font-mono line-clamp-2">
                  Тема: <span className="text-[#DDD]">{ev.theme}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1C1C1C] text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-[#141414] border border-[#222]">
                    <div className="text-[#777] text-[9px] uppercase">Призовой фонд</div>
                    <div className="text-white font-bold truncate">{ev.prizePool || "100 000 ₽"}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#141414] border border-[#222]">
                    <div className="text-[#777] text-[9px] uppercase">Участники</div>
                    <div className="text-[#BAFF00] font-bold">{ev.participantCount || 42} чел.</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#141414] border border-[#222]">
                    <div className="text-[#777] text-[9px] uppercase">Команды</div>
                    <div className="text-white font-bold">{ev.teamCount || 12} ком.</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#1C1C1C] flex items-center justify-between gap-3">
                <div className="text-[10px] text-[#666] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Старт: {new Date(ev.startTime).toLocaleDateString("ru-RU")}</span>
                </div>

                <button
                  onClick={async () => {
                    await switchEvent(ev.id);
                    if (onSelectEvent) onSelectEvent(ev.id);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-[#1A1A1A] text-[#BAFF00] border border-[#BAFF00]/40 cursor-default"
                      : "bg-[#BAFF00] hover:bg-[#d4ff33] text-black shadow-[0_0_12px_rgba(186,255,0,0.2)]"
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#BAFF00]" />
                      <span>Выбрано</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Войти в событие</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
          <div className="bg-[#0D0D0D] border border-[#333] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#262626] bg-[#141414] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#BAFF00]/10 text-[#BAFF00] border border-[#BAFF00]/30 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase">Создать новое соревнование</h3>
                  <p className="text-xs text-[#888]">Запуск нового хакатона или 1v1 баттла</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-[#888] hover:text-white px-2 py-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#888] uppercase block mb-1">Формат события *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "VIBEATHON", label: "Вайбатон", icon: Trophy },
                    { id: "DUEL", label: "1v1 Дуэль", icon: Swords },
                    { id: "SPEED_RUN", label: "Speed Run", icon: Zap },
                    { id: "COMMUNITY_JAM", label: "Community Jam", icon: Users }
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        type="button"
                        key={fmt.id}
                        onClick={() => setNewEventTemplate(fmt.id as EventTemplateType)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                          newEventTemplate === fmt.id
                            ? "bg-[#BAFF00]/10 text-[#BAFF00] border-[#BAFF00] shadow-[0_0_10px_rgba(186,255,0,0.2)]"
                            : "bg-[#141414] text-[#888] border-[#262626] hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-[#888] uppercase block mb-1">Название события *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="AI Agents Sprint #3"
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs text-[#888] uppercase block mb-1">Слоган / Описание</label>
                <input
                  type="text"
                  value={newEventTagline}
                  onChange={(e) => setNewEventTagline(e.target.value)}
                  placeholder="48 часов непрерывного лайв-коддинга"
                  className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#888] uppercase block mb-1">Призовой фонд</label>
                  <input
                    type="text"
                    value={newEventPrizePool}
                    onChange={(e) => setNewEventPrizePool(e.target.value)}
                    placeholder="150 000 ₽"
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888] uppercase block mb-1">Макс. размер команды</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newEventMaxTeam}
                    onChange={(e) => setNewEventMaxTeam(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00]"
                  />
                </div>
              </div>

              {createError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono">
                  {createError}
                </div>
              )}

              <div className="pt-4 border-t border-[#222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs uppercase text-[#888] hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold uppercase text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(186,255,0,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Запустить событие</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
