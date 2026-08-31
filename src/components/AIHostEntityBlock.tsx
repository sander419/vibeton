import React, { useState, useEffect } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Bot, 
  Volume2, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  ShieldCheck, 
  Zap,
  Pause,
  Send,
  Cpu,
  Flame,
  Clock,
  Code2,
  Terminal,
  Activity,
  ChevronRight,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { speakText, stopSpeech } from "../utils/audio";

type EntityPersona = "streamer" | "mentor" | "roast" | "timekeeper";

interface ChatLogItem {
  id: string;
  sender: "user" | "entity";
  text: string;
  persona?: EntityPersona;
  timestamp: string;
}

export const AIHostEntityBlock: React.FC = () => {
  const { 
    aiMessages, 
    triggerAIHostBroadcast, 
    askAIHost, 
    hackathon, 
    posts, 
    teams, 
    projects, 
    users, 
    events, 
    currentUser 
  } = useHackathon();

  // Persona State
  const [selectedPersona, setSelectedPersona] = useState<EntityPersona>("streamer");
  const [activeSubTab, setActiveSubTab] = useState<"broadcast" | "chat" | "pulse">("broadcast");

  // Voice State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // In-Block Chat State
  const [promptInput, setPromptInput] = useState<string>("");
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>([
    {
      id: "init-1",
      sender: "entity",
      text: `Привет, ${currentUser?.name || "разработчик"}! Я живая AI-сущность Вайбатона №2. Я синхронизирован с Devlog-лентой, репозиториями команд и таймером дедлайна. Выбери режим общения или задай любой вопрос!`,
      persona: "streamer",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Ambient Live Banter Ticker
  const [ambientBanterIndex, setAmbientBanterIndex] = useState<number>(0);
  const ambientThoughts = [
    `Слежу за коммитами: ${projects.filter(p => p.status === 'MVP').length} проект уже в статусе MVP. Темп отличный!`,
    `До дедлайна сдачи работ осталось менее 5 дней. Проверьте чеклист в шапке.`,
    `Режим фиксации прогресса: публикуйте Devlog раз в несколько часов, чтобы жюри видело путь разработки.`,
    `Fix-Ed Community Node активен. Жюри-люди уже подключены и наблюдают за лентой событий.`,
    `Команда ${teams[0]?.name || "Team Pulse"} лидирует по числу реакций в Devlog!`
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAmbientBanterIndex(prev => (prev + 1) % ambientThoughts.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [ambientThoughts.length]);

  const latestMessage = aiMessages[0] || {
    id: "default-host",
    title: "В ЭФИРЕ AI HOST ВАЙБАТОНА",
    content: "Вайбатон №2 в самом разгаре. 7 дней на разработку. Делитесь обновлениями в Devlog, объединяйтесь в команды и показывайте первые MVP!",
    statsSnapshot: {
      participants: users.length,
      teams: teams.length,
      projects: projects.length,
      mvps: projects.filter(p => p.status === "MVP" || p.status === "DEMO").length,
      submissions: 0,
      progressPosts: posts.length,
      hoursLeft: 108
    },
    createdAt: new Date().toISOString()
  };

  const handleToggleVoice = (textToSpeak?: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const text = textToSpeak || `${latestMessage.title}. ${latestMessage.content}`;
      speakText(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleTriggerBroadcast = async () => {
    try {
      setIsBroadcasting(true);
      const msg = await triggerAIHostBroadcast(`Запрос эфира в режиме ${selectedPersona.toUpperCase()}`);
      if (msg) {
        handleToggleVoice(`${msg.title}. ${msg.content}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSendPrompt = async (customPrompt?: string) => {
    const q = (customPrompt || promptInput).trim();
    if (!q || isQuerying) return;

    const userMsg: ChatLogItem = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatLogs(prev => [...prev, userMsg]);
    setPromptInput("");
    setIsQuerying(true);
    setActiveSubTab("chat");

    try {
      const answer = await askAIHost(q, selectedPersona);
      const entityMsg: ChatLogItem = {
        id: `e-${Date.now()}`,
        sender: "entity",
        text: answer,
        persona: selectedPersona,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatLogs(prev => [...prev, entityMsg]);
      // Speak entity response
      handleToggleVoice(answer);
    } catch (e) {
      console.error("Entity query error:", e);
    } finally {
      setIsQuerying(false);
    }
  };

  // Quick Action Prompts
  const quickActions: Record<EntityPersona, { label: string; prompt: string }[]> = {
    streamer: [
      { label: "🎙️ Озвучь обстановку", prompt: "Озвучь краткую сводку по текущей обстановке в эфире Вайбатона" },
      { label: "⚡ Кто сейчас лидирует?", prompt: "Кто из команд и участников сейчас наиболее активен в Devlog?" },
      { label: "🏆 Критерии оценки жюри", prompt: "Напомни 4 ключевых критерия оценки жюри и максимальные баллы" }
    ],
    mentor: [
      { label: "🛠️ Архитектура MVP", prompt: "Как за 24 часа собрать минимально жизнеспособный MVP для хакатона?" },
      { label: "💡 Идея для Devlog", prompt: "Подскажи цепляющую тему и формат для следующего Devlog-апдейта" },
      { label: "⚡ Оптимизация стека", prompt: "Как связать AI-ассистента и веб-интерфейс без высоких задержек?" }
    ],
    roast: [
      { label: "🔥 Жесткий вайб-чек", prompt: "Сделай дерзкий вайб-чек текущего темпа хакатона и команд" },
      { label: "💀 Разбор отговорок", prompt: "Почему мы все еще не выкатили демо и что нам мешает?" },
      { label: "⚡ Заряди команду", prompt: "Выдай мощную мотивационную речь для ночного код-спринта" }
    ],
    timekeeper: [
      { label: "⏱️ Сколько времени осталось?", prompt: "Сколько точно часов осталось до дедлайна сдачи и какой сейчас этап?" },
      { label: "📋 Чеклист сдачи", prompt: "Что обязательно должно быть готово к моменту финальной сдачи проекта?" },
      { label: "🚨 План на последние 48 часов", prompt: "Какой идеальный таймлайн на финишную прямую хакатона?" }
    ]
  };

  // Cyber Face Expressions
  const getCyberFace = () => {
    if (isSpeaking) return "[ ⚡ ~ ⚡ ]";
    if (isQuerying || isBroadcasting) return "[ ✦ * ✦ ]";
    switch (selectedPersona) {
      case "mentor":
        return "[ ◈ _ ◈ ]";
      case "roast":
        return "[ ಠ _ ಠ ]";
      case "timekeeper":
        return "[ ⏱️ _ ⏱️ ]";
      default:
        return "[ ◉ _ ◉ ]";
    }
  };

  const getPersonaLabel = (p: EntityPersona) => {
    switch (p) {
      case "streamer":
        return "LIVE STREAMER // ВЕДУЩИЙ";
      case "mentor":
        return "TECH MENTOR // АРХИТЕКТОР";
      case "roast":
        return "ROAST & VIBE // КРИТИК";
      case "timekeeper":
        return "CHRONO KEEPER // ТАЙМКИПЕР";
    }
  };

  return (
    <div id="ai-host-entity-block" className="relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-[#333] p-5 sm:p-8 shadow-2xl mb-8 font-mono">
      {/* Background Matrix Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#BAFF0008_1px,transparent_1px),linear-gradient(to_bottom,#BAFF0008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#BAFF00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP ENTITY TELEMETRY HEADER */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#262626]">
        <div className="flex items-center gap-3.5">
          {/* Cybernetic Hologram Core Box */}
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#BAFF00] p-1 shadow-[0_0_20px_rgba(186,255,0,0.25)] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="text-[10px] font-black text-[#BAFF00] tracking-tighter">
                {getCyberFace()}
              </div>
              <span className="text-[8px] font-mono text-[#888] tracking-widest mt-0.5 uppercase">
                {selectedPersona.slice(0, 4)}
              </span>
              {/* Scanline sweep */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#BAFF00]/20 to-transparent h-2 w-full animate-scanline pointer-events-none" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#BAFF00] ring-4 ring-black animate-ping" />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#BAFF00] ring-4 ring-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#BAFF00] tracking-widest uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#BAFF00] animate-pulse"></span>
                СУЩНОСТЬ: AI HOST // SYNAPSE_NODE_01
              </span>
              <span className="hidden sm:inline-block px-2 py-0.2 rounded text-[9px] font-mono bg-[#151515] text-[#AAA] border border-[#333]">
                GEMINI 3.7 FLASH CORE
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white uppercase tracking-wider mt-0.5">
              Живой AI-Ведущий Вайбатона
            </h2>
          </div>
        </div>

        {/* Global Control & Voice Synthesis */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleToggleVoice()}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              isSpeaking
                ? "bg-[#BAFF00] text-black shadow-[0_0_15px_rgba(186,255,0,0.5)] animate-pulse"
                : "bg-[#151515] hover:bg-[#202020] text-white border border-[#333] hover:border-[#BAFF00]"
            }`}
          >
            {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#BAFF00]" />}
            <span>{isSpeaking ? "Остановить голос" : "Голосовой синтез"}</span>
          </button>

          <button
            onClick={handleTriggerBroadcast}
            disabled={isBroadcasting}
            title="Вызвать внеочередную сводку ведущего"
            className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#151515] hover:bg-[#202020] text-[#BAFF00] border border-[#333] hover:border-[#BAFF00] flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBroadcasting ? "animate-spin text-[#BAFF00]" : ""}`} />
            <span>{isBroadcasting ? "Генерация..." : "В эфир"}</span>
          </button>
        </div>
      </div>

      {/* AMBIENT BANTER TICKER BAR */}
      <div className="relative z-10 my-3 bg-[#111] border border-[#222] rounded-xl px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="px-1.5 py-0.5 rounded bg-[#BAFF00]/15 text-[#BAFF00] text-[9px] font-bold tracking-wider shrink-0 uppercase">
            LIVE_THOUGHT
          </span>
          <p className="text-[#CCC] truncate text-[11px] sm:text-xs">
            {ambientThoughts[ambientBanterIndex]}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[10px] text-[#777] shrink-0 font-mono">
          <span>LATENCY: <strong className="text-white">12ms</strong></span>
          <span>DEVLOGS: <strong className="text-[#BAFF00]">{posts.length}</strong></span>
          <span>TEAMS: <strong className="text-white">{teams.length}</strong></span>
        </div>
      </div>

      {/* PERSONA MODES SELECTOR */}
      <div className="relative z-10 mb-5">
        <div className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>РЕЖИМ ПОВЕДЕНИЯ СУЩНОСТИ (PERSONA MODE):</span>
          <span className="text-[#BAFF00] font-bold">{getPersonaLabel(selectedPersona)}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "streamer" as EntityPersona, label: "🎙️ LIVE ВЕДУЩИЙ", desc: "Сводки и динамика эфира" },
            { id: "mentor" as EntityPersona, label: "🧠 АРХИТЕКТОР", desc: "Стек, MVP и тех-советы" },
            { id: "roast" as EntityPersona, label: "🔥 ВАЙБ-ЧЕК", desc: "Дерзкая мотивация и разбор" },
            { id: "timekeeper" as EntityPersona, label: "⏱️ ТАЙМКИПЕР", desc: "Дедлайны и чеклист сдачи" }
          ].map((mode) => {
            const isSelected = selectedPersona === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedPersona(mode.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#151515] border-[#BAFF00] text-white shadow-[0_0_12px_rgba(186,255,0,0.15)] ring-1 ring-[#BAFF00]"
                    : "bg-[#0E0E0E] border-[#262626] text-[#777] hover:border-[#444] hover:text-[#BBB]"
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-[#BAFF00]" : "text-[#AAA]"}`}>
                  {mode.label}
                </div>
                <div className="text-[10px] text-[#666] leading-tight mt-0.5">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* INNER VIEW TABS */}
      <div className="relative z-10 flex items-center gap-2 border-b border-[#222] pb-3 mb-4">
        <button
          onClick={() => setActiveSubTab("broadcast")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeSubTab === "broadcast"
              ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
              : "bg-[#141414] text-[#888] hover:text-white border border-[#262626]"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>📡 Эфир ведущего</span>
        </button>

        <button
          onClick={() => setActiveSubTab("chat")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeSubTab === "chat"
              ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
              : "bg-[#141414] text-[#888] hover:text-white border border-[#262626]"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>💬 Прямой контакт ({chatLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("pulse")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            activeSubTab === "pulse"
              ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.3)]"
              : "bg-[#141414] text-[#888] hover:text-white border border-[#262626]"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>⚡ Пульс данных</span>
        </button>
      </div>

      {/* TAB CONTENT 1: BROADCAST SPEECH */}
      {activeSubTab === "broadcast" && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-[#111] rounded-2xl p-5 border border-[#262626] relative space-y-4">
            {/* Animated Equalizer Waveform when speaking */}
            {isSpeaking && (
              <div className="flex items-center gap-1 p-2 bg-[#151515] rounded-xl border border-[#BAFF00]/30">
                {[40, 75, 30, 95, 50, 85, 60, 100, 45, 90, 35, 70].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-[#BAFF00] rounded-none animate-pulse" 
                    style={{ height: `${h * 0.25}px`, animationDelay: `${i * 0.08}s` }} 
                  />
                ))}
                <span className="text-[11px] font-mono text-[#BAFF00] ml-2 uppercase tracking-wider">
                  Аудио-поток синтеза речи активен...
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-xs text-[#BAFF00] uppercase font-bold tracking-wider mb-1">
                <span>{latestMessage.title}</span>
                <span className="text-[#666] font-mono text-[10px]">
                  {new Date(latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed whitespace-pre-line font-mono">
                {latestMessage.content}
              </p>
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="pt-3 border-t border-[#222]">
              <div className="text-[10px] text-[#888] uppercase tracking-wider mb-2">
                БЫСТРЫЙ ЗАПРОС К СУЩНОСТИ ({selectedPersona.toUpperCase()}):
              </div>
              <div className="flex flex-wrap gap-2">
                {quickActions[selectedPersona].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(action.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-[#161616] hover:bg-[#222] text-[#CCC] hover:text-[#BAFF00] border border-[#333] hover:border-[#BAFF00] text-xs transition-all flex items-center gap-1.5"
                  >
                    <span>{action.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Event Telemetry Panel */}
          <div className="lg:col-span-4 bg-[#111] border border-[#262626] rounded-2xl p-4 space-y-3 font-mono">
            <div className="text-[11px] text-[#BAFF00] uppercase tracking-wider flex items-center justify-between">
              <span>СОСТОЯНИЕ ЭКОСИСТЕМЫ</span>
              <Zap className="w-3.5 h-3.5 text-[#BAFF00]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[#151515] p-2.5 rounded-xl border border-[#222]">
                <div className="text-xl font-bold font-mono text-white">{users.length}</div>
                <div className="text-[9px] text-[#888] uppercase font-mono">Участников</div>
              </div>
              <div className="bg-[#151515] p-2.5 rounded-xl border border-[#222]">
                <div className="text-xl font-bold font-mono text-[#BAFF00]">{teams.length}</div>
                <div className="text-[9px] text-[#888] uppercase font-mono">Команд</div>
              </div>
              <div className="bg-[#151515] p-2.5 rounded-xl border border-[#222]">
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {projects.filter(p => p.status === "MVP" || p.status === "DEMO").length}
                </div>
                <div className="text-[9px] text-[#888] uppercase font-mono">Рабочих MVP</div>
              </div>
              <div className="bg-[#151515] p-2.5 rounded-xl border border-[#222]">
                <div className="text-xl font-bold font-mono text-[#BAFF00]">{posts.length}</div>
                <div className="text-[9px] text-[#888] uppercase font-mono">Devlog постов</div>
              </div>
            </div>

            <div className="text-[10px] text-[#888] bg-[#0c0c0c] p-2.5 rounded-xl border border-[#222] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#BAFF00] shrink-0 mt-0.5" />
              <span>AI Host комментирует хакатон и помогает инженерам. Финальные оценки выставляют только судьи-люди.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DIRECT IN-BLOCK CHAT TERMINAL */}
      {activeSubTab === "chat" && (
        <div className="relative z-10 bg-[#111] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-[#222] pb-2 text-[#888]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#BAFF00]" />
              <span className="text-white uppercase font-bold">ДИАЛОГОВЫЙ ТЕРМИНАЛ С AI HOST</span>
            </div>
            <span className="text-[10px] text-[#BAFF00] bg-[#BAFF00]/10 px-2 py-0.5 rounded border border-[#BAFF00]/20">
              РЕЖИМ: {selectedPersona.toUpperCase()}
            </span>
          </div>

          {/* Chat Stream History */}
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {chatLogs.map((log) => {
              const isMe = log.sender === "user";
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isMe ? "bg-[#222] text-white border border-[#444]" : "bg-[#151515] text-[#BAFF00] border border-[#BAFF00]/40"
                  }`}>
                    {isMe ? (currentUser?.name ? currentUser.name[0] : "U") : "AI"}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isMe 
                      ? "bg-[#1A1A1A] border border-[#333] text-white" 
                      : "bg-[#0E0E0E] border border-[#262626] text-[#DDD] space-y-1.5"
                  }`}>
                    <div className="flex items-center justify-between text-[10px] text-[#777]">
                      <span>{isMe ? "Вы" : `AI Host [${(log.persona || 'STREAMER').toUpperCase()}]`}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{log.text}</p>
                    {!isMe && (
                      <button
                        onClick={() => handleToggleVoice(log.text)}
                        className="text-[10px] text-[#BAFF00] hover:underline flex items-center gap-1 pt-1 font-mono uppercase"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Озвучить реплику</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isQuerying && (
              <div className="flex items-center gap-2 text-xs text-[#BAFF00] p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Host формирует ответ на основе контекста состязания...</span>
              </div>
            )}
          </div>

          {/* Quick Action Chips in Chat View */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#222]">
            {quickActions[selectedPersona].map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(action.prompt)}
                disabled={isQuerying}
                className="px-2.5 py-1 rounded-lg bg-[#161616] hover:bg-[#222] text-[#AAA] hover:text-[#BAFF00] border border-[#262626] hover:border-[#BAFF00] text-[11px] transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Задайте вопрос ведущему в режиме ${selectedPersona.toUpperCase()}...`}
              className="flex-1 bg-[#161616] border border-[#333] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00] font-mono"
            />
            <button
              type="submit"
              disabled={!promptInput.trim() || isQuerying}
              className="px-4 py-2.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] disabled:opacity-50 text-black font-bold uppercase text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)] transition-all font-mono"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Отправить</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 3: SYNAPSE EVENT PULSE RADAR */}
      {activeSubTab === "pulse" && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#262626] rounded-2xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-[#BAFF00] uppercase">1. АКТИВНОСТЬ DEVLOG</div>
            <div className="text-2xl font-bold text-white">{posts.length} публикаций</div>
            <p className="text-[11px] text-[#777]">
              Лента обновляется в реальном времени через Server-Sent Events (SSE).
            </p>
          </div>

          <div className="bg-[#111] border border-[#262626] rounded-2xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-[#BAFF00] uppercase">2. ГОТОВНОСТЬ MVP</div>
            <div className="text-2xl font-bold text-[#BAFF00]">
              {projects.filter(p => p.status === "MVP" || p.status === "DEMO").length} / {projects.length}
            </div>
            <p className="text-[11px] text-[#777]">
              Проекты, уже готовые к предварительному тестированию и демонстрации.
            </p>
          </div>

          <div className="bg-[#111] border border-[#262626] rounded-2xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-[#BAFF00] uppercase">3. ЭТАП СОРЕВНОВАНИЯ</div>
            <div className="text-2xl font-bold text-cyan-400">{hackathon?.stage || "ACTIVE"}</div>
            <p className="text-[11px] text-[#777]">
              AI Host синхронизирует подсказки с текущей фазой хакатона.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
