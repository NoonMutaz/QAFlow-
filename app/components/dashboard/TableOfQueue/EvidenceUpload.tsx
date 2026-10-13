import React from "react";
import { PlayIcon, UploadIcon } from "./icons";
import { isVideo, } from "./helpers";
import { mediaUrl } from "./api";

interface Props {
  attachmentUrl?: string;
  uploading: boolean;
  canEdit: boolean;
  onUpload: (file: File) => void;
  onPreview: (url: string) => void;
}

/** Thumbnail of the current evidence plus the upload control. */
export default function EvidenceUpload({ attachmentUrl, uploading, canEdit, onUpload, onPreview }: Props) {
  return (
    <div className="flex items-center gap-3">
      {attachmentUrl && !uploading && (
        <div
          className="relative w-16 h-12 rounded-lg border overflow-hidden bg-black cursor-pointer shadow-sm hover:scale-105 transition-all shrink-0"
          onClick={() => onPreview(mediaUrl(attachmentUrl))}
        >
          {isVideo(attachmentUrl) ? (
            <div className="flex items-center justify-center h-full text-white bg-slate-900">
              <PlayIcon className="w-6 h-6 text-blue-500" />
            </div>
          ) : (
            <img src={mediaUrl(attachmentUrl)} alt="Evidence" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {canEdit && !uploading && (
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer text-xs font-semibold text-gray-600 transition-colors">
            <UploadIcon className="w-4 h-4 text-gray-400" />
            <span>Upload File</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
        )}

        {uploading && (
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            Saving file...
          </div>
        )}
      </div>
    </div>
  );
}
