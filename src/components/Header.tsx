import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  User as UserIcon, 
  Shield, 
  Award, 
  Sparkles, 
  RotateCcw, 
  Plus, 
  ExternalLink,
  Zap,
  Clock,
  Trophy
} from "lucide-react";
import type { Role } from "../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFastDevlog: () => void;
  onOpenRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenFastDevlog,
  onOpenRegister
}) => {
  const {
    hackathon,
    currentUser,
    users,
    switchActiveUser,
    soundEnabled,
    toggleSound,
    sseConnected,
    resetDemoSeed
  } = useHackathon();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: "live", label: "Главная (Live)", icon: Zap },
    { id: "leaderboard", label: "Таблица лидеров", icon: Trophy },
    { id: "devlog", label: "Devlog лента", icon: Sparkles },
    { id: "projects", label: "Команды & Проекты", icon: UserIcon },
    { id: "chat", label: "Чат эфира", icon: Radio },
    { id: "judging", label: "Судейство & Итоги", icon: Award },
    { id: "admin", label: "Организатор", icon: Shield }
  ];

  const getStageBadge = (stage?: string) => {
    switch (stage) {
      case "ACTIVE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>LIVE ЭФИР</span>;
      case "SUBMISSION":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>ПРИЕМ РАБОТ</span>;
      case "JUDGING":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>СУДЕЙСТВО</span>;
      case "RESULTS":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">🏆 ИТОГИ</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">{stage || "REGISTRATION"}</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#333]">
      {/* Top Bar for Fix-Ed Integration with Telemetry */}
      <div className="bg-[#050505] border-b border-[#222] px-4 py-1 text-xs text-[#888] font-mono flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[#BAFF00] font-bold tracking-wider flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-pulse"></span>
            FIX-ED.ME // VIBATHON_NODE_04
          </span>
          <span className="text-[#333]">|</span>
          <span className="text-[#AAA] text-[11px] hidden sm:inline">Платформа автоматизации хакатонов</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[#111] text-[#BAFF00] border border-[#333]">
            {sseConnected ? "● REALTIME SSE" : "○ SYNC"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="hidden sm:flex items-center gap-3 text-[#666]">
            <span>LAG: <strong className="text-[#E0E0E0] font-mono">88.4ms</strong></span>
            <span>SYNC: <strong className="text-[#BAFF00] font-mono">99.8%</strong></span>
          </div>
          <button 
            onClick={resetDemoSeed} 
            title="Перезагрузить демо-данные"
            className="text-[10px] text-[#888] hover:text-[#BAFF00] flex items-center gap-1 px-2 py-0.5 rounded bg-[#111] border border-[#333] hover:border-[#BAFF00] transition-colors uppercase tracking-wider"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Сброс Demo</span>
          </button>
          
          <a 
            href="https://fix-ed.me" 
            target="_blank" 
            rel="noreferrer"
            className="text-[11px] text-[#888] hover:text-[#BAFF00] flex items-center gap-1 transition-colors font-mono"
          >
            <span>fix-ed.me</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Status */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setActiveTab("live")} 
              className="cursor-pointer flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#BAFF00] flex items-center justify-center shadow-[0_0_15px_rgba(186,255,0,0.3)] group-hover:scale-105 transition-transform">
                <div className="w-4 h-4 bg-black rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-wider text-white text-base font-mono uppercase group-hover:text-[#BAFF00] transition-colors">
                    ВАЙБАТОН
                  </span>
                  {getStageBadge(hackathon?.stage)}
                </div>
                <p className="text-[10px] text-[#888] font-mono tracking-widest uppercase -mt-0.5">
                  LIVE HACKATHON STATION
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-[#333]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all uppercase ${
                    isActive 
                      ? "bg-[#BAFF00] text-black font-bold shadow-[0_0_10px_rgba(186,255,0,0.4)]" 
                      : "text-[#AAA] hover:text-[#FFF] hover:bg-[#222]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Devlog, Audio Toggle & User Selector */}
          <div className="flex items-center gap-2.5">
            {/* Quick Devlog CTA */}
            <button
              onClick={onOpenFastDevlog}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wider uppercase bg-[#BAFF00] text-black hover:bg-[#d4ff33] shadow-[0_0_12px_rgba(186,255,0,0.35)] hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Прогресс</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Звук включен" : "Звук выключен"}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                soundEnabled 
                  ? "bg-[#BAFF00]/10 border-[#BAFF00]/40 text-[#BAFF00] shadow-[0_0_8px_rgba(186,255,0,0.2)]" 
                  : "bg-[#111] border-[#333] text-[#888] hover:text-white"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#333] hover:border-[#BAFF00]/50 text-xs text-white transition-all font-mono"
              >
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-6 h-6 rounded-full object-cover border border-[#BAFF00]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#BAFF00]/20 text-[#BAFF00] flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="font-semibold leading-none">{currentUser?.name || "Гость"}</div>
                  <div className="text-[10px] text-[#888] font-mono mt-0.5 uppercase">
                    {currentUser?.role || "Зритель"}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#111] border border-[#333] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-mono">
                  <div className="px-3 py-2 border-b border-[#222] mb-1">
                    <p className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Смена роли для тестирования</p>
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchActiveUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                          currentUser?.id === u.id 
                            ? "bg-[#BAFF00]/15 text-[#BAFF00] border border-[#BAFF00]/40" 
                            : "text-[#AAA] hover:bg-[#1a1a1a] hover:text-white"
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-[#333]" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-[#888] font-mono flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.role === 'organizer' ? 'bg-[#BAFF00]' :
                              u.role === 'judge' ? 'bg-purple-400' : 'bg-cyan-400'
                            }`} />
                            {u.role.toUpperCase()} • {u.primaryRole}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#222] mt-1 flex flex-col gap-1">
                    <button
                      onClick={() => {
                        onOpenRegister();
                        setShowUserMenu(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#333] hover:border-[#BAFF00] flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider font-mono"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#BAFF00]" />
                      <span>Новый участник</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-[#222] no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 transition-all font-mono uppercase ${
                  isActive 
                    ? "bg-[#BAFF00] text-black font-bold shadow-[0_0_8px_rgba(186,255,0,0.3)]" 
                    : "text-[#AAA] hover:bg-[#1a1a1a]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
