import { useState } from 'react';
import { BugComment } from './types';
import { formatDate } from './utils';

interface CommentThreadProps {
  comments: BugComment[];
  onAddComment: (text: string) => Promise<void> | void;
}

export default function CommentThread({ comments, onAddComment }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100 mt-6">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Communication</p>

      <div className="space-y-4 mb-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
            <p className="text-xs text-slate-400 italic">
              No comments yet. Start the conversation!{' '}
              <span className="text-red-600 font-bold">(Feature in development)</span>
            </p>
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                {(comment.authorName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl rounded-tl-none p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700">{comment.authorName}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
          You
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or provide an update..."
            className="w-full text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none min-h-[80px] shadow-sm transition-shadow"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Sending...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}