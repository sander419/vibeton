import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { Send, X, CheckSquare, ExternalLink, Github, Video, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose }) => {
  const { submitProject, currentUser, projects, teams } = useHackathon();

  const userProject = projects.find(p => p.teamId === currentUser?.teamId || p.authorId === currentUser?.id);
  const userTeam = teams.find(t => t.id === currentUser?.teamId);

  const [title, setTitle] = useState(userProject?.title || "");
  const [tagline, setTagline] = useState(userProject?.tagline || "");
  const [demoUrl, setDemoUrl] = useState(userProject?.demoUrl || "https://");
  const [repoUrl, setRepoUrl] = useState(userProject?.repoUrl || "https://github.com/");
  const [videoUrl, setVideoUrl] = useState(userProject?.videoUrl || "");
  const [description, setDescription] = useState(userProject?.description || "");
  const [instructions, setInstructions] = useState("1. Откройте Live Demo\n2. Нажмите 'Создать событие' или потестируйте AI Host");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Checkboxes
  const [checkMvp, setCheckMvp] = useState(true);
  const [checkRepo, setCheckRepo] = useState(true);
  const [checkLive, setCheckLive] = useState(true);

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
        colors: ["#BAFF00", "#00FFCC", "#FFFFFF", "#FFEA00", "#39FF14"]
      });
    };

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !demoUrl.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await submitProject({
        projectId: userProject?.id || "proj-new",
        title,
        tagline,
        demoUrl,
        repoUrl,
        videoUrl,
        description,
        instructions
      });
      setIsSubmittedSuccess(true);
      triggerConfettiAnimation();
      setTimeout(() => {
        setIsSubmittedSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#262626] bg-[#111] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#151515] text-[#BAFF00] border border-[#333] flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">Финальная сдача проекта</h3>
              <p className="text-xs text-[#888] font-mono">
                Команда: <strong className="text-[#BAFF00]">{userTeam?.name || "Соло"}</strong> • {currentUser?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#151515] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 font-mono">
          {isSubmittedSuccess ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40 flex items-center justify-center mx-auto animate-bounce shadow-[0_0_20px_rgba(186,255,0,0.35)]">
                <CheckSquare className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white font-mono uppercase flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#BAFF00] animate-pulse" />
                  <span>Проект успешно сдан!</span>
                  <Sparkles className="w-5 h-5 text-[#BAFF00] animate-pulse" />
                </h4>
                <p className="text-xs text-[#888] font-mono mt-1">
                  Работа отправлена в судейскую панель для оценки жюри. Конфетти запущены!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-[#151515] hover:bg-[#222] text-[#BAFF00] border border-[#333] hover:border-[#BAFF00] text-xs font-mono uppercase font-bold transition-all"
              >
                Закрыть окно
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Название проекта *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="PulseOS Vibeathon Platform"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Короткий слоган (Tagline)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Живая платформа с AI Host и непрерывным Devlog"
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#888] uppercase mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#BAFF00]" />
                    <span>Рабочая ссылка (Live Demo) *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://my-app.fix-ed.me"
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#888] uppercase mb-1 flex items-center gap-1">
                    <Github className="w-3 h-3 text-[#888]" />
                    <span>Репозиторий GitHub *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase mb-1 flex items-center gap-1">
                  <Video className="w-3 h-3 text-[#BAFF00]" />
                  <span>Видеопрезентация / Loom (опционально)</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/... или loom.com/..."
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Описание решения & ключевые фичи</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите жюри: что реализовано, какие технологии, как интегрируется в fix-ed.me..."
                  className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#888] uppercase block mb-1">Инструкция для тестирования / Доступы</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Тестовый аккаунт: demo / demo, или кнопка быстрого входа..."
                  className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] resize-none font-mono"
                />
              </div>

              {/* Mandatory Checklist */}
              <div className="bg-[#111] p-4 rounded-2xl border border-[#262626] space-y-2">
                <div className="text-[10px] font-mono text-[#888] uppercase font-bold tracking-wider">ЧЕКЛИСТ ГОТОВНОСТИ К СДАЧЕ:</div>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkMvp}
                    onChange={(e) => setCheckMvp(e.target.checked)}
                    className="rounded accent-[#BAFF00]"
                  />
                  <span>MVP работает и доступен по указанной ссылке</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkRepo}
                    onChange={(e) => setCheckRepo(e.target.checked)}
                    className="rounded accent-[#BAFF00]"
                  />
                  <span>Исходный код открыт и закоммичен в репозиторий</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#DDD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkLive}
                    onChange={(e) => setCheckLive(e.target.checked)}
                    className="rounded accent-[#BAFF00]"
                  />
                  <span>Проект соответствует теме "Платформа для проведения Вайбатонов"</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-[#888] hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!checkMvp || !checkRepo || !checkLive || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-50 text-black font-bold font-mono uppercase text-xs shadow-[0_0_12px_rgba(186,255,0,0.3)] flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить проект</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

