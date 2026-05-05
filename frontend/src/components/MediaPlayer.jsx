export default function MediaPlayer({ media, className = '' }) {
  if (!media || media.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {media.map((m) => {
        if (!m || !m.url) return null;
        const key = m._id || m.url;
        return (
          <div key={key} className="rounded-xl overflow-hidden glass-light">
            {m.type === 'image' && (
              <img
                src={m.url.trim()}
                alt="Question media"
                className="w-full max-h-72 object-contain bg-slate-900/50 p-3"
                onError={(e) => { e.target.style.display = 'none'; }}
                loading="lazy"
              />
            )}
            {m.type === 'audio' && (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎵</span>
                  <span className="text-sm text-slate-300">Audio Clip — Play to listen</span>
                </div>
                <audio controls className="w-full" preload="metadata">
                  <source src={m.url} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}
            {m.type === 'video' && (
              <div className="p-2">
                <video controls className="w-full rounded-lg max-h-80" preload="metadata" playsInline>
                  <source src={m.url} />
                  Your browser does not support video playback.
                </video>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
