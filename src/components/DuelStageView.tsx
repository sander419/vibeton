import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import {
  Swords,
  Play,
  Pause,
  SkipForward,
  Trophy,
  Flame,
  Vote,
  Sparkles,
  Code2,
  Clock,
  Radio,
  Zap,
  CheckCircle2
} from "lucide-react";
import confetti from "canvas-confetti";
import { sound } from "../utils/audio";

export const DuelStageView: React.FC = () => {
  const { activeDuel, sendDuelAction, voteDuel, currentRole, currentUser } = useHackathon();
  const [isVoting, setIsVoting] = useState(false);
  const [voteMessage, setVoteMessage] = useState<string | null>(null);

  if (!activeDuel) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#0e111c] border border-[#1e2436] font-mono space-y-4">
        <Swords className="w-12 h-12 text-[#ff3da6] mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-white uppercase">Дуэль не инициализирована</h3>
        <p className="text-xs text-[#8b93ad]">
          Выберите событие в формате 1v1 Cyber Duel в каталоге соревнований.
        </p>
      </div>
    );
  }

  const {
    currentRound,
    totalRounds,
    timeRemainingSeconds,
    status,
    roundPrompt,
    participantA,
    participantB,
    roundsHistory
  } = activeDuel;

  const totalVotes = (participantA.votes || 0) + (participantB.votes || 0);
  const percentA = totalVotes > 0 ? Math.round((participantA.votes / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? 100 - percentA : 50;

  const isFinished = status === "FINISHED";
  const winnerSide = isFinished ? (participantA.score >= participantB.score ? "a" : "b") : null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleVote = async (participantId: string) => {
    sound.playClick();
    try {
      setIsVoting(true);
      setVoteMessage(null);
      await voteDuel(participantId);
      sound.playSuccess();
      setVoteMessage("✓ Ваш голос учтен аудиторией!");
      setTimeout(() => setVoteMessage(null), 3000);
    } catch (err: any) {
      setVoteMessage(err.message || "Голос не принят");
      setTimeout(() => setVoteMessage(null), 3000);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinishDuel = () => {
    sound.playBroadcastChime();
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#c8ff3d", "#41f0ff", "#ff3da6", "#ffffff"]
    });
    sendDuelAction("finish");
  };

  const codeSnippetsA = [
    "const stage = new CanvasEngine('#root')",
    "await ws.connect('wss://duel.engine/stream')",
    "function renderHUD(state) {",
    "  shader.uniforms.uTime = clock.now()",
    "  gl.drawArrays(gl.TRIANGLES, 0, 6)",
    "}",
    "git commit -m 'feat: 60fps webgl shader'",
    "build: ok in 0.8s (zero errors)"
  ];

  const codeSnippetsB = [
    "import { createSignal, createEffect } from 'solid-js'",
    "const [combo, setCombo] = createSignal(12)",
    "export function DuelOverlay() {",
    "  return <div class='neon-glow'>{combo()}</div>",
    "}",
    "git push origin main (HEAD -> arena)",
    "test: 24 passed | bundle: 14kb",
    "stream.broadcast({ ready: true })"
  ];

  return (
    <div className="space-y-8 font-sans animate-in fade-in">
      {/* Top Banner: Arena Status & Controls */}
      <div className="relative rounded-3xl bg-[#0e111c] border border-[#1e2436] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ff3da6]/10 border border-[#ff3da6]/30 text-[#ff3da6] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,61,166,0.25)]">
              <Swords className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#ff3da6]/15 text-[#ff3da6] text-[10.5px] font-mono font-bold uppercase tracking-wider border border-[#ff3da6]/30 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>1V1 CYBER DUEL ARENA</span>
                </span>
                <span className="text-xs font-mono text-[#8b93ad]">
                  РАУНД <strong className="text-white">{currentRound}</strong> / <strong className="text-white">{totalRounds}</strong>
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                {participantA.name} <span className="text-[#ff3da6] drop-shadow-[0_0_15px_rgba(255,61,166,0.5)]">VS</span> {participantB.name}
              </h1>
            </div>
          </div>

          {/* Central Timer & Match State */}
          <div className="flex items-center gap-4 bg-[#0a0c14] px-6 py-3 rounded-2xl border border-[#1e2436] font-mono">
            <div className="text-center">
              <div className="text-[10px] uppercase text-[#8b93ad] tracking-widest">Таймер раунда</div>
              <div className={`font-display text-3xl sm:text-4xl font-black tracking-wider ${timeRemainingSeconds <= 30 && status === 'IN_PROGRESS' ? 'text-[#ff4d5e] animate-pulse' : 'text-[#c8ff3d]'}`}>
                {formatTimer(timeRemainingSeconds)}
              </div>
            </div>
            <div className="h-10 w-px bg-[#1e2436]" />
            <div className="text-center">
              <div className="text-[10px] uppercase text-[#8b93ad] tracking-widest">Статус</div>
              <div className="text-xs font-bold uppercase mt-1">
                {status === "IN_PROGRESS" && <span className="text-[#c8ff3d]">В бою (LIVE)</span>}
                {status === "PAUSED" && <span className="text-[#ffb020]">Пауза</span>}
                {status === "FINISHED" && <span className="text-[#ff3da6]">Завершено</span>}
                {status === "IDLE" && <span className="text-[#8b93ad]">Ожидание</span>}
              </div>
            </div>
          </div>

          {/* Host & Organizer Controls */}
          {(currentRole === "organizer" || currentRole === "judge") && (
            <div className="flex items-center gap-2 font-mono">
              {status === "IN_PROGRESS" ? (
                <button
                  onClick={() => sendDuelAction("pause")}
                  className="px-3.5 py-2 rounded-xl bg-[#0a0c14] hover:bg-[#121627] text-[#ffb020] border border-[#ffb020]/30 text-xs font-bold uppercase flex items-center gap-1.5 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Пауза</span>
                </button>
              ) : (
                <button
                  onClick={() => sendDuelAction("start")}
                  className="px-3.5 py-2 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff66] text-[#06070c] text-xs font-bold uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(200,255,61,0.3)] transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Старт</span>
                </button>
              )}

              <button
                onClick={() => sendDuelAction("next_round")}
                className="px-3 py-2 rounded-xl bg-[#0a0c14] hover:bg-[#121627] text-[#41f0ff] border border-[#41f0ff]/30 text-xs font-bold uppercase transition-all"
                title="Перейти к следующему раунду"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleFinishDuel}
                className="px-3 py-2 rounded-xl bg-[#0a0c14] hover:bg-[#121627] text-[#ff3da6] border border-[#ff3da6]/30 text-xs font-bold uppercase transition-all"
                title="Завершить дуэль и показать победителя"
              >
                <Trophy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Task Objective of the Round */}
        <div className="mt-6 p-4 rounded-2xl bg-[#0a0c14] border border-[#1e2436]">
          <div className="text-[11px] font-mono text-[#41f0ff] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>ЗАДАНИЕ РАУНДА {currentRound}</span>
          </div>
          <p className="text-sm font-bold text-white font-body">
            {roundPrompt || "Сверстать адаптивный киберспортивный HUD с таймером и живыми счетчиками за 75 секунд."}
          </p>
        </div>
      </div>

      {/* 2. SPLIT SCREEN DUEL ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* PARTICIPANT A (Cyan Corner) */}
        <div className={`lg:col-span-5 rounded-3xl bg-[#0e111c] border overflow-hidden transition-all shadow-xl flex flex-col justify-between ${
          winnerSide === "a"
            ? "border-[#c8ff3d] shadow-[0_0_30px_rgba(200,255,61,0.25)]"
            : "border-[#1e2436]"
        }`}>
          {/* Virtual Codeflow & WebRTC Box */}
          <div className="relative h-60 bg-[#05060a] p-4 font-mono text-xs overflow-hidden border-b border-[#1e2436]">
            <div className="space-y-1 text-[#41f0ff]/70 leading-relaxed select-none">
              {codeSnippetsA.map((line, idx) => (
                <div key={idx} className="animate-code-line truncate">
                  {line}
                </div>
              ))}
            </div>

            {/* Simulated Live WebCam Tag */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-[#06070c]/90 border border-[#2a3148] rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#41f0ff] animate-ping" />
              <span className="text-xs font-bold text-white">{participantA.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#41f0ff]/15 text-[#41f0ff] font-bold">CAM</span>
            </div>
          </div>

          {/* Player Info & Live Vote Button */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white">{participantA.name}</h3>
                <div className="text-xs font-mono text-[#41f0ff]">
                  Счет по раундам: <strong className="text-white text-sm">{participantA.score}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xl font-black text-[#41f0ff]">{participantA.votes || 0}</div>
                <div className="text-[10px] text-[#8b93ad]">голосов зрителей</div>
              </div>
            </div>

            <button
              onClick={() => handleVote(participantA.id)}
              disabled={isVoting || isFinished}
              className="w-full py-3 rounded-xl bg-[#41f0ff]/10 hover:bg-[#41f0ff]/20 text-[#41f0ff] border border-[#41f0ff]/40 hover:border-[#41f0ff] font-mono font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(65,240,255,0.15)] disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>⚡ Голос за {participantA.name}</span>
            </button>
          </div>
        </div>

        {/* CENTER SCOREBOARD & AUDIENCE VOTE GAUGE (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-6 py-6 font-mono text-center">
          <div className="font-display font-black text-3xl text-[#ff3da6] drop-shadow-[0_0_20px_rgba(255,61,166,0.6)]">
            VS
          </div>

          <div className="w-full space-y-2 bg-[#0a0c14] border border-[#1e2436] p-4 rounded-2xl">
            <div className="text-[10px] text-[#8b93ad] uppercase tracking-wider">Голоса аудитории</div>
            <div className="h-3 rounded-full bg-[#121627] overflow-hidden flex">
              <div
                className="bg-[#41f0ff] transition-all duration-500"
                style={{ width: `${percentA}%` }}
              />
              <div
                className="bg-[#ff3da6] transition-all duration-500"
                style={{ width: `${percentB}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-[#41f0ff]">{percentA}%</span>
              <span className="text-[#ff3da6]">{percentB}%</span>
            </div>
          </div>

          {voteMessage && (
            <div className="text-xs font-bold text-[#c8ff3d] bg-[#c8ff3d]/10 px-3 py-1.5 rounded-lg border border-[#c8ff3d]/30 animate-in fade-in">
              {voteMessage}
            </div>
          )}
        </div>

        {/* PARTICIPANT B (Magenta Corner) */}
        <div className={`lg:col-span-5 rounded-3xl bg-[#0e111c] border overflow-hidden transition-all shadow-xl flex flex-col justify-between ${
          winnerSide === "b"
            ? "border-[#c8ff3d] shadow-[0_0_30px_rgba(200,255,61,0.25)]"
            : "border-[#1e2436]"
        }`}>
          {/* Virtual Codeflow & WebRTC Box */}
          <div className="relative h-60 bg-[#05060a] p-4 font-mono text-xs overflow-hidden border-b border-[#1e2436]">
            <div className="space-y-1 text-[#ff3da6]/70 leading-relaxed select-none">
              {codeSnippetsB.map((line, idx) => (
                <div key={idx} className="animate-code-line truncate">
                  {line}
                </div>
              ))}
            </div>

            {/* Simulated Live WebCam Tag */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-[#06070c]/90 border border-[#2a3148] rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff3da6] animate-ping" />
              <span className="text-xs font-bold text-white">{participantB.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ff3da6]/15 text-[#ff3da6] font-bold">CAM</span>
            </div>
          </div>

          {/* Player Info & Live Vote Button */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white">{participantB.name}</h3>
                <div className="text-xs font-mono text-[#ff3da6]">
                  Счет по раундам: <strong className="text-white text-sm">{participantB.score}</strong>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xl font-black text-[#ff3da6]">{participantB.votes || 0}</div>
                <div className="text-[10px] text-[#8b93ad]">голосов зрителей</div>
              </div>
            </div>

            <button
              onClick={() => handleVote(participantB.id)}
              disabled={isVoting || isFinished}
              className="w-full py-3 rounded-xl bg-[#ff3da6]/10 hover:bg-[#ff3da6]/20 text-[#ff3da6] border border-[#ff3da6]/40 hover:border-[#ff3da6] font-mono font-bold text-xs uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,61,166,0.15)] disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>⚡ Голос за {participantB.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. WINNER CELEBRATION BLOCK IF DUEL FINISHED */}
      {isFinished && (
        <div className="relative rounded-3xl bg-gradient-to-br from-[#c8ff3d]/15 via-[#0e111c] to-[#41f0ff]/10 border border-[#c8ff3d]/50 p-8 text-center space-y-3 shadow-2xl">
          <div className="text-5xl">🏆</div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-[#c8ff3d] bg-[#c8ff3d]/10 border border-[#c8ff3d]/40">
            ПОБЕДИТЕЛЬ КИБЕР-ДУЭЛИ
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white">
            {winnerSide === "a" ? participantA.name : participantB.name}
          </h2>
          <p className="text-sm font-mono text-[#8b93ad]">
            Итоговый счет: {participantA.score} : {participantB.score} · Решение аудитории и жюри
          </p>
        </div>
      )}
    </div>
  );
};
