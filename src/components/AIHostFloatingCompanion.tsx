import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Bot, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Radio, 
  Sparkles,
  Send,
  Zap
} from "lucide-react";
import { speakText, stopSpeech } from "../utils/audio";

interface FloatingCompanionProps {
  onOpenAskHostModal: () => void;
  onNavigateToLive: () => void;
}

export const AIHostFloatingCompanion: React.FC<FloatingCompanionProps> = ({
  onOpenAskHostModal,
  onNavigateToLive
}) => {
  const { aiMessages, posts, teams, projects, currentUser } = useHackathon();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const latestBroadcast = aiMessages[0];

  const handleToggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const text = latestBroadcast 
        ? `${latestBroadcast.title}. ${latestBroadcast.content}`
        : "Вайбатон №2 в эфире. Создавайте проекты и делитесь прогрессом в Devlog!";
      speakText(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono">
      {/* Expanded Mini-HUD */}
      {isExpanded ? (
        <div className="w-80 sm:w-96 rounded-2xl bg-[#0C0C0C]/95 backdrop-blur-md border border-[#BAFF00]/50 p-4 shadow-[0_0_25px_rgba(186,255,0,0.25)] text-xs text-[#E0E0E0] animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#151515] border border-[#BAFF00] flex items-center justify-center text-[#BAFF00] font-black text-[10px]">
                [ ⚡ ]
              </div>
              <div>
                <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                  AI HOST COMPANION
                </div>
                <div className="text-[9px] text-[#BAFF00]">
                  СУЩНОСТЬ В СЕТИ // FIX-ED
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg hover:bg-[#222] text-[#888] hover:text-white"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="my-3 space-y-2">
            <div className="text-[10px] text-[#888] uppercase">ПОСЛЕДНЯЯ РЕПЛИКА ЭФИРА:</div>
            <p className="text-xs text-[#CCC] bg-[#141414] p-2.5 rounded-xl border border-[#222] line-clamp-3 leading-relaxed">
              {latestBroadcast?.content || "Вайбатон №2 в самом разгаре! Публикуйте Devlog-посты и объединяйтесь в команды."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1 text-center py-2 bg-[#111] rounded-xl border border-[#222] mb-3 text-[10px]">
            <div>
              <div className="text-[#BAFF00] font-bold">{posts.length}</div>
              <div className="text-[#666]">Постов</div>
            </div>
            <div>
              <div className="text-white font-bold">{teams.length}</div>
              <div className="text-[#666]">Команд</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold">{projects.filter(p => p.status === 'MVP').length}</div>
              <div className="text-[#666]">MVP</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleToggleVoice}
              className={`py-2 px-3 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                isSpeaking 
                  ? "bg-[#BAFF00] text-black shadow-[0_0_10px_rgba(186,255,0,0.5)]" 
                  : "bg-[#181818] hover:bg-[#222] text-white border border-[#333]"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? "Стоп голос" : "Слушать Host"}</span>
            </button>

            <button
              onClick={() => {
                setIsExpanded(false);
                onOpenAskHostModal();
              }}
              className="py-2 px-3 rounded-xl bg-[#BAFF00] hover:bg-[#c9ff33] text-black font-bold uppercase text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(186,255,0,0.3)] transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Спросить</span>
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed Floating Pill/Orb */
        <button
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#0E0E0E]/90 hover:bg-[#151515] backdrop-blur-md border border-[#BAFF00]/40 hover:border-[#BAFF00] text-white shadow-[0_0_20px_rgba(186,255,0,0.25)] hover:shadow-[0_0_25px_rgba(186,255,0,0.4)] transition-all"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-[#181818] border border-[#BAFF00]/60 flex items-center justify-center text-[#BAFF00] text-[10px] font-bold">
              [ ⚡ ]
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#BAFF00] ring-2 ring-black animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#BAFF00] ring-2 ring-black" />
          </div>

          <div className="text-left font-mono">
            <div className="text-[10px] font-bold text-[#BAFF00] uppercase tracking-wider flex items-center gap-1">
              <span>AI HOST ENTITY</span>
            </div>
            <div className="text-[9px] text-[#888] flex items-center gap-1">
              <span>ONLINE // НАЖМИ ДЛЯ СВЯЗИ</span>
            </div>
          </div>
        </button>
      )}
    </div>
  );
};
