import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Volume2,
  VolumeX,
  User as UserIcon,
  Shield,
  Award,
  Sparkles,
  RotateCcw,
  Plus,
  Zap,
  Trophy,
  Swords,
  Layers,
  Maximize2,
  ChevronDown,
  Check,
  MessageSquare
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFastDevlog: () => void;
  onOpenRegister: () => void;
  onOpenObserverMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenFastDevlog,
  onOpenRegister,
  onOpenObserverMode
}) => {
  const {
    hackathon,
    eventsList,
    activeEventId,
    switchEvent,
    currentUser,
    users,
    switchActiveUser,
    soundEnabled,
    toggleSound,
    sseConnected,
    resetDemoSeed
  } = useHackathon();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  const navItems = [
    { id: "live", label: "Главная", icon: Zap },
    { id: "discovery", label: "События", icon: Layers },
    { id: "duel", label: "1v1 Дуэль", icon: Swords },
    { id: "leaderboard", label: "Таблица", icon: Trophy },
    { id: "devlog", label: "Devlog", icon: Sparkles },
    { id: "projects", label: "Проекты", icon: UserIcon },
    { id: "chat", label: "Чат", icon: MessageSquare },
    { id: "judging", label: "Судейство", icon: Award },
    { id: "admin", label: "Орг-панель", icon: Shield }
  ];

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white bg-[#E63946] border border-[#1A1A1A]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            [LIVE]
          </span>
        );
      case "SUBMISSION":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#1A1A1A] bg-[#EFECE6] border border-[#1A1A1A]">
            [ПРИЁМ]
          </span>
        );
      case "JUDGING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white bg-[#0F4C81] border border-[#1A1A1A]">
            [СУДЕЙСТВО]
          </span>
        );
      case "RESULTS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#1A1A1A] bg-[#EFECE6] border border-[#1A1A1A]">
            [ИТОГИ]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#666] bg-[#EFECE6] border border-[#1A1A1A]">
            [{stage || "READY"}]
          </span>
        );
    }
  };

  const currentEvent = eventsList.find((e) => e.id === activeEventId) || hackathon;

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4] border-b-2 border-[#1A1A1A] font-mono">
      {/* Top Telemetry Ticker Bar */}
      <div className="bg-[#EFECE6] border-b border-[#1A1A1A] px-4 sm:px-8 py-1.5 text-xs text-[#1A1A1A] font-mono flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="label text-[#1A1A1A] font-bold">
            [01] SYSTEM
          </div>
          <span className="text-[#999]">|</span>
          <div className="font-bold tracking-wider text-xs text-[#1A1A1A]">
            COMPETITION_OS // INDUSTRIAL_EDITION
          </div>
          <span className="text-[#999] hidden sm:inline">|</span>
          <span className="text-[#666] text-[11px] hidden md:inline">
            Event Engine • AI Host • 1v1 Arena • Observer Mode
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#FFFFFF] text-[#1A1A1A] border border-[#1A1A1A] font-bold">
            {sseConnected ? "● REALTIME_SYNC" : "○ SYNC_OFFLINE"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={resetDemoSeed}
            title="Сбросить демо-данные"
            className="text-[10px] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F8F7F4] flex items-center gap-1 px-2 py-0.5 bg-[#FFFFFF] border border-[#1A1A1A] transition-colors font-bold uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={toggleSound}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase transition-colors border border-[#1A1A1A] ${
              soundEnabled
                ? "bg-[#1A1A1A] text-[#F8F7F4]"
                : "bg-[#FFFFFF] text-[#666] hover:text-[#1A1A1A]"
            }`}
            title="Синтез речи AI Host"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-[#E63946]" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden sm:inline">{soundEnabled ? "AI_AUDIO: ON" : "AI_AUDIO: OFF"}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo & Event Format Switcher */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => setActiveTab("live")}
              className="cursor-pointer flex items-center gap-2 group select-none"
            >
              <div className="font-display font-bold text-2xl tracking-tight text-[#1A1A1A] uppercase">
                COMPETITION<span className="text-[#E63946]">_OS</span>
              </div>
            </div>

            {/* Event Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setShowEventMenu(!showEventMenu)}
                className="flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] hover:bg-[#EFECE6] border-1.5 border-[#1A1A1A] text-xs font-mono transition-colors text-left shadow-[2px_2px_0px_#1A1A1A]"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1A1A] uppercase truncate max-w-[130px] sm:max-w-[180px]">
                      {currentEvent?.title || "Вайбатон №2"}
                    </span>
                    {getStageBadge(currentEvent?.stage)}
                  </div>
                  <span className="text-[10px] text-[#666] font-mono">
                    {currentEvent?.templateType === "DUEL"
                      ? "1v1 Cyber Duel"
                      : currentEvent?.templateType === "SPEED_RUN"
                      ? "Speed Run (24h)"
                      : "Vibeathon Classic"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]" />
              </button>

              {/* Event Switcher Dropdown */}
              {showEventMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-2 z-50 font-mono">
                  <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">
                      [ТУРНИРЫ]
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab("discovery");
                        setShowEventMenu(false);
                      }}
                      className="text-[10px] text-[#E63946] font-bold hover:underline uppercase"
                    >
                      Каталог →
                    </button>
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {eventsList.map((ev) => {
                      const isSel = ev.id === activeEventId;
                      return (
                        <button
                          key={ev.id}
                          onClick={async () => {
                            await switchEvent(ev.id);
                            setShowEventMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors border ${
                            isSel
                              ? "bg-[#1A1A1A] text-[#F8F7F4] border-[#1A1A1A]"
                              : "text-[#1A1A1A] border-transparent hover:bg-[#EFECE6]"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold uppercase truncate">{ev.title}</div>
                            <div className="text-[10px] text-[#666] flex items-center gap-1.5 mt-0.5">
                              <span className="uppercase text-[#E63946] font-bold">{ev.templateType}</span>
                              <span>•</span>
                              <span>{ev.stage}</span>
                            </div>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-[#E63946] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#1A1A1A] mt-1">
                    <button
                      onClick={() => {
                        setActiveTab("discovery");
                        setShowEventMenu(false);
                      }}
                      className="w-full py-1.5 px-3 text-xs font-bold bg-[#1A1A1A] hover:bg-[#E63946] text-[#F8F7F4] hover:text-white flex items-center justify-center gap-1.5 transition-colors uppercase font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Каталог форматов</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold font-mono tracking-wider transition-colors uppercase whitespace-nowrap border-1.5 ${
                    isActive
                      ? "bg-[#1A1A1A] text-[#F8F7F4] border-[#1A1A1A] shadow-[2px_2px_0px_#E63946]"
                      : "bg-transparent text-[#1A1A1A] border-transparent hover:border-[#1A1A1A] hover:bg-[#EFECE6]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Devlog CTA, Observer, Profile */}
          <div className="flex items-center gap-2">
            {/* Observer Mode CTA */}
            {onOpenObserverMode && (
              <button
                onClick={onOpenObserverMode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#1A1A1A] hover:text-[#F8F7F4] text-[#1A1A1A] border-1.5 border-[#1A1A1A] text-xs font-mono font-bold uppercase transition-colors shadow-[2px_2px_0px_#1A1A1A]"
                title="Режим прямого эфира / полноэкранный стрим"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#E63946]" />
                <span className="hidden xl:inline">OBSERVER</span>
              </button>
            )}

            {/* Quick Devlog Button */}
            <button
              onClick={onOpenFastDevlog}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D02B38] text-white font-mono font-bold text-xs uppercase border-1.5 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ DEVLOG</span>
            </button>

            {/* User Profile / Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1 bg-[#FFFFFF] hover:bg-[#EFECE6] border-1.5 border-[#1A1A1A] transition-colors text-xs font-mono shadow-[2px_2px_0px_#1A1A1A]"
              >
                {(currentUser?.avatar || currentUser?.avatarUrl) ? (
                  <img
                    src={currentUser?.avatar || currentUser?.avatarUrl}
                    alt={currentUser?.name || "User"}
                    className="w-6 h-6 object-cover border border-[#1A1A1A]"
                  />
                ) : (
                  <div className="w-6 h-6 bg-[#1A1A1A] text-[#F8F7F4] flex items-center justify-center font-bold text-xs">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[#1A1A1A] font-bold truncate max-w-[90px]">
                    {currentUser?.name || "Гость"}
                  </span>
                  <span className="text-[10px] text-[#666] font-mono -mt-0.5">
                    {currentUser?.role || "Наблюдатель"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#1A1A1A]" />
              </button>

              {/* User Dropdown with Quick Demo Roles */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] p-2 z-50 font-mono">
                  <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">
                      [ДЕМО-РОЛИ]
                    </span>
                    <button
                      onClick={() => {
                        onOpenRegister();
                        setShowUserMenu(false);
                      }}
                      className="text-[10px] text-[#E63946] font-bold hover:underline uppercase"
                    >
                      + Регистрация
                    </button>
                  </div>

                  <div className="space-y-1">
                    {users.slice(0, 5).map((u) => {
                      const isCurrent = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchActiveUser(u.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors border ${
                            isCurrent
                              ? "bg-[#1A1A1A] text-[#F8F7F4] border-[#1A1A1A]"
                              : "text-[#1A1A1A] border-transparent hover:bg-[#EFECE6]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {(u.avatar || u.avatarUrl) ? (
                              <img
                                src={u.avatar || u.avatarUrl}
                                alt={u.name || "User"}
                                className="w-6 h-6 object-cover border border-[#1A1A1A]"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-[#1A1A1A] text-[#F8F7F4] flex items-center justify-center font-bold text-[10px]">
                                {u.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold truncate">{u.name || "Участник"}</div>
                              <div className="text-[10px] text-[#666]">{u.role || "participant"}</div>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-[#E63946] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

