import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { UserPlus, X } from "lucide-react";
import type { Role } from "../types";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { registerUser } = useHackathon();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState<Role>("participant");
  const [primaryRole, setPrimaryRole] = useState("Fullstack Developer");
  const [skillsInput, setSkillsInput] = useState("React, TypeScript, Express, AI");
  const [bio, setBio] = useState("Разрабатываю сервисы для хакатонов и сообщества");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      await registerUser({
        name,
        handle: handle.startsWith("@") ? handle : `@${handle || name.toLowerCase().replace(/\s+/g, '')}`,
        role,
        primaryRole,
        skills: skillsInput.split(",").map(s => s.trim()).filter(Boolean),
        bio,
        avatar: randomAvatar
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in font-mono">
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#151515] text-[#BAFF00] border border-[#333] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wider">Регистрация на Вайбатон</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-[#151515] hover:bg-[#222] text-[#888] hover:text-white border border-[#333] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          <div>
            <label className="text-xs font-mono text-[#888] uppercase block mb-1">Имя и Фамилия / Никнейм *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Алексей Смирнов"
              className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#888] uppercase block mb-1">Telegram / Fix-Ed ник</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@alex_dev"
              className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Роль в хакатоне</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-[#111] border border-[#333] text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#BAFF00] font-mono"
              >
                <option value="participant">Участник</option>
                <option value="judge">Судья</option>
                <option value="organizer">Организатор</option>
                <option value="spectator">Зритель</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#888] uppercase block mb-1">Специализация</label>
              <input
                type="text"
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                placeholder="Frontend, Backend, AI"
                className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-[#888] uppercase block mb-1">Стек и ключевые навыки</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Node.js, Python, Tailwind"
              className="w-full bg-[#111] border border-[#333] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00]"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-[#888] uppercase block mb-1">О себе / Что планируете делать</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ищу команду или готовлю соло-проект..."
              className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-[#888] hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold font-mono uppercase text-xs shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

