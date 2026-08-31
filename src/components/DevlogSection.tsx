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
  Bot
} from "lucide-react";
import type { ProjectStatus } from "../types";

interface DevlogSectionProps {
  onOpenFastComposer?: () => void;
}

export const DevlogSection: React.FC<DevlogSectionProps> = () => {
  const { posts, comments, createPost, reactToPost, addComment, polishPostAI, currentUser, projects, teams } = useHackathon();

  // Inline Composer State
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'link' | 'github' | 'demo' | undefined>(undefined);
  const [mediaUrl, setMediaUrl] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("BUILDING");
  const [milestone, setMilestone] = useState("");
  const [category, setCategory] = useState<any>("architecture");
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [polishedSuggestion, setPolishedSuggestion] = useState<string | null>(null);

  // Comments drawer toggles
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const reactionsList = ["🔥", "⚡", "🧠", "🚀", "💪", "🎉"];

  const handleAIPolish = async () => {
    if (!content.trim() || isPolishing) return;
    try {
      setIsPolishing(true);
      const res = await polishPostAI(content, status);
      if (res.polished) {
        setPolishedSuggestion(res.polished);
        if (res.milestone) setMilestone(res.milestone);
        if (res.category) setCategory(res.category);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleApplyPolished = () => {
    if (polishedSuggestion) {
      setContent(polishedSuggestion);
      setPolishedSuggestion(null);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createPost({
        content,
        polishedContent: polishedSuggestion || content,
        mediaType,
        mediaUrl: mediaUrl.trim() ? mediaUrl.trim() : undefined,
        status,
        milestone: milestone || "Обновление разработки",
        category
      });

      setContent("");
      setMediaUrl("");
      setMediaType(undefined);
      setMilestone("");
      setPolishedSuggestion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    await addComment(postId, commentInput);
    setCommentInput("");
  };

  const getStatusBadge = (st: ProjectStatus) => {
    switch (st) {
      case "MVP":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/40">🚀 MVP ГОТОВ</span>;
      case "DEMO":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🎬 DEMO</span>;
      case "SUBMITTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#BAFF00] text-black">🏁 СДАНО</span>;
      case "BUILDING":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#BAFF00] border border-[#333]">⚡ В ПРОЦЕССЕ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141414] text-[#888] border border-[#262626]">💡 ИДЕЯ</span>;
    }
  };

  return (
    <div className="space-y-8 mb-8 font-mono">
      {/* 30-Second Fast Devlog Composer */}
      <div className="bg-[#0A0A0A] border border-[#333] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#BAFF00] text-black flex items-center justify-center font-bold shadow-[0_0_10px_rgba(186,255,0,0.3)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Быстрый Devlog</h3>
              <p className="text-xs text-[#888]">30 секунд от идеи до публикации в ленту хакатона</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#888] font-mono">
            <span>Автор:</span>
            <span className="text-[#BAFF00] font-bold">{currentUser?.name || "Участник"}</span>
          </div>
        </div>

        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что вы сделали? (например: собрали сокет-сервер, подключили Gemini API, нарисовали таймер...)"
              className="w-full bg-[#111] border border-[#333] rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#BAFF00] transition-all resize-none"
            />
          </div>

          {/* AI Polished Suggestion Banner */}
          {polishedSuggestion && (
            <div className="p-3.5 bg-[#111] border border-[#BAFF00]/40 rounded-2xl flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Bot className="w-4 h-4 text-[#BAFF00] shrink-0 mt-0.5" />
                <div className="text-xs text-[#DDD]">
                  <div className="font-mono text-[10px] text-[#BAFF00] uppercase font-bold mb-1">AI-ПРЕДЛОЖЕНИЕ ДЛЯ DEVLOG:</div>
                  <p className="leading-relaxed font-mono">{polishedSuggestion}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyPolished}
                className="px-2.5 py-1 rounded-lg bg-[#BAFF00] text-black text-xs font-bold font-mono uppercase shrink-0 hover:bg-[#d4ff33] transition-colors"
              >
                Применить
              </button>
            </div>
          )}

          {/* Controls Bar: Status, Media Buttons, AI Button, Submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Status & Media Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="bg-[#111] border border-[#333] text-xs text-[#AAA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#BAFF00] font-mono font-medium"
              >
                <option value="IDEA">💡 Статус: Идея</option>
                <option value="BUILDING">⚡ Статус: В разработке</option>
                <option value="MVP">🚀 Статус: MVP готов</option>
                <option value="DEMO">🎬 Статус: Интерактивное демо</option>
                <option value="DONE">✓ Статус: Завершено</option>
              </select>

              <div className="flex items-center gap-1 bg-[#111] p-1 rounded-xl border border-[#262626]">
                <button
                  type="button"
                  onClick={() => setMediaType(mediaType === 'image' ? undefined : 'image')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${mediaType === 'image' ? 'bg-[#BAFF00] text-black font-bold' : 'text-[#888] hover:text-white'}`}
                  title="Добавить картинку"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType(mediaType === 'github' ? undefined : 'github')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${mediaType === 'github' ? 'bg-[#BAFF00] text-black font-bold' : 'text-[#888] hover:text-white'}`}
                  title="Ссылка на GitHub коммит"
                >
                  <Github className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType(mediaType === 'demo' ? undefined : 'demo')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${mediaType === 'demo' ? 'bg-[#BAFF00] text-black font-bold' : 'text-[#888] hover:text-white'}`}
                  title="Ссылка на Live Demo"
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                </button>
              </div>

              {mediaType && (
                <input
                  type="url"
                  placeholder={mediaType === 'image' ? "URL изображения..." : "Ссылка на демо/GitHub..."}
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="bg-[#111] border border-[#333] text-xs text-white rounded-xl px-3 py-2 w-48 sm:w-64 focus:outline-none focus:border-[#BAFF00] font-mono"
                />
              )}
            </div>

            {/* AI Polish and Submit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAIPolish}
                disabled={!content.trim() || isPolishing}
                className="px-3.5 py-2 rounded-xl bg-[#151515] hover:bg-[#222] border border-[#333] hover:border-[#BAFF00] text-[#BAFF00] text-xs font-bold font-mono uppercase flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isPolishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-[#BAFF00]" />}
                <span>AI-Оформить</span>
              </button>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black text-xs font-bold font-mono uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(186,255,0,0.3)] transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Опубликовать</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Devlog Feed List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white font-mono uppercase tracking-wider">Лента Devlog</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#151515] text-[#BAFF00] border border-[#333] font-mono">
              {posts.length} публикаций
            </span>
          </div>
          <span className="text-xs text-[#888] font-mono">Обновляется в реальном времени</span>
        </div>

        {posts.map((post) => {
          const isCommentsOpen = activeCommentsPostId === post.id;
          const postComments = comments.filter(c => c.postId === post.id);

          return (
            <div
              key={post.id}
              className="bg-[#0A0A0A] border border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 hover:border-[#444] transition-all"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-xl object-cover border border-[#333]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#151515] border border-[#333] text-[#BAFF00] font-bold flex items-center justify-center text-sm font-mono">
                      {post.authorName[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white font-mono">{post.authorName}</span>
                      {post.teamName && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#151515] text-[#BAFF00] border border-[#333]">
                          {post.teamName}
                        </span>
                      )}
                      {getStatusBadge(post.status)}
                    </div>
                    <div className="text-xs text-[#888] font-mono mt-0.5 flex items-center gap-2">
                      <span className="text-[#AAA]">{post.projectTitle}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {post.milestone && (
                  <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-1 rounded-xl bg-[#111] text-[#AAA] border border-[#333]">
                    🎯 {post.milestone}
                  </span>
                )}
              </div>

              {/* Post Body */}
              <div className="text-xs sm:text-sm text-[#DDD] font-mono leading-relaxed whitespace-pre-line">
                {post.polishedContent || post.content}
              </div>

              {/* Media Attachments Preview */}
              {post.mediaUrl && (
                <div className="mt-3">
                  {post.mediaType === 'image' ? (
                    <div className="rounded-2xl overflow-hidden border border-[#333] max-h-80 bg-black">
                      <img src={post.mediaUrl} alt="Devlog screenshot" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <a
                      href={post.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111] hover:bg-[#181818] border border-[#333] text-xs text-[#BAFF00] font-mono font-semibold transition-colors"
                    >
                      {post.mediaType === 'github' ? <Github className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                      <span>{post.mediaType === 'github' ? "Смотреть GitHub коммит" : "Открыть Demo ссылку"}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Social Bar: Reactions & Comment Trigger */}
              <div className="pt-3 border-t border-[#222] flex flex-wrap items-center justify-between gap-3">
                {/* Emoji Reactions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {reactionsList.map((emoji) => {
                    const count = post.reactions[emoji]?.length || 0;
                    const hasReacted = currentUser && post.reactions[emoji]?.includes(currentUser.id);
                    return (
                      <button
                        key={emoji}
                        onClick={() => reactToPost(post.id, emoji)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono transition-all ${
                          hasReacted
                            ? "bg-[#BAFF00]/20 text-[#BAFF00] border border-[#BAFF00]/50 scale-105"
                            : "bg-[#111] hover:bg-[#181818] text-[#AAA] border border-[#262626]"
                        }`}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span className="font-mono font-bold">{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Comments Toggle Button */}
                <button
                  onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111] hover:bg-[#181818] border border-[#262626] text-xs text-[#AAA] font-mono transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#666]" />
                  <span>{post.commentsCount || postComments.length} комментариев</span>
                </button>
              </div>

              {/* Expandable Comments Drawer */}
              {isCommentsOpen && (
                <div className="pt-4 border-t border-[#222] space-y-3 animate-in fade-in">
                  <div className="space-y-2 max-h-48 overflow-y-auto font-mono">
                    {postComments.length === 0 ? (
                      <div className="text-xs text-[#666] italic p-2">Будьте первым, кто оставит комментарий!</div>
                    ) : (
                      postComments.map((c) => (
                        <div key={c.id} className="bg-[#111] p-2.5 rounded-xl border border-[#222] flex items-start gap-2.5">
                          <img src={c.authorAvatar} alt={c.authorName} className="w-6 h-6 rounded-full object-cover border border-[#333]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-white">{c.authorName}</span>
                              <span className="text-[10px] text-[#666] font-mono">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-xs text-[#BBB] mt-0.5">{c.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-1 font-mono">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(post.id);
                      }}
                      placeholder="Напишите комментарий..."
                      className="flex-1 bg-[#111] border border-[#333] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#BAFF00]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#BAFF00] hover:bg-[#d4ff33] text-black font-bold text-xs uppercase"
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
  );
};
