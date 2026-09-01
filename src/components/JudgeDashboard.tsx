import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Award, 
  CheckCircle2, 
  ExternalLink, 
  Github, 
  Video, 
  Star, 
  Sparkles, 
  Trophy, 
  Bot, 
  Send, 
  RotateCcw,
  Shield,
  Loader2,
  FileCheck
} from "lucide-react";
import type { Submission, Judgement } from "../types";

export const JudgeDashboard: React.FC = () => {
  const {
    submissions,
    judgements,
    hackathon,
    currentUser,
    currentRole,
    submitJudgement,
    publishResults,
    getAIFinalRecap,
    updateHackathon
  } = useHackathon();

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(submissions[0]?.id || "");
  const [scores, setScores] = useState<Record<string, number>>({
    mvp: 9,
    ai_host: 9,
    ux_vibe: 9,
    viability: 9
  });
  const [feedback, setFeedback] = useState("Отличная динамика в Devlog, рабочий сокет-сервер и живой AI Host!");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [recapData, setRecapData] = useState<any>(null);
  const [isLoadingRecap, setIsLoadingRecap] = useState(false);

  const selectedSub = submissions.find(s => s.id === selectedSubmissionId) || submissions[0];

  const handleScoreChange = (criteria: string, val: number) => {
    setScores(prev => ({ ...prev, [criteria]: val }));
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || isSubmittingScore) return;
    try {
      setIsSubmittingScore(true);
      await submitJudgement(selectedSub.id, scores, feedback);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleLoadRecap = async () => {
    setIsLoadingRecap(true);
    try {
      const data = await getAIFinalRecap();
      setRecapData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRecap(false);
    }
  };

  const handleFinalizeAndPublish = async () => {
    // Generate awards
    const awards = [
      {
        id: "aw-1",
        title: "1-е МЕСТО (ГРАН-ПРИ ВАЙБАТОНА)",
        submissionId: submissions[0]?.id,
        teamName: submissions[0]?.teamName,
        projectTitle: submissions[0]?.title,
        badge: "🏆",
        reason: "Наиболее полное попадание в тему, работающий AI Host, сокет-сервер и идеальный Devlog."
      },
      {
        id: "aw-2",
        title: "2-е МЕСТО",
        submissionId: submissions[1]?.id,
        teamName: submissions[1]?.teamName,
        projectTitle: submissions[1]?.title,
        badge: "🥈",
        reason: "Отличный темп разработки и быстрый релиз MVP."
      },
      {
        id: "aw-3",
        title: "ЛУЧШИЙ LIVE-VIBE & UX",
        submissionId: submissions[0]?.id,
        teamName: submissions[0]?.teamName,
        projectTitle: submissions[0]?.title,
        badge: "⚡",
        reason: "Высокая интерактивность, звуковое сопровождение и удобный интерфейс."
      }
    ];

    await publishResults(awards);
  };

  const defaultCriteria = [
    { id: "mvp", title: "MVP & Работоспособность", desc: "Работоспособность прототипа, стабильность и архитектура" },
    { id: "ai_core", title: "AI Host & Интеллектуальное ядро", desc: "Уровень интеграции AI, голосовые сводки, генерация контекста" },
    { id: "ux_vibe", title: "Live-атмосфера и UX", desc: "Удобство Devlog, динамика, таймеры, звук, визуал" },
    { id: "viability", title: "Польза для платформы", desc: "Готовность к встраиванию в fix-ed.me и проведению будущих хакатонов" }
  ];

  const criteriaList = hackathon?.criteria?.length
    ? hackathon.criteria.map((c) => ({
        id: c.id,
        title: c.name,
        desc: c.description
      }))
    : defaultCriteria;

  return (
    <div className="space-y-8 mb-8 font-mono">
      {/* Stage Context Banner */}
      <div className="bg-[#0a0c14] border border-[#1e2436] rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#c8ff3d] uppercase tracking-wider">СУДЕЙСКАЯ КОЛЛЕГИЯ</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0e111c] text-[#8b93ad] border border-[#2a3148]">
              ЭТАП: {hackathon?.stage}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase tracking-wider mt-1">
            {hackathon?.stage === "RESULTS" ? "Официальные итоги Вайбатона №2" : "Экспертная оценка проектов"}
          </h2>
          <p className="text-xs text-[#8b93ad] mt-1 font-mono">
            Честное экспертное судейство с прозрачными критериями оценки (1-10) и фидбеком
          </p>
        </div>

        {/* Quick Stage Switchers for testing */}
        <div className="flex flex-wrap items-center gap-2">
          {hackathon?.stage !== "RESULTS" ? (
            <button
              onClick={handleFinalizeAndPublish}
              className="px-4 py-2.5 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff5e] text-[#06070c] font-black font-mono uppercase text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(200,255,61,0.3)] transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>Опубликовать итоги</span>
            </button>
          ) : (
            <button
              onClick={() => updateHackathon({ stage: "JUDGING" })}
              className="px-3.5 py-2 rounded-xl bg-[#0e111c] hover:bg-[#121627] text-xs font-mono uppercase text-[#8b93ad] border border-[#2a3148]"
            >
              Вернуть этап Судейства
            </button>
          )}

          <button
            onClick={handleLoadRecap}
            disabled={isLoadingRecap}
            className="px-4 py-2.5 rounded-xl bg-[#0e111c] hover:bg-[#121627] text-[#c8ff3d] border border-[#2a3148] hover:border-[#c8ff3d]/60 text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all"
          >
            {isLoadingRecap ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>AI Recap финала</span>
          </button>
        </div>
      </div>

      {/* WINNERS PODIUM & AWARDS (Visible when RESULTS stage is active or awards exist) */}
      {(hackathon?.stage === "RESULTS" || hackathon?.awards?.length) && (
        <div className="bg-[#0a0c14] border border-[#c8ff3d]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8ff3d]/10 border border-[#c8ff3d]/30 text-[#c8ff3d] text-xs font-mono font-bold uppercase tracking-wider">
              🏆 ОФИЦИАЛЬНОЕ НАГРАЖДЕНИЕ
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono uppercase tracking-wider">
              Победители Вайбатона №2
            </h3>
            <p className="text-xs sm:text-sm text-[#8b93ad] max-w-xl mx-auto font-mono">
              Поздравляем команды с успешным созданием и защитой проектов автоматизации хакатонов!
            </p>
          </div>

          {/* Podium Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {/* 2nd Place */}
            <div className="bg-[#0e111c] border border-[#1e2436] rounded-3xl p-6 text-center space-y-3 order-2 md:order-1">
              <div className="text-3xl">🥈</div>
              <div className="text-xs font-mono text-[#8b93ad] uppercase font-bold">2-е МЕСТО</div>
              <h4 className="text-lg font-bold text-white font-mono uppercase">
                {hackathon?.awards?.[1]?.projectTitle || "VibePulse Studio"}
              </h4>
              <p className="text-xs text-[#8b93ad] font-mono">
                Команда: {hackathon?.awards?.[1]?.teamName || "Pulse Team"}
              </p>
              <div className="text-xs text-[#b8c2db] bg-[#06070c] p-3 rounded-2xl border border-[#1e2436]">
                {hackathon?.awards?.[1]?.reason || "Отличная скорость разработки MVP и чистая архитектура."}
              </div>
            </div>

            {/* 1st Place (Grand Prix) */}
            <div className="bg-[#0e111c] border-2 border-[#c8ff3d] rounded-3xl p-8 text-center space-y-4 shadow-[0_0_20px_rgba(200,255,61,0.2)] order-1 md:order-2 transform md:-translate-y-4">
              <div className="text-5xl animate-bounce">🏆</div>
              <div className="text-xs font-mono text-[#c8ff3d] uppercase font-bold tracking-widest">
                ГРАН-ПРИ ВАЙБАТОНА
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase">
                {hackathon?.awards?.[0]?.projectTitle || "FixEd Vibeathon Platform"}
              </h4>
              <p className="text-xs sm:text-sm text-[#c8ff3d] font-mono font-bold">
                Команда: {hackathon?.awards?.[0]?.teamName || "CyberVibe Studio"}
              </p>
              <div className="text-xs text-[#e9edf8] bg-[#06070c] p-4 rounded-2xl border border-[#2a3148] leading-relaxed">
                {hackathon?.awards?.[0]?.reason || "Комплексное решение с AI Host, сокет-эфиром, Devlog и интеграцией в fix-ed.me."}
              </div>
            </div>

            {/* 3rd / Special */}
            <div className="bg-[#0e111c] border border-[#1e2436] rounded-3xl p-6 text-center space-y-3 order-3">
              <div className="text-3xl">⚡</div>
              <div className="text-xs font-mono text-[#c8ff3d] uppercase font-bold">СПЕЦПРИЗ ЗА LIVE-VIBE</div>
              <h4 className="text-lg font-bold text-white font-mono uppercase">
                {hackathon?.awards?.[2]?.projectTitle || "FixEd Vibeathon Platform"}
              </h4>
              <p className="text-xs text-[#8b93ad] font-mono">
                Команда: {hackathon?.awards?.[2]?.teamName || "CyberVibe Studio"}
              </p>
              <div className="text-xs text-[#b8c2db] bg-[#06070c] p-3 rounded-2xl border border-[#1e2436]">
                {hackathon?.awards?.[2]?.reason || "Лучшая динамика трансляции и реализация звука ведущего."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Final Recap (Cinematic Story of the Hackathon) */}
      {recapData && (
        <div className="bg-[#0a0c14] border border-[#1e2436] rounded-3xl p-6 sm:p-8 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-[#c8ff3d]" />
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white font-mono uppercase">{recapData.headline}</h4>
              <p className="text-xs text-[#8b93ad] font-mono">Генеративная хроника Вайбатона от AI Host</p>
            </div>
          </div>

          <div className="p-5 bg-[#0e111c] rounded-2xl border border-[#1e2436] text-xs sm:text-sm text-[#e9edf8] leading-relaxed whitespace-pre-line font-mono">
            {recapData.story}
          </div>

          {recapData.highlights?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {recapData.highlights.map((h: string, i: number) => (
                <div key={i} className="p-3 bg-[#0e111c] rounded-xl border border-[#1e2436] text-xs text-[#8b93ad] font-mono">
                  ⚡ {h}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Evaluation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Submissions Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white font-mono uppercase">Сданные проекты ({submissions.length})</h3>
            <span className="text-xs text-[#8b93ad] font-mono">Выберите для оценки</span>
          </div>

          {submissions.map((sub) => {
            const isSelected = selectedSub?.id === sub.id;
            const subJudgements = judgements.filter(j => j.submissionId === sub.id);
            const myJudgement = subJudgements.find(j => j.judgeId === currentUser?.id);

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmissionId(sub.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? "bg-[#0e111c] border-[#c8ff3d] shadow-[0_0_12px_rgba(200,255,61,0.2)]"
                    : "bg-[#0a0c14] border-[#1e2436] hover:border-[#2a3148]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#121627] text-[#c8ff3d] font-bold border border-[#2a3148]">
                    {sub.teamName}
                  </span>
                  {myJudgement ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c8ff3d]/20 text-[#c8ff3d] border border-[#c8ff3d]/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Оценено ({myJudgement.totalScore.toFixed(1)}/10)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#8b93ad]">
                      Оценок: {subJudgements.length}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white font-mono uppercase">{sub.title}</h4>
                <p className="text-xs text-[#8b93ad] line-clamp-2 font-mono">{sub.tagline || sub.description}</p>

                <div className="flex items-center gap-2 pt-2 text-xs">
                  <a
                    href={sub.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#c8ff3d] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Demo</span>
                  </a>
                  <span className="text-[#2a3148]">•</span>
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#8b93ad] hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Github className="w-3 h-3" />
                    <span>Repo</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Cols: Evaluation Form */}
        <div className="lg:col-span-7">
          {selectedSub ? (
            <div className="bg-[#0a0c14] border border-[#1e2436] rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-[#c8ff3d] uppercase font-bold">ОЦЕНОЧНЫЙ ЛИСТ ЖЮРИ</span>
                  <span className="text-xs text-[#8b93ad] font-mono">Судья: {currentUser?.name || "Эксперт"}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-mono uppercase">{selectedSub.title}</h3>
                <p className="text-xs text-[#8b93ad] mt-1 font-mono">{selectedSub.description}</p>
              </div>

              {/* Rubric Sliders */}
              <form onSubmit={handleSubmitEvaluation} className="space-y-5">
                {criteriaList.map((c) => {
                  const currentVal = scores[c.id] || 8;
                  return (
                    <div key={c.id} className="bg-[#0e111c] p-4 rounded-2xl border border-[#1e2436] space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white uppercase">{c.title}</div>
                          <div className="text-[10px] text-[#8b93ad]">{c.desc}</div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-[#121627] text-[#c8ff3d] border border-[#2a3148] flex items-center justify-center font-mono font-bold text-sm">
                          {currentVal}
                        </div>
                      </div>

                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={currentVal}
                        onChange={(e) => handleScoreChange(c.id, Number(e.target.value))}
                        className="w-full accent-[#c8ff3d] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-[#8b93ad]">
                        <span>1 (Слабо)</span>
                        <span>5 (Базово)</span>
                        <span>10 (Идеально)</span>
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label className="text-xs font-mono text-[#8b93ad] uppercase block mb-1">
                    Комментарий и фидбек команде *
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Напишите сильные стороны проекта и рекомендации..."
                    className="w-full bg-[#0e111c] border border-[#2a3148] rounded-xl p-3 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#c8ff3d] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingScore}
                  className="w-full py-3 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff5e] text-[#06070c] font-black font-mono uppercase text-xs shadow-[0_0_15px_rgba(200,255,61,0.3)] flex items-center justify-center gap-2 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Сохранить оценку и отправить фидбек</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0a0c14] rounded-3xl border border-[#1e2436] text-[#8b93ad] font-mono">
              Нет доступных работ для оценки
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
