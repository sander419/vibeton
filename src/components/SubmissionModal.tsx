import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Send, 
  X, 
  CheckSquare, 
  ExternalLink, 
  Github, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  RotateCcw 
} from "lucide-react";
import confetti from "canvas-confetti";
import type { SubmissionGateReport } from "../types";
import { usePersistentDraft } from "../utils/usePersistentDraft";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubmissionFormDraft {
  title: string;
  tagline: string;
  demoUrl: string;
  repoUrl: string;
  videoUrl: string;
  description: string;
  instructions: string;
  checkMvp: boolean;
  checkRepo: boolean;
  checkLive: boolean;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose }) => {
  const { submitProject, validateSubmissionGate, currentUser, projects, teams } = useHackathon();

  const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);
  const userTeam = teams.find(t => t.id === currentUser?.teamId);

  const defaultValues: SubmissionFormDraft = {
    title: userProject?.title || "",
    tagline: userProject?.tagline || "",
    demoUrl: userProject?.demoUrl || "https://",
    repoUrl: userProject?.repoUrl || "https://github.com/",
    videoUrl: userProject?.videoUrl || "",
    description: userProject?.description || "",
    instructions: "1. Откройте Live Demo\n2. Нажмите 'Создать событие' или потестируйте AI Host",
    checkMvp: true,
    checkRepo: true,
    checkLive: true,
  };

  const {
    data: formData,
    updateField,
    clearDraft,
    hasDraft,
    lastSavedTime
  } = usePersistentDraft<SubmissionFormDraft>("vibathon_submission_form_draft", defaultValues);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gate Report state
  const [gateReport, setGateReport] = useState<SubmissionGateReport | null>(null);

  // Live gate check effect
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      try {
        const rep = await validateSubmissionGate({
          repoUrl: formData.repoUrl,
          demoUrl: formData.demoUrl,
          launchInstructions: formData.instructions,
          videoUrl: formData.videoUrl,
          checklist: {
            mvpWorks: formData.checkMvp,
            demoAvailable: formData.checkLive,
            repoAvailable: formData.checkRepo,
            instructionsAdded: formData.instructions.trim().length >= 15,
            videoAdded: !!formData.videoUrl
          }
        });
        setGateReport(rep);
      } catch (e) {
        console.error("Gate validation error:", e);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData, isOpen]);

  if (!isOpen) return null;

  const triggerConfettiAnimation = () => {
    const count = 250;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ["#c8ff3d", "#41f0ff", "#ffffff", "#ff3da6", "#ffb020"]
      });
    };

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.demoUrl.trim() || isSubmitting) return;

    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      await submitProject({
        projectId: userProject?.id || "proj-new",
        title: formData.title,
        tagline: formData.tagline,
        demoUrl: formData.demoUrl,
        repoUrl: formData.repoUrl,
        videoUrl: formData.videoUrl,
        description: formData.description,
        launchInstructions: formData.instructions,
        checklist: {
          mvpWorks: formData.checkMvp,
          demoAvailable: formData.checkLive,
          repoAvailable: formData.checkRepo,
          instructionsAdded: formData.instructions.trim().length >= 15,
          videoAdded: !!formData.videoUrl
        }
      });
      clearDraft();
      setIsSubmittedSuccess(true);
      triggerConfettiAnimation();
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Ошибка при сдаче проекта");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
      <div className="bg-[#0a0c14] border border-[#1e2436] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1e2436] bg-[#0e111c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121627] text-[#c8ff3d] border border-[#2a3148] flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">Финальная сдача проекта</h3>
                <span className="px-2 py-0.5 rounded bg-[#c8ff3d]/10 border border-[#c8ff3d]/30 text-[#c8ff3d] text-[10px] uppercase font-bold">
                  Gate Protected
                </span>
                {hasDraft && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e2436] text-[#8b93ad] text-[10px] font-mono border border-[#2a3148]" title="Черновик автоматически сохранен в локальном хранилище браузера">
                    <Save className="w-3 h-3 text-[#c8ff3d]" />
                    <span>Автосохранено</span>
                    {lastSavedTime && (
                      <span className="text-white/60">
                        {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8b93ad] font-mono">
                Команда: <strong className="text-[#c8ff3d]">{userTeam?.name || "Соло"}</strong> • {currentUser?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasDraft && (
              <button
                type="button"
                onClick={clearDraft}
                title="Очистить сохраненный черновик"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-amber-400 border border-[#2a3148] text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить</span>
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-white border border-[#2a3148] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-mono">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSubmittedSuccess ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#c8ff3d]/20 text-[#c8ff3d] border border-[#c8ff3d]/40 flex items-center justify-center mx-auto animate-bounce shadow-[0_0_20px_rgba(200,255,61,0.35)]">
                <CheckSquare className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white font-mono uppercase flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c8ff3d] animate-pulse" />
                  <span>Проект успешно сдан!</span>
                  <Sparkles className="w-5 h-5 text-[#c8ff3d] animate-pulse" />
                </h4>
                <p className="text-xs text-[#8b93ad] font-mono mt-1">
                  Работа отправлена в судейскую панель для оценки жюри. Конфетти запущены!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#0e111c] hover:bg-[#121627] text-[#c8ff3d] border border-[#2a3148] hover:border-[#c8ff3d] text-xs font-mono uppercase font-bold transition-all"
              >
                Закрыть окно
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-mono text-[#8b93ad] uppercase block mb-1">Название проекта *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="PulseOS Vibeathon Platform"
                  className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#c8ff3d]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8b93ad] uppercase block mb-1">Короткий слоган (Tagline)</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="Живая платформа с AI Host и непрерывным Devlog"
                  className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#c8ff3d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#8b93ad] uppercase mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#c8ff3d]" />
                    <span>Рабочая ссылка (Live Demo) *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.demoUrl}
                    onChange={(e) => updateField("demoUrl", e.target.value)}
                    placeholder="https://my-app.fix-ed.me"
                    className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c8ff3d] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#8b93ad] uppercase mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3 text-[#8b93ad]" />
                    <span>Репозиторий GitHub *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.repoUrl}
                    onChange={(e) => updateField("repoUrl", e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c8ff3d] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#8b93ad] uppercase mb-1 flex items-center gap-1">
                  <Video className="w-3 h-3 text-[#c8ff3d]" />
                  <span>Видеопрезентация / Loom (опционально)</span>
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateField("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/... или loom.com/..."
                  className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c8ff3d] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8b93ad] uppercase block mb-1">Описание решения & ключевые фичи</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Расскажите жюри: что реализовано, какие технологии, как интегрируется в fix-ed.me..."
                  className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl p-3 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#c8ff3d] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#8b93ad] uppercase block mb-1">Инструкция для тестирования / Доступы</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => updateField("instructions", e.target.value)}
                  placeholder="Тестовый аккаунт: demo / demo, или кнопка быстрого входа..."
                  className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c8ff3d] resize-none font-mono"
                />
              </div>

              {/* Live Submission Gates Report */}
              {gateReport && (
                <div className="bg-[#0e111c] p-4 rounded-2xl border border-[#1e2436] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
                      <ShieldCheck className="w-4 h-4 text-[#c8ff3d]" />
                      <span>Автоматические Submission-гейты (Pre-Flight)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${gateReport.overallPass ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950/60 text-amber-400 border border-amber-500/40'}`}>
                      {gateReport.overallPass ? "✓ ВСЕ ГЕЙТЫ ПРОЙДЕНЫ" : "ТРЕБУЕТСЯ ПРОВЕРКА"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-[#121627] border border-[#1e2436] flex items-center justify-between">
                      <span className="text-[#8b93ad]">Git Репозиторий:</span>
                      <span className={`font-bold flex items-center gap-1 ${gateReport.repoGate.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gateReport.repoGate.status === 'PASS' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {gateReport.repoGate.status}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#121627] border border-[#1e2436] flex items-center justify-between">
                      <span className="text-[#8b93ad]">Live Demo URL:</span>
                      <span className={`font-bold flex items-center gap-1 ${gateReport.demoGate.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gateReport.demoGate.status === 'PASS' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {gateReport.demoGate.status}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#121627] border border-[#1e2436] flex items-center justify-between">
                      <span className="text-[#8b93ad]">Инструкции / README:</span>
                      <span className={`font-bold flex items-center gap-1 ${gateReport.readmeGate.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gateReport.readmeGate.status === 'PASS' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {gateReport.readmeGate.status}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#121627] border border-[#1e2436] flex items-center justify-between">
                      <span className="text-[#8b93ad]">Чеклист готовности:</span>
                      <span className={`font-bold flex items-center gap-1 ${gateReport.instructionsGate.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gateReport.instructionsGate.status === 'PASS' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {gateReport.instructionsGate.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory Checklist */}
              <div className="bg-[#0e111c] p-4 rounded-2xl border border-[#1e2436] space-y-2">
                <div className="text-[10px] font-mono text-[#8b93ad] uppercase font-bold tracking-wider">ЧЕКЛИСТ ГОТОВНОСТИ К СДАЧЕ:</div>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.checkMvp}
                    onChange={(e) => updateField("checkMvp", e.target.checked)}
                    className="rounded accent-[#c8ff3d]"
                  />
                  <span>MVP работает и доступен по указанной ссылке</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.checkRepo}
                    onChange={(e) => updateField("checkRepo", e.target.checked)}
                    className="rounded accent-[#c8ff3d]"
                  />
                  <span>Исходный код открыт и закоммичен в репозиторий</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.checkLive}
                    onChange={(e) => updateField("checkLive", e.target.checked)}
                    className="rounded accent-[#c8ff3d]"
                  />
                  <span>Проект полностью готов для экспертной оценки жюри</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1e2436]">
                <div>
                  {hasDraft && (
                    <button
                      type="button"
                      onClick={clearDraft}
                      className="text-[11px] text-[#8b93ad] hover:text-amber-400 underline underline-offset-2 flex items-center gap-1 font-mono sm:hidden"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Сбросить черновик</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#8b93ad] hover:text-white"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.checkMvp || !formData.checkRepo || !formData.checkLive || isSubmitting || (gateReport && !gateReport.overallPass)}
                    className="px-6 py-2.5 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff5e] disabled:opacity-50 text-[#06070c] font-black font-mono uppercase text-xs shadow-[0_0_15px_rgba(200,255,61,0.3)] flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Проверка и отправка..." : "Отправить проект"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

