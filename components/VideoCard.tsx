"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Video } from "@/lib/content";

// Click-to-play facade: renders a thumbnail and only loads the YouTube iframe
// once the visitor presses play, keeping the page light with many videos.
export default function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-linen-200 bg-linen-50">
      <div className="relative aspect-video bg-royal-900">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play video: ${video.title}`}
          >
            <Image
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-opacity group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-royal-900/30 transition-colors group-hover:bg-royal-900/20">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-royal-900 shadow-lg transition-transform group-hover:scale-110 group-focus-visible:scale-110">
                <Play size={24} className="ml-1" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex-1 p-5">
        <h4 className="text-lg font-semibold text-royal-900">{video.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{video.description}</p>
      </div>
    </article>
  );
}
