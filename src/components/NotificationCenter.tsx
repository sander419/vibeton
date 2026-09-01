import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  AlertTriangle,
  Radio,
  Check,
  X,
  ExternalLink,
  Volume2,
  ShieldAlert,
  ArrowRight,
  Send
} from "lucide-react";
import { useHackathon } from "../context/HackathonContext";
import { isBrowserNotificationSupported } from "../utils/browserNotifications";
import type { NotificationItem } from "../types";

interface NotificationCenterProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenSubmission?: () => void;
  onOpenDevlog?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNavigateToTab,
  onOpenSubmission,
  onOpenDevlog
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    browserPermission,
    requestBrowserPermission,
    markNotificationRead,
    markAllNotificationsRead,
    simulateNotification
  } = useHackathon();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    setIsOpen(false);

    if (notif.actionTab) {
      if (notif.actionTab === "submit" && onOpenSubmission) {
        onOpenSubmission();
      } else if (notif.actionTab === "devlog" && onOpenDevlog) {
        onOpenDevlog();
      } else if (onNavigateToTab) {
        onNavigateToTab(notif.actionTab);
      }
    } else if (notif.category === "deadline" && onOpenSubmission) {
      onOpenSubmission();
    } else if (notif.category === "mentor" && onNavigateToTab) {
      onNavigateToTab("chat");
    } else if (notif.category === "stage" && onNavigateToTab) {
      onNavigateToTab("live");
    }
  };

  const handleSimulate = async (type: "deadline" | "mentor" | "stage" | "ai") => {
    setIsSimulating(true);
    try {
      await simulateNotification(type);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "deadline") return n.category === "deadline" || n.type.includes("DEADLINE");
    if (activeFilter === "mentor") return n.category === "mentor" || n.type.includes("MENTOR");
    if (activeFilter === "stage") return n.category === "stage" || n.type.includes("STAGE");
    if (activeFilter === "ai") return n.category === "ai" || n.type.includes("AI");
    return true;
  });

  const getCategoryBadge = (notif: NotificationItem) => {
    if (notif.category === "deadline" || notif.type.includes("DEADLINE")) {
      return {
        label: "DEADLINE_ALERT",
        bg: "bg-[#2563EB] text-white",
        icon: <Clock className="w-3 h-3" />
      };
    }
    if (notif.category === "mentor" || notif.type.includes("MENTOR")) {
      return {
        label: "MENTOR_ADVICE",
        bg: "bg-[#111113] text-[#F8F7F4]",
        icon: <MessageSquare className="w-3 h-3 text-[#2563EB]" />
      };
    }
    if (notif.category === "stage" || notif.type.includes("STAGE")) {
      return {
        label: "STAGE_STATUS",
        bg: "bg-[#111113] text-[#F8F7F4] border border-[#111113]",
        icon: <Zap className="w-3 h-3 text-blue-400" />
      };
    }
    if (notif.category === "ai" || notif.type.includes("AI")) {
      return {
        label: "AI_HOST_BROADCAST",
        bg: "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]",
        icon: <Sparkles className="w-3 h-3" />
      };
    }
    return {
      label: "SYSTEM_EVENT",
      bg: "bg-[#E5E5E0] text-[#111113]",
      icon: <Radio className="w-3 h-3" />
    };
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return "Только что";
      if (mins < 60) return `${mins} мин назад`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} ч назад`;
      const days = Math.floor(hours / 24);
      return `${days} д назад`;
    } catch {
      return "недавно";
    }
  };

  return (
    <div className="relative font-mono" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-center-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 border border-[#111113] text-xs font-bold uppercase transition-all ${
          isOpen
            ? "bg-[#111113] text-[#F8F7F4] shadow-none"
            : unreadNotificationsCount > 0
            ? "bg-[#F8F7F4] text-[#111113] hover:bg-[#E5E5E0] shadow-[2px_2px_0px_#111113]"
            : "bg-[#F8F7F4] text-[#111113] hover:bg-[#E5E5E0] shadow-[1px_1px_0px_#111113]"
        }`}
        title="Центр оповещений о событиях хакатона"
      >
        <div className="relative">
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-[#2563EB] rounded-full ring-2 ring-[#F8F7F4] animate-pulse" />
          )}
        </div>
        <span className="hidden sm:inline tracking-wider">ОПОВЕЩЕНИЯ</span>
        {unreadNotificationsCount > 0 ? (
          <span className="bg-[#2563EB] text-white text-[10px] font-mono px-1.5 py-0.2 rounded-none font-bold">
            [{unreadNotificationsCount.toString().padStart(2, "0")}]
          </span>
        ) : (
          <span className="text-[#666] text-[10px]">[{notifications.length}]</span>
        )}
      </button>

      {/* Slide-out / Dropdown Notification Panel */}
      {isOpen && (
        <div
          id="notification-center-dropdown-panel"
          className="absolute right-0 mt-2 w-96 sm:w-[460px] bg-[#F8F7F4] border border-[#111113] shadow-[6px_6px_0px_#111113] z-50 flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#111113] text-[#F8F7F4] p-3.5 flex items-center justify-between border-b border-[#111113]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#2563EB] animate-pulse" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#999]">
                  [00] TELEMETRY_DISPATCH
                </div>
                <div className="font-display font-bold text-sm tracking-tight uppercase text-white">
                  ЦЕНТР ОПОВЕЩЕНИЙ И ДЕДЛАЙНОВ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadNotificationsCount > 0 && (
                <button
                  id="mark-all-notifications-read-btn"
                  onClick={markAllNotificationsRead}
                  className="text-[10px] uppercase font-bold text-blue-300 hover:text-white underline"
                >
                  Прочитать все
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#333] text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          <div className="p-3 bg-[#EFEFEA] border-b border-[#111113] text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    browserPermission === "granted"
                      ? "bg-green-600"
                      : browserPermission === "denied"
                      ? "bg-[#2563EB]"
                      : "bg-blue-500 animate-pulse"
                  }`}
                />
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#111113]">
                  BROWSER PUSH:{" "}
                  {browserPermission === "granted"
                    ? "[АКТИВЕН]"
                    : browserPermission === "denied"
                    ? "[ЗАБЛОКИРОВАН]"
                    : "[ОЖИДАЕТ РАЗРЕШЕНИЯ]"}
                </span>
              </div>

              {browserPermission !== "granted" ? (
                <button
                  id="request-browser-notification-permission-btn"
                  onClick={requestBrowserPermission}
                  className="px-2.5 py-1 bg-[#2563EB] text-white hover:bg-[#1d4ed8] text-[10px] font-bold uppercase transition-colors shadow-[2px_2px_0px_#111113]"
                >
                  Разрешить Push
                </button>
              ) : (
                <button
                  id="test-browser-notification-push-btn"
                  onClick={() => handleSimulate("deadline")}
                  className="px-2 py-0.5 bg-[#111113] text-white hover:bg-[#333] text-[10px] font-bold uppercase tracking-wider"
                  title="Отправить тестовое push-уведомление через Notification API"
                >
                  Тест Push
                </button>
              )}
            </div>

            {browserPermission !== "granted" && (
              <p className="mt-1.5 text-[11px] text-[#666] leading-tight">
                Включите браузерные уведомления, чтобы не пропустить дедлайн сдачи проектов и персональные ответы менторов даже в свернутой вкладке.
              </p>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-[#F8F7F4] border-b border-[#111113] overflow-x-auto text-[11px] font-bold uppercase no-scrollbar">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-2 border-r border-[#111113] whitespace-nowrap transition-colors ${
                activeFilter === "all"
                  ? "bg-[#111113] text-[#F8F7F4]"
                  : "text-[#666] hover:bg-[#E5E5E0] hover:text-[#111113]"
              }`}
            >
              ВСЕ ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("deadline")}
              className={`px-3 py-2 border-r border-[#111113] whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === "deadline"
                  ? "bg-[#2563EB] text-white"
                  : "text-[#666] hover:bg-[#E5E5E0] hover:text-[#111113]"
              }`}
            >
              <Clock className="w-3 h-3" />
              ДЕДЛАЙНЫ
            </button>
            <button
              onClick={() => setActiveFilter("mentor")}
              className={`px-3 py-2 border-r border-[#111113] whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === "mentor"
                  ? "bg-[#111113] text-[#F8F7F4]"
                  : "text-[#666] hover:bg-[#E5E5E0] hover:text-[#111113]"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              МЕНТОРЫ
            </button>
            <button
              onClick={() => setActiveFilter("stage")}
              className={`px-3 py-2 border-r border-[#111113] whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === "stage"
                  ? "bg-[#111113] text-[#F8F7F4]"
                  : "text-[#666] hover:bg-[#E5E5E0] hover:text-[#111113]"
              }`}
            >
              <Zap className="w-3 h-3 text-blue-400" />
              ЭТАПЫ
            </button>
            <button
              onClick={() => setActiveFilter("ai")}
              className={`px-3 py-2 whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === "ai"
                  ? "bg-[#111113] text-[#F8F7F4]"
                  : "text-[#666] hover:bg-[#E5E5E0] hover:text-[#111113]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#2563EB]" />
              AI HOST
            </button>
          </div>

          {/* Fast Simulation Trigger Bar */}
          <div className="p-2.5 bg-[#F0EFEB] border-b border-[#111113] text-[10px]">
            <div className="text-[9px] uppercase tracking-widest text-[#666] font-bold mb-1.5 flex items-center justify-between">
              <span>[БЫСТРАЯ СИМУЛЯЦИЯ СОБЫТИЙ ДЛЯ ТЕСТИРОВАНИЯ]</span>
              <span className="text-[#2563EB]">REALTIME</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                disabled={isSimulating}
                onClick={() => handleSimulate("deadline")}
                className="px-2 py-1 bg-[#F8F7F4] border border-[#111113] hover:bg-[#2563EB] hover:text-white text-[10px] font-bold uppercase transition-all"
              >
                + Дедлайн (1ч)
              </button>
              <button
                disabled={isSimulating}
                onClick={() => handleSimulate("mentor")}
                className="px-2 py-1 bg-[#F8F7F4] border border-[#111113] hover:bg-[#111113] hover:text-white text-[10px] font-bold uppercase transition-all"
              >
                + Ментор
              </button>
              <button
                disabled={isSimulating}
                onClick={() => handleSimulate("stage")}
                className="px-2 py-1 bg-[#F8F7F4] border border-[#111113] hover:bg-[#111113] hover:text-white text-[10px] font-bold uppercase transition-all"
              >
                + Смена этапа
              </button>
              <button
                disabled={isSimulating}
                onClick={() => handleSimulate("ai")}
                className="px-2 py-1 bg-[#F8F7F4] border border-[#111113] hover:bg-[#111113] hover:text-white text-[10px] font-bold uppercase transition-all"
              >
                + AI Host
              </button>
            </div>
          </div>

          {/* Notifications Scroll List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[420px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-[#999]">
                <Radio className="w-8 h-8 mx-auto mb-2 text-[#ccc]" />
                <div className="font-bold text-xs uppercase text-[#666]">Нет оповещений в этой категории</div>
                <div className="text-[10px] mt-1">Воспользуйтесь кнопками симуляции выше для проверки диспетчера</div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badge = getCategoryBadge(notif);
                return (
                  <div
                    key={notif.id}
                    className={`p-3 border border-[#111113] transition-all relative ${
                      !notif.isRead
                        ? "bg-[#FFFFFF] shadow-[3px_3px_0px_#111113] border-l-4 border-l-[#2563EB]"
                        : "bg-[#F8F7F4] opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Top Row: Category + Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" title="Новое уведомление" />
                        )}
                      </div>

                      <span className="text-[10px] text-[#666] font-mono">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    {/* Notification Title */}
                    <h4 className="font-display font-bold text-xs sm:text-sm text-[#111113] uppercase tracking-tight leading-snug">
                      {notif.title}
                    </h4>

                    {/* Notification Body */}
                    <p className="mt-1 text-xs text-[#333] leading-relaxed font-mono">
                      {notif.message}
                    </p>

                    {/* Sender Pill & Actions */}
                    <div className="mt-2.5 pt-2 border-t border-[#E5E5E0] flex flex-wrap items-center justify-between gap-2">
                      {notif.senderName ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#666]">
                          {notif.senderAvatar ? (
                            <img
                              src={notif.senderAvatar}
                              alt={notif.senderName}
                              className="w-4 h-4 rounded-full border border-[#111113]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="w-2 h-2 bg-[#111113] inline-block" />
                          )}
                          <span className="font-bold text-[#111113]">{notif.senderName}</span>
                          {notif.senderRole && (
                            <span className="uppercase text-[9px] text-[#999]">[{notif.senderRole}]</span>
                          )}
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2">
                        {/* Interactive Action Button */}
                        <button
                          onClick={() => handleActionClick(notif)}
                          className="px-2 py-1 bg-[#111113] text-white hover:bg-[#2563EB] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <span>Перейти</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>

                        {/* Read/Unread Toggle */}
                        {!notif.isRead && (
                          <button
                            onClick={() => markNotificationRead(notif.id)}
                            className="p-1 hover:bg-[#E5E5E0] text-[#666] hover:text-[#111113] transition-colors"
                            title="Отметить как прочитанное"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Info Bar */}
          <div className="p-2.5 bg-[#111113] text-[#F8F7F4] text-[10px] font-mono flex items-center justify-between border-t border-[#111113]">
            <div className="flex items-center gap-1.5 text-[#999]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
              <span>[SSE_STREAM: SYNCHRONIZED]</span>
            </div>
            <span className="text-[#666]">GALACTIC DISPATCH V.10</span>
          </div>
        </div>
      )}
    </div>
  );
};
