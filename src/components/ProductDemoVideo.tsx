import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, X } from 'lucide-react';

interface VideoChapter {
  id: string;
  title: string;
  time: number;
  duration: number;
}

interface ProductDemoVideoProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export default function ProductDemoVideo({ isOpen, onClose, videoUrl }: ProductDemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const chapters: VideoChapter[] = [
    { id: 'intro', title: 'Introduction', time: 0, duration: 15 },
    { id: 'signup', title: 'Sign Up', time: 15, duration: 30 },
    { id: 'setup', title: 'Site Setup', time: 45, duration: 45 },
    { id: 'build', title: 'Build Pages', time: 90, duration: 60 },
    { id: 'launch', title: 'Launch', time: 150, duration: 30 },
  ];

  const totalDuration = chapters.reduce((acc, ch) => acc + ch.duration, 0);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const dur = video.duration || totalDuration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);

      const chapterIndex = chapters.findIndex((ch, idx) => {
        const nextChapter = chapters[idx + 1];
        return current >= ch.time && (!nextChapter || current < nextChapter.time);
      });
      if (chapterIndex !== -1) setActiveChapter(chapterIndex);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const newTime = (percentage / 100) * (duration || totalDuration);

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setProgress(percentage);
    setCurrentTime(newTime);
  };

  const jumpToChapter = (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (videoRef.current) {
      videoRef.current.currentTime = chapter.time;
    }
    setCurrentTime(chapter.time);
    setProgress((chapter.time / (duration || totalDuration)) * 100);
    setActiveChapter(chapterIndex);
  };

  const skipForward = () => {
    if (activeChapter < chapters.length - 1) {
      jumpToChapter(activeChapter + 1);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video?.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const hasVideo = !!videoUrl;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-50"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div
          className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {hasVideo ? (
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={videoUrl}
              onClick={togglePlay}
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 text-center px-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl">
                  <Play className="h-12 w-12 text-white ml-1" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Video Demo Coming Soon
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We're creating a comprehensive video walkthrough showing you exactly how to set up
                  your creator business with CreatorApp.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  {chapters.map((chapter, idx) => (
                    <div
                      key={chapter.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        idx === activeChapter
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {chapter.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              showControls && !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
            >
              <Play className="h-10 w-10 text-white ml-1" />
            </button>
          </div>

          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => jumpToChapter(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    idx === activeChapter
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : idx < activeChapter
                      ? 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/40'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {chapter.title}
                </button>
              ))}
            </div>

            <div
              ref={progressRef}
              className="h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={skipForward}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  disabled={activeChapter >= chapters.length - 1}
                >
                  <SkipForward className="h-5 w-5 text-white" />
                </button>

                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>

                <span className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration || totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm hidden sm:block">
                  {chapters[activeChapter]?.title}
                </span>

                {hasVideo && (
                  <button
                    onClick={handleFullscreen}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  >
                    <Maximize className="h-5 w-5 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Press <kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Space</kbd> to play/pause
            or <kbd className="bg-white/10 px-2 py-0.5 rounded text-white">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
