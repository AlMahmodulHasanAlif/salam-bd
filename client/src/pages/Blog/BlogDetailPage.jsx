// src/pages/Blog/BlogDetailPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import {
  Calendar, Eye, Tag, ArrowLeft, Send, Trash2,
  Heart, Reply, Loader2, LogIn, ChevronDown, ChevronUp,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAxiosSecure from "../../hooks/useAxios";
import axiosInstance from "../../hooks/axiosInstance";

const BlogDetailPage = () => {
  const { slug }            = useParams();
  const { user }            = useAuth();
  const axiosSecure         = useAxiosSecure();

  const [blog, setBlog]           = useState(null);
  const [comments, setComments]   = useState([]);
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [replyTo, setReplyTo]     = useState(null); // { id, name }
  const commentRef = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [blogRes, commentsRes, recentRes] = await Promise.all([
          axiosInstance.get(`/blogs/${slug}`),
          axiosInstance.get(`/blogs/${slug}/comments`),
          axiosInstance.get("/blogs/recent"),
        ]);
        setBlog(blogRes.data);
        setComments(commentsRes.data);
        setRecent(recentRes.data.filter((b) => b.slug !== slug).slice(0, 3));
      } catch {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axiosSecure.post(`/blogs/${slug}/comments`, {
        text: commentText.trim(),
        parentId: replyTo?.id || null,
        authorName: user.displayName || user.email.split("@")[0],
        authorPhoto: user.photoURL || null,
      });

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), data] }
              : c
          )
        );
      } else {
        setComments((prev) => [{ ...data, replies: [] }, ...prev]);
      }

      setCommentText("");
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, parentId = null) => {
    if (!window.confirm("Delete this comment?")) return;
    await axiosSecure.delete(`/blogs/comments/${id}`);
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== id) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c._id !== id));
    }
  };

  const handleLike = async (id, parentId = null) => {
    if (!user) return;
    const { data } = await axiosSecure.patch(`/blogs/comments/${id}/like`);
    const update = (c) =>
      c._id === id
        ? {
            ...c,
            likes: data.liked
              ? [...(c.likes || []), user.email]
              : (c.likes || []).filter((e) => e !== user.email),
          }
        : c;

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c._id === parentId ? { ...c, replies: c.replies.map(update) } : c
        )
      );
    } else {
      setComments((prev) => prev.map(update));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-green-700" size={40} />
      </div>
    );

  if (!blog)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500 text-lg">Blog post not found.</p>
        <Link to="/blog" className="text-green-700 underline text-sm">← Back to Blog</Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Cover */}
      <div className="relative h-72 md:h-96 bg-primary-dark overflow-hidden">
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-8 max-w-4xl mx-auto w-full">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full w-fit mb-3">
            {blog.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={13} /> {blog.views} views
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-12 flex flex-col lg:flex-row gap-10">

        {/* ── Article ── */}
        <article className="flex-1 min-w-0">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 mb-6 font-medium">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {blog.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-sm md:prose-base prose-headings:text-gray-800 prose-a:text-green-700 prose-strong:text-gray-800 max-w-none bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* ── Comments ── */}
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Comments <span className="text-gray-400 font-normal text-base">({comments.length})</span>
            </h2>

            {/* Comment Box */}
            {user ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                {replyTo && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-3 text-sm text-green-700">
                    <span>Replying to <strong>{replyTo.name}</strong></span>
                    <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                )}
                <div className="flex gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(user.displayName || user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <textarea
                      ref={commentRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Write a comment..."}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleComment}
                        disabled={submitting || !commentText.trim()}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {replyTo ? "Reply" : "Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl p-4 mb-6 text-sm text-gray-500 hover:border-green-500 hover:text-green-700 transition"
              >
                <LogIn size={16} /> Sign in to leave a comment
              </Link>
            )}

            {/* Comment List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  user={user}
                  onReply={(id, name) => {
                    setReplyTo({ id, name });
                    commentRef.current?.focus();
                    window.scrollTo({ top: commentRef.current?.offsetTop - 100, behavior: "smooth" });
                  }}
                  onDelete={handleDelete}
                  onLike={handleLike}
                />
              ))}
            </div>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6 self-start sticky top-6 md:mt-10">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4 ">
              More Posts
            </h3>
            <div className="space-y-4">
              {recent.map((b) => (
                <Link key={b._id} to={`/blog/${b.slug}`} className="flex gap-3 group">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-green-50 shrink-0 flex items-center justify-center">
                      <Tag size={14} className="text-green-600" />
                    </div>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-green-700 transition-colors">
                    {b.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────────────────
const CommentItem = ({ comment, user, onReply, onDelete, onLike, parentId = null }) => {
  const [showReplies, setShowReplies] = useState(true);
  const liked = user && comment.likes?.includes(user.email);
  const isOwn = user && comment.authorEmail === user.email;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${parentId ? "ml-8 mt-3" : ""}`}>
      <div className="flex items-start gap-3">
        {comment.authorPhoto ? (
          <img src={comment.authorPhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(comment.authorName || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">{comment.authorName}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.text}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => onLike(comment._id, parentId)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
            >
              <Heart size={13} fill={liked ? "currentColor" : "none"} />
              {comment.likes?.length || 0}
            </button>
            {!parentId && user && (
              <button
                onClick={() => onReply(comment._id, comment.authorName)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-700 transition-colors"
              >
                <Reply size={13} /> Reply
              </button>
            )}
            {isOwn && (
              <button
                onClick={() => onDelete(comment._id, parentId)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {!parentId && comment.replies?.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1 text-xs text-green-700 font-medium ml-11"
          >
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              user={user}
              onDelete={onDelete}
              onLike={onLike}
              onReply={() => {}}
              parentId={comment._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;