import { useState, useRef } from 'react';
import { BugComment } from './types';
import { formatDate } from './utils';

interface CommentThreadProps {
  comments: BugComment[];
  // Extended handler to accept optional imageUrl
  onAddComment: (text: string, imageUrl?: string) => Promise<void> | void;
}

export default function CommentThread({ comments, onAddComment }: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded image file to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!newComment.trim() && !selectedImage) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim(), selectedImage || undefined);
      setNewComment('');
      handleRemoveImage();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-800 mt-6">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">
        Audit & Inspection Log
      </p>

      {/* Comment History */}
      <div className="space-y-4 mb-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800 border-dashed">
            <p className="text-xs text-slate-400 italic">
              No audit logs recorded yet. Add an inspection update below.
            </p>
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                {(comment.authorName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl rounded-tl-none p-3 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200">{comment.authorName}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                </div>
                {comment.text && (
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{comment.text}</p>
                )}
                
                {/* Render image if attached in comment */}
                {(comment.imageUrl || (comment as any).image) && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-800 max-w-sm">
                    <img
                      src={comment.imageUrl || (comment as any).image}
                      alt="Attached evidence"
                      className="w-full max-h-60 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Input Shell */}
      <div className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
          You
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Provide an update or attach inspection evidence..."
            className="w-full text-xs text-slate-100 bg-slate-900 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none min-h-[80px] shadow-sm transition-all placeholder:text-slate-500"
          />

          {/* Selected Image Thumbnail Preview */}
          {selectedImage && (
            <div className="relative inline-block self-start mt-1">
              <img
                src={selectedImage}
                alt="Upload preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition-colors"
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex justify-between items-center mt-1">
            {/* Attachment Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Attach Evidence
            </button>

            {/* Post Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!newComment.trim() && !selectedImage) || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md shadow-emerald-950/40"
            >
              {isSubmitting ? 'Posting...' : 'Post Log'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}