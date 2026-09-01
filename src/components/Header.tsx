import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { NotificationCenter } from "./NotificationCenter";
import {
  Volume2,
  VolumeX,
  User as UserIcon,
  UserCheck,
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
  MessageSquare,
  Terminal,
  Sun,
  Moon
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFastDevlog: () => void;
  onOpenRegister: () => void;
  onOpenObserverMode?: () => void;
  onOpenSubmission?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenFastDevlog,
  onOpenRegister,
  onOpenObserverMode,
  onOpenSubmission
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
    theme,
    toggleTheme,
    setTheme,
    sseConnected,
    resetDemoSeed
  } = useHackathon();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  const navItems = [
    { id: "live", label: "Главная", icon: Zap },
    { id: "my-dashboard", label: "Мой дашборд", icon: UserCheck },
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white bg-[#2563EB] border border-[#111113]">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            [LIVE]
          </span>
        );
      case "SUBMISSION":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#111113] bg-[#EFECE6] border border-[#111113]">
            [ПРИЁМ]
          </span>
        );
      case "JUDGING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white bg-[#111113] border border-[#111113]">
            [СУДЕЙСТВО]
          </span>
        );
      case "RESULTS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#111113] bg-[#EFECE6] border border-[#111113]">
            [ИТОГИ]
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#666] bg-[#EFECE6] border border-[#111113]">
            [{stage || "READY"}]
          </span>
        );
    }
  };

  const currentEvent = eventsList.find((e) => e.id === activeEventId) || hackathon;

  return (
    <header className="sticky top-8 sm:top-9 z-40 bg-[#F8F7F4] border-b-2 border-[#111113] font-mono">
      {/* Top Telemetry Ticker Bar */}
      <div className="bg-[#EFECE6] border-b border-[#111113] px-4 sm:px-8 py-1.5 text-xs text-[#111113] font-mono flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="tag-box py-0.5 px-2 bg-[#111113] text-white">
            ARENA_v2
          </div>
          <span className="text-[#999]">|</span>
          <div className="font-bold tracking-wider text-xs text-[#111113]">
            GALACTIC_ARENA // EVENT_ENGINE [X] // AI_HOST [X]
          </div>
          <span className="text-[#999] hidden sm:inline">|</span>
          <span className="text-[#555] text-[11px] hidden md:inline">
            1v1 Cyber Arena • Realtime Observer • Devlog Sync
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-[#FFFFFF] text-[#2563EB] border border-[#111113] font-bold">
            {sseConnected ? "● REALTIME_SYNC 12ms" : "○ SYNC_OFFLINE"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {/* Global Theme Toggle in Telemetry Bar */}
          <button
            onClick={toggleTheme}
            title={theme === "terminal-dark" ? "Переключить на светлую тему (Default Light)" : "Переключить на тему Terminal Dark"}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase transition-all border border-[#111113] ${
              theme === "terminal-dark"
                ? "bg-[#BAFF00] text-[#090A0D] border-[#BAFF00] shadow-[0_0_8px_rgba(186,255,0,0.3)]"
                : "bg-[#FFFFFF] text-[#111113] hover:bg-[#111113] hover:text-[#F8F7F4]"
            }`}
          >
            {theme === "terminal-dark" ? (
              <>
                <Terminal className="w-3 h-3 text-[#090A0D]" />
                <span>TERMINAL_DARK</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-600" />
                <span>LIGHT_MODE</span>
              </>
            )}
          </button>

          <button
            onClick={resetDemoSeed}
            title="Сбросить демо-данные"
            className="text-[10px] text-[#111113] hover:bg-[#111113] hover:text-[#F8F7F4] flex items-center gap-1 px-2 py-0.5 bg-[#FFFFFF] border border-[#111113] transition-colors font-bold uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={toggleSound}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase transition-colors border border-[#111113] ${
              soundEnabled
                ? "bg-[#2563EB] text-white"
                : "bg-[#FFFFFF] text-[#666] hover:text-[#111113]"
            }`}
            title="Синтез речи AI Host"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-white" /> : <VolumeX className="w-3 h-3" />}
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
              <div className="font-display font-bold text-2xl tracking-tight text-[#111113] uppercase">
                ARENA<span className="text-[#2563EB]">_v2</span>
              </div>
            </div>

            {/* Event Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setShowEventMenu(!showEventMenu)}
                className="flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] hover:bg-[#EFECE6] border border-[#111113] text-xs font-mono transition-colors text-left"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111113] uppercase truncate max-w-[130px] sm:max-w-[180px]">
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
                <ChevronDown className="w-3.5 h-3.5 text-[#111113]" />
              </button>

              {/* Event Switcher Dropdown */}
              {showEventMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-[#FFFFFF] border-2 border-[#111113] shadow-[4px_4px_0px_#111113] p-2 z-50 font-mono">
                  <div className="px-3 py-2 border-b border-[#111113] flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">
                      [ТУРНИРЫ]
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab("discovery");
                        setShowEventMenu(false);
                      }}
                      className="text-[10px] text-[#2563EB] font-bold hover:underline uppercase"
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
                              ? "bg-[#2563EB] text-white border-[#111113]"
                              : "text-[#111113] border-transparent hover:bg-[#EFECE6]"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold uppercase truncate">{ev.title}</div>
                            <div className="text-[10px] opacity-80 flex items-center gap-1.5 mt-0.5">
                              <span className="uppercase font-bold">{ev.templateType}</span>
                              <span>•</span>
                              <span>{ev.stage}</span>
                            </div>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#111113] mt-1">
                    <button
                      onClick={() => {
                        setActiveTab("discovery");
                        setShowEventMenu(false);
                      }}
                      className="w-full py-1.5 px-3 text-xs font-bold bg-[#111113] hover:bg-[#2563EB] text-white flex items-center justify-center gap-1.5 transition-colors uppercase font-mono"
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold font-mono tracking-wider transition-colors uppercase whitespace-nowrap border ${
                    isActive
                      ? "bg-[#2563EB] text-white border-[#111113]"
                      : "bg-transparent text-[#111113] border-transparent hover:border-[#111113] hover:bg-[#EFECE6]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Devlog CTA, Notifications, Observer, Profile */}
          <div className="flex items-center gap-2">
            {/* Notification Center */}
            <NotificationCenter
              onNavigateToTab={setActiveTab}
              onOpenSubmission={onOpenSubmission}
              onOpenDevlog={onOpenFastDevlog}
            />

            {/* Observer Mode CTA */}
            {onOpenObserverMode && (
              <button
                onClick={onOpenObserverMode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] border border-[#111113] text-xs font-mono font-bold uppercase transition-colors"
                title="Режим прямого эфира / полноэкранный стрим"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="hidden xl:inline">OBSERVER</span>
              </button>
            )}

            {/* Global Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold uppercase transition-all border border-[#111113] ${
                theme === "terminal-dark"
                  ? "bg-[#BAFF00] text-[#090A0D] border-[#BAFF00] shadow-[2px_2px_0px_#000000]"
                  : "bg-[#FFFFFF] text-[#111113] hover:bg-[#EFECE6] shadow-[2px_2px_0px_#111113]"
              }`}
              title={`Текущая тема: ${theme === 'terminal-dark' ? 'Terminal Dark' : 'Default Light'}. Нажмите для переключения.`}
            >
              {theme === "terminal-dark" ? (
                <>
                  <Terminal className="w-3.5 h-3.5 text-[#090A0D]" />
                  <span className="hidden md:inline">TERMINAL</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">LIGHT</span>
                </>
              )}
            </button>

            {/* Quick Devlog Button */}
            <button
              onClick={onOpenFastDevlog}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111113] hover:bg-[#2563EB] text-white font-mono font-bold text-xs uppercase border border-[#111113] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ DEVLOG</span>
            </button>

            {/* User Profile / Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1 bg-[#FFFFFF] hover:bg-[#EFECE6] border border-[#111113] transition-colors text-xs font-mono"
              >
                {(currentUser?.avatar || currentUser?.avatarUrl) ? (
                  <img
                    src={currentUser?.avatar || currentUser?.avatarUrl}
                    alt={currentUser?.name || "User"}
                    className="w-6 h-6 object-cover border border-[#111113]"
                  />
                ) : (
                  <div className="w-6 h-6 bg-[#111113] text-[#F8F7F4] flex items-center justify-center font-bold text-xs">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[#111113] font-bold truncate max-w-[90px]">
                    {currentUser?.name || "Гость"}
                  </span>
                  <span className="text-[10px] text-[#666] font-mono -mt-0.5">
                    {currentUser?.role || "Наблюдатель"}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#111113]" />
              </button>

              {/* User Dropdown with Quick Demo Roles */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border-2 border-[#111113] shadow-[4px_4px_0px_#111113] p-2 z-50 font-mono">
                  <div className="px-3 py-2 border-b border-[#111113] flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#666] uppercase font-bold tracking-wider">
                      [ПРОФИЛЬ УЧАСТНИКА]
                    </span>
                    <button
                      onClick={() => {
                        onOpenRegister();
                        setShowUserMenu(false);
                      }}
                      className="text-[10px] text-[#2563EB] font-bold hover:underline uppercase"
                    >
                      + Регистрация
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("my-dashboard");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs bg-[#F8F7F4] hover:bg-[#2563EB] hover:text-white border border-[#111113] transition-colors mb-2 font-bold uppercase"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Открыть Мой дашборд</span>
                    </div>
                    <span className="text-[10px]">→</span>
                  </button>

                  <div className="px-2 py-1 text-[9px] text-[#666] uppercase font-bold tracking-wider">
                    [СМЕНИТЬ ДЕМО-ПОЛЬЗОВАТЕЛЯ]:
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
                              ? "bg-[#2563EB] text-white border-[#111113]"
                              : "text-[#111113] border-transparent hover:bg-[#EFECE6]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {(u.avatar || u.avatarUrl) ? (
                              <img
                                src={u.avatar || u.avatarUrl}
                                alt={u.name || "User"}
                                className="w-6 h-6 object-cover border border-[#111113]"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-[#111113] text-[#F8F7F4] flex items-center justify-center font-bold text-[10px]">
                                {u.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold truncate">{u.name || "Участник"}</div>
                              <div className="text-[10px] opacity-80">{u.role || "participant"}</div>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Theme Switcher in User Dropdown */}
                  <div className="pt-2 border-t border-[#111113] mt-2">
                    <div className="px-2 py-1 text-[9px] text-[#666] uppercase font-bold tracking-wider mb-1">
                      [ТЕМА ОФОРМЛЕНИЯ / THEME]:
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setTheme("light")}
                        className={`px-2 py-1.5 text-left text-[10px] font-bold uppercase transition-all flex items-center justify-between border ${
                          theme === "light"
                            ? "bg-[#2563EB] text-white border-[#111113]"
                            : "bg-[#F8F7F4] text-[#111113] border-transparent hover:bg-[#EFECE6]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>LIGHT</span>
                        </span>
                        {theme === "light" && <Check className="w-3 h-3 text-white" />}
                      </button>

                      <button
                        onClick={() => setTheme("terminal-dark")}
                        className={`px-2 py-1.5 text-left text-[10px] font-bold uppercase transition-all flex items-center justify-between border ${
                          theme === "terminal-dark"
                            ? "bg-[#BAFF00] text-[#090A0D] border-[#BAFF00] shadow-[0_0_8px_rgba(186,255,0,0.3)]"
                            : "bg-[#F8F7F4] text-[#111113] border-transparent hover:bg-[#EFECE6]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-[#BAFF00]" />
                          <span>TERMINAL</span>
                        </span>
                        {theme === "terminal-dark" && <Check className="w-3 h-3 text-[#090A0D]" />}
                      </button>
                    </div>
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

