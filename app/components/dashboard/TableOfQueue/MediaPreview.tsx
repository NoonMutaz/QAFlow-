'use client';

import React from "react";
import { isVideo } from "./helpers";
import { useLanguage } from '../../../i18n/LanguageProvider';

interface Props {
  url: string;
  onClose: () => void;
}

/** Full-screen viewer for an evidence image or video. */
export default function MediaPreview({ url, onClose }: Props) {
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="max-w-5xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {isVideo(url) ? (
          <video src={url} controls autoPlay className="max-h-[80vh] rounded-lg shadow-2xl" />
        ) : (
          <img src={url} className="max-h-[80vh] rounded-lg shadow-2xl" alt={t("Preview")} />
        )}
        <button
          onClick={onClose}
          className="bg-white px-8 py-2 rounded-full font-bold text-black hover:bg-gray-200 transition-colors"
        >
          {t("CLOSE PREVIEW")}
        </button>
      </div>
    </div>
  );
}
