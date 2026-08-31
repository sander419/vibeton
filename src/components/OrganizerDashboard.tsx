import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
   Shield, 
   Radio, 
   RotateCcw, 
   CheckCircle2, 
   Bot
} from "lucide-react";
import type { HackathonStage } from "../types";

export const OrganizerDashboard: React.FC = () => {
  const { 
    hackathon, 
    updateHackathon, 
    triggerAIHostBroadcast, 
    resetDemoSeed, 
    users, 
    teams, 
    projects, 
    submissions 
  } = useHackathon();

  const [title, setTitle] = useState(hackathon?.title || "Вайбатон №2");
  const [theme, setTheme] = useState(hackathon?.theme || "Платформа для проведения Вайбатонов");
  const [description, setDescription] = useState(hackathon?.description || "");
  const [stage, setStage] = useState<HackathonStage>(hackathon?.stage || "ACTIVE");
  const [broadcastReason, setBroadcastReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateHackathon({
        title,
        theme,
        description,
        stage
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerBroadcast = async () => {
    setIsBroadcasting(true);
    try {
      await triggerAIHostBroadcast(broadcastReason || "Официальное объявление организатора");
      setBroadcastReason("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const stages: Array<{ id: HackathonStage; label: string; desc: string }> = [
    { id: "DRAFT", label: "Черновик", desc: "Подготовка и настройка правил" },
    { id: "REGISTRATION", label: "Регистрация", desc: "Набор участников и команд" },
    { id: "ACTIVE", label: "Активная разработка", desc: "7 дней кодинга и публикации Devlog" },
    { id: "SUBMISSION", label: "Прием работ", desc: "Финальная сдача проектов перед дедлайном" },
    { id: "JUDGING", label: "Судейство", desc: "Оценка жюри по 4 критериям" },
    { id: "RESULTS", label: "Итоги и награждение", desc: "Показ подиума и официальное объявление" }
  ];

  return (
    <div className="space-y-8 mb-8 font-mono">
      {/* Header */}
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#151515] text-[#BAFF00] border border-[#333] flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#BAFF00] uppercase tracking-wider">ОРГАНИЗАТОРСКАЯ ПАНЕЛЬ</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] border border-[#333] text-[#AAA]">ADMIN ROOM</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase tracking-wider mt-1">
              Управление Вайбатоном
            </h2>
            <p className="text-xs text-[#888] font-mono">
              Переключение этапов состязания, управление AI Host и экспорт данных
            </p>
          </div>
        </div>

        <button
          onClick={resetDemoSeed}
          className="px-4 py-2.5 rounded-xl bg-[#151515] hover:bg-[#222] text-xs text-white border border-[#333] flex items-center gap-2 font-mono uppercase transition-all"
        >
          <RotateCcw className="w-4 h-4 text-[#BAFF00]" />
          <span>Перезагрузить Demo Данные</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Stage Switcher & Event Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stage Control Panel */}
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">Этап соревнования</h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#BAFF00]/15 text-[#BAFF00] border border-[#BAFF00]/30 font-bold uppercase">
                АКТИВЕН: {hackathon?.stage}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stages.map((st) => {
                const isActive = hackathon?.stage === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => updateHackathon({ stage: st.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isActive
                        ? "bg-[#151515] border-[#BAFF00] shadow-[0_0_15px_rgba(186,255,0,0.15)] ring-1 ring-[#BAFF00]"
                        : "bg-[#111] border-[#262626] hover:border-[#444] text-[#888]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-xs uppercase font-mono ${isActive ? "text-[#BAFF00]" : "text-white"}`}>
                        {st.label}
                      </span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-[#BAFF00]" />}
                    </div>
                    <p className="text-[11px] text-[#777] font-mono leading-tight">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Metadata Form */}
          <form onSubmit={handleSaveSettings} className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">Параметры события</h3>

            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Название события</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Тема хакатона</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Описание и регламент</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00] resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold font-mono uppercase text-xs shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
              >
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: AI Host Broadcast Launcher & Live Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trigger AI Host Broadcast Card */}
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-[#BAFF00]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">Прямой эфир AI Host</h3>
            </div>
            <p className="text-xs text-[#888] font-mono">
              Сформировать внеочередную сводку ведущего по текущему прогрессу хакатона.
            </p>

            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Повод для объявления (опционально)</label>
              <input
                type="text"
                value={broadcastReason}
                onChange={(e) => setBroadcastReason(e.target.value)}
                placeholder="Например: до дедлайна осталось 24 часа! Покажите MVP"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
              />
            </div>

            <button
              onClick={handleTriggerBroadcast}
              disabled={isBroadcasting}
              className="w-full py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-50 text-black font-bold font-mono uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>{isBroadcasting ? "Генерация ведущего..." : "Выпустить AI Host в эфир"}</span>
            </button>
          </div>

          {/* Quick Metrics Overview */}
          <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-mono text-[#888] uppercase tracking-wider">СТАТИСТИКА СОСТЯЗАНИЯ</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#111] p-3 rounded-2xl border border-[#262626]">
                <div className="text-2xl font-bold font-mono text-white">{users.length}</div>
                <div className="text-[10px] text-[#777] font-mono uppercase">Участников</div>
              </div>
              <div className="bg-[#111] p-3 rounded-2xl border border-[#262626]">
                <div className="text-2xl font-bold font-mono text-[#BAFF00]">{teams.length}</div>
                <div className="text-[10px] text-[#777] font-mono uppercase">Команд</div>
              </div>
              <div className="bg-[#111] p-3 rounded-2xl border border-[#262626]">
                <div className="text-2xl font-bold font-mono text-white">{projects.length}</div>
                <div className="text-[10px] text-[#777] font-mono uppercase">Проектов</div>
              </div>
              <div className="bg-[#111] p-3 rounded-2xl border border-[#262626]">
                <div className="text-2xl font-bold font-mono text-[#BAFF00]">{submissions.length}</div>
                <div className="text-[10px] text-[#777] font-mono uppercase">Сдано работ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

