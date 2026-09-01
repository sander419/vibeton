import React, { useState } from "react";
import { useHackathon } from "../context/HackathonContext";
import { 
  Sparkles, 
  Send, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Github, 
  PlaySquare, 
  MessageSquare, 
  Heart, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  Plus,
  ExternalLink,
  Bot,
  Save,
  RotateCcw
} from "lucide-react";
import { speakText, stopSpeech, sound } from "../utils/audio";
import type { ProjectStatus } from "../types";
import { usePersistentDraft } from "../utils/usePersistentDraft";

interface DevlogSectionProps {
  onOpenFastComposer?: () => void;
}

interface DevlogDraft {
  content: string;
  mediaType: 'image' | 'video' | 'link' | 'github' | 'demo' | undefined;
  mediaUrl: string;
  status: ProjectStatus;
  milestone: string;
  category: any;
}

export const DevlogSection: React.FC<DevlogSectionProps> = () => {
  const { posts, comments, createPost, reactToPost, addComment, polishPostAI, currentUser, projects, teams } = useHackathon();

  // Persistent Inline Composer State
  const defaultDraft: DevlogDraft = {
    content: "",
    mediaType: undefined,
    mediaUrl: "",
    status: "BUILDING",
    milestone: "",
    category: "architecture",
  };

  const {
    data: draft,
    updateField,
    clearDraft,
    forceSave,
    hasDraft,
    isSaving,
    lastSavedTime,
    savedAtFormatted,
    isRestoredFromStorage
  } = usePersistentDraft<DevlogDraft>("vibathon_devlog_composer_draft", defaultDraft, {
    autoSaveIntervalMs: 4000,
    debounceMs: 250
  });

  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [polishedSuggestion, setPolishedSuggestion] = useState<string | null>(null);
  const [showDraftRestoredBanner, setShowDraftRestoredBanner] = useState(true);

  // Comments drawer toggles
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const reactionsList = ["🔥", "⚡", "🧠", "🚀", "💪", "🎉"];

  const handleAIPolish = async () => {
    if (!draft.content.trim() || isPolishing) return;
    sound.playClick();
    try {
      setIsPolishing(true);
      const res = await polishPostAI(draft.content, draft.status);
      if (res.polished) {
        sound.playBroadcastChime();
        setPolishedSuggestion(res.polished);
        if (res.milestone) updateField("milestone", res.milestone);
        if (res.category) updateField("category", res.category);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyPolished = () => {
    sound.playClick();
    if (polishedSuggestion) {
      updateField("content", polishedSuggestion);
      setPolishedSuggestion(null);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.content.trim() || isSubmitting) return;
    sound.playClick();

    try {
      setIsSubmitting(true);
      await createPost({
        content: draft.content,
        polishedContent: polishedSuggestion || draft.content,
        mediaType: draft.mediaType,
        mediaUrl: draft.mediaUrl.trim() ? draft.mediaUrl.trim() : undefined,
        status: draft.status,
        milestone: draft.milestone || "Обновление разработки",
        category: draft.category
      });
      sound.playSuccess();
      clearDraft();
      setPolishedSuggestion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    sound.playClick();
    await addComment(postId, commentInput);
    sound.playPulse();
    setCommentInput("");
  };

  const handleReaction = async (postId: string, emoji: string) => {
    sound.playPop();
    await reactToPost(postId, emoji);
  };

  const getStatusBadge = (st: ProjectStatus) => {
    switch (st) {
      case "MVP":
        return <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#c8ff3d]/15 text-[#c8ff3d] border border-[#c8ff3d]/40">🚀 MVP</span>;
      case "DEMO":
        return <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#41f0ff]/15 text-[#41f0ff] border border-[#41f0ff]/40">🎬 DEMO</span>;
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#ff3da6]/20 text-[#ff3da6] border border-[#ff3da6]/40">🏁 СДАНО</span>;
      case "BUILDING":
        return <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#ffb020]/15 text-[#ffb020] border border-[#ffb020]/30">⚡ BUILDING</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-[#121627] text-[#8b93ad] border border-[#2a3148]">💡 IDEA</span>;
    }
  };

  return (
    <div className="space-y-8 mb-12 font-sans">
      {/* 30-Second Fast Devlog Composer */}
      <div className="bg-[#0e111c] border border-[#1e2436] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-mono">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2436] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c8ff3d] text-[#06070c] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(200,255,61,0.35)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">БЫСТРЫЙ DEVLOG</h3>
                
                {/* Auto-Save & Saved at Timestamp Live Indicator */}
                {isSaving ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c8ff3d]/10 text-[#c8ff3d] text-[11px] font-mono border border-[#c8ff3d]/30 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Автосохранение...</span>
                  </span>
                ) : lastSavedTime ? (
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#121627] text-[#8b93ad] text-[11px] font-mono border border-[#2a3148] shadow-sm"
                    title={`Черновик автоматически сохранен в локальном хранилище: ${lastSavedTime.toLocaleString()}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c8ff3d]" />
                    <Save className="w-3 h-3 text-[#c8ff3d]" />
                    <span className="text-white/90 font-medium">Saved at {savedAtFormatted}</span>
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#8b93ad]">Непрерывное автосохранение черновика каждые несколько секунд</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {hasDraft && (
              <>
                <button
                  type="button"
                  onClick={forceSave}
                  title="Принудительно сохранить состояние черновика прямо сейчас"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-[#c8ff3d] border border-[#2a3148] text-xs font-mono transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Сохранить</span>
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  title="Очистить сохраненный черновик"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#121627] hover:bg-[#1e2436] text-[#8b93ad] hover:text-amber-400 border border-[#2a3148] text-xs font-mono transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Сбросить</span>
                </button>
              </>
            )}
            <div className="hidden md:flex items-center gap-2 text-xs text-[#8b93ad] pl-2 border-l border-[#1e2436]">
              <span>Автор:</span>
              <span className="text-[#c8ff3d] font-bold">{currentUser?.name || "Участник"}</span>
            </div>
          </div>
        </div>

        {/* Restored Draft Notification Banner */}
        {isRestoredFromStorage && showDraftRestoredBanner && hasDraft && draft.content.trim().length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-[#121627] border border-[#c8ff3d]/30 text-xs flex items-center justify-between text-[#c8ff3d] gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#c8ff3d] shrink-0" />
              <span>
                Восстановлен ранее сохраненный черновик {savedAtFormatted ? `(Saved at ${savedAtFormatted})` : ""}. Прогресс не потерян при перезагрузке страницы.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowDraftRestoredBanner(false)}
              className="text-[#8b93ad] hover:text-white text-[11px] underline uppercase shrink-0"
            >
              Скрыть
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={draft.content}
                onChange={(e) => updateField("content", e.target.value)}
                placeholder="Что только что сделали? (например: привязал WebSocket к таймеру и протестировал рендеринг)..."
                rows={3}
                className="w-full bg-[#0a0c14] border border-[#2a3148] focus:border-[#c8ff3d] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-[#5c647e] outline-none transition-colors"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-[#5c647e] font-mono pointer-events-none">
                {draft.content.length} симв. • {draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0} сл.
              </div>
            </div>
          </div>

          {/* AI Polish Live Preview */}
          {polishedSuggestion && (
            <div className="p-4 rounded-2xl bg-[#0a0c14] border border-[#41f0ff]/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-[#41f0ff]">
                <span className="flex items-center gap-1.5 font-bold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>✨ AI-оформление готово:</span>
                </span>
                <button
                  type="button"
                  onClick={handleApplyPolished}
                  className="px-3 py-1 rounded-lg bg-[#41f0ff] hover:bg-[#68f3ff] text-[#06070c] font-bold text-[11px] uppercase transition-all shadow-[0_0_10px_rgba(65,240,255,0.3)]"
                >
                  Применить текст
                </button>
              </div>
              <p className="text-xs text-white leading-relaxed font-body">
                {polishedSuggestion}
              </p>
            </div>
          )}

          {/* Optional Attachments Bar */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#8b93ad]">Вложения & вехи:</span>
              <button
                type="button"
                onClick={() => updateField("mediaType", draft.mediaType === "image" ? undefined : "image")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                  draft.mediaType === "image"
                    ? "bg-[#c8ff3d] text-[#06070c] font-bold"
                    : "bg-[#0a0c14] text-[#8b93ad] border border-[#2a3148] hover:text-white"
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Скриншот</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("mediaType", draft.mediaType === "demo" ? undefined : "demo")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                  draft.mediaType === "demo"
                    ? "bg-[#41f0ff] text-[#06070c] font-bold"
                    : "bg-[#0a0c14] text-[#8b93ad] border border-[#2a3148] hover:text-white"
                }`}
              >
                <PlaySquare className="w-3 h-3" />
                <span>Демо-ссылка</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("mediaType", draft.mediaType === "github" ? undefined : "github")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                  draft.mediaType === "github"
                    ? "bg-white text-[#06070c] font-bold"
                    : "bg-[#0a0c14] text-[#8b93ad] border border-[#2a3148] hover:text-white"
                }`}
              >
                <Github className="w-3 h-3" />
                <span>GitHub коммит</span>
              </button>

              <button
                type="button"
                onClick={() => updateField("mediaType", draft.mediaType === "link" ? undefined : "link")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                  draft.mediaType === "link"
                    ? "bg-[#ffb020] text-[#06070c] font-bold"
                    : "bg-[#0a0c14] text-[#8b93ad] border border-[#2a3148] hover:text-white"
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>Ссылка</span>
              </button>
            </div>

            {/* Media URL Input if chosen */}
            {draft.mediaType && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={draft.mediaUrl}
                  onChange={(e) => updateField("mediaUrl", e.target.value)}
                  placeholder={
                    draft.mediaType === "image"
                      ? "URL скриншота (https://...)"
                      : draft.mediaType === "github"
                      ? "URL коммита/PR (https://github.com/...)"
                      : "URL (https://...)"
                  }
                  className="flex-1 bg-[#0a0c14] border border-[#2a3148] focus:border-[#c8ff3d] rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-[#5c647e] outline-none"
                />
              </div>
            )}
          </div>

          {/* Controls Bar: Status + AI Polish + Submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#1e2436]/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#8b93ad]">Статус:</span>
              {(["IDEA", "BUILDING", "MVP", "DEMO", "SUBMITTED"] as ProjectStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateField("status", st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    draft.status === st
                      ? "bg-[#c8ff3d] text-[#06070c] shadow-[0_0_10px_rgba(200,255,61,0.3)]"
                      : "bg-[#0a0c14] text-[#8b93ad] border border-[#2a3148] hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAIPolish}
                disabled={!draft.content.trim() || isPolishing}
                className="px-4 py-2 rounded-xl bg-[#0a0c14] hover:bg-[#121627] text-[#41f0ff] border border-[#41f0ff]/30 hover:border-[#41f0ff] text-xs font-bold uppercase transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>✨ AI-оформить</span>
              </button>

              <button
                type="submit"
                disabled={!draft.content.trim() || isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#c8ff3d] hover:bg-[#d8ff66] text-[#06070c] text-xs font-extrabold uppercase shadow-[0_0_15px_rgba(200,255,61,0.35)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Опубликовать</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Devlog Stream Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-white">DEVLOG ЛЕНТА ({posts.length})</h2>
          <span className="text-xs font-mono text-[#8b93ad]">История создания проектов видна жюри</span>
        </div>

        <div className="space-y-4">
          {posts.map((post) => {
            const authorProject = projects.find((p) => p.id === post.projectId);
            const authorTeam = teams.find((t) => t.id === post.teamId);
            const isCommentsOpen = activeCommentsPostId === post.id;
            const postComments = comments.filter((c) => c.postId === post.id);

            return (
              <div
                key={post.id}
                className="bg-[#0e111c] border border-[#1e2436] rounded-3xl p-6 shadow-xl space-y-4 font-sans hover:border-[#2a3148] transition-colors"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#1e2436]">
                  <div className="flex items-center gap-3">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#2a3148]" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#121627] text-[#c8ff3d] flex items-center justify-center font-bold text-xs font-mono">
                        {post.authorName?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{post.authorName}</span>
                        {authorTeam && (
                          <span className="text-xs text-[#41f0ff] font-mono font-normal">
                            → {authorTeam.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5c647e] font-mono flex items-center gap-2">
                        <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{post.milestone || "Devlog"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(post.status)}
                  </div>
                </div>

                {/* Post Body Text */}
                <p className="text-sm sm:text-base text-[#e9edf8] leading-relaxed whitespace-pre-line font-body">
                  {post.polishedContent || post.content}
                </p>

                {/* Post Footer Actions & Reactions */}
                <div className="flex items-center justify-between pt-2 text-xs font-mono text-[#8b93ad]">
                  <div className="flex items-center gap-2">
                    {reactionsList.map((emoji) => {
                      const count = (post.reactions && post.reactions[emoji]) || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(post.id, emoji)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                            count > 0
                              ? "bg-[#121627] text-white border-[#c8ff3d]/40 shadow-[0_0_8px_rgba(200,255,61,0.15)]"
                              : "bg-[#0a0c14] text-[#5c647e] border-[#1e2436] hover:text-white"
                          }`}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span className="font-bold text-[#c8ff3d]">{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a0c14] hover:bg-[#121627] text-[#8b93ad] hover:text-white border border-[#1e2436] transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{postComments.length} коммент.</span>
                  </button>
                </div>

                {/* Comments Drawer */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-[#1e2436] space-y-3 font-mono">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {postComments.map((c) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-[#0a0c14] border border-[#1e2436] text-xs">
                          <div className="flex items-center justify-between text-[11px] text-[#5c647e] mb-1">
                            <strong className="text-[#41f0ff]">{c.authorName}</strong>
                            <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-white font-body">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        placeholder="Написать комментарий..."
                        className="flex-1 bg-[#0a0c14] border border-[#1e2436] focus:border-[#c8ff3d] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5c647e] outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#c8ff3d] text-[#06070c] font-bold text-xs uppercase shadow-[0_0_10px_rgba(200,255,61,0.2)]"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
