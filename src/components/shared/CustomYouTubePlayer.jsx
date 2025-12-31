import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function CustomYouTubePlayer({ videoId, autoplay = false }) {
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const { isDark } = useTheme();

    // YouTube Player Options
    // https://developers.google.com/youtube/player_parameters
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 0,           // Hide default controls
            disablekb: 1,          // Disable keyboard controls
            fs: 0,                 // Hide fullscreen button
            iv_load_policy: 3,     // Hide annotations
            modestbranding: 1,     // Minimize branding
            rel: 0,                // Show related videos from same channel (though we block them)
            showinfo: 0,           // Deprecated but good to have
            ecver: 2,
        },
    };

    const handleReady = (event) => {
        setPlayer(event.target);
        setDuration(event.target.getDuration());
        if (autoplay) {
            event.target.playVideo();
            setIsPlaying(true);
        }
    };

    const handleStateChange = (event) => {
        // 1 = Playing, 2 = Paused, 0 = Ended
        if (event.data === 1) setIsPlaying(true);
        if (event.data === 2) setIsPlaying(false);
        if (event.data === 0) {
            setIsPlaying(false);
            setIsEnded(true);
        } else {
            setIsEnded(false);
        }
    };

    // Update progress
    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                setCurrentTime(player.getCurrentTime());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player]);

    // Format time (seconds -> mm:ss)
    const formatTime = (seconds) => {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Custom Controls Handlers
    const togglePlay = () => {
        if (!player) return;
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
            setIsEnded(false); // Reset ended state if replaying
        }
    };

    const toggleMute = () => {
        if (!player) return;
        if (isMuted) {
            player.unMute();
            setIsMuted(false);
        } else {
            player.mute();
            setIsMuted(true);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Handle hover to show/hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 2000);
    };

    // Listen for fullscreen change events (browser native)
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* The YouTube Iframe */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                {/* 
                    Scale up to 150% to aggressively crop out YouTube UI elements (Title, Share, Related Videos rail).
                */}
                <div className="w-[150%] h-[150%] flex-shrink-0">
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={handleReady}
                        onStateChange={handleStateChange}
                        className="w-full h-full"
                        iframeClassName="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Click Shield - Blocks all clicks to YouTube iframe */}
            <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
            ></div>

            {/* PAUSE OVERLAY: Hides YouTube's 'Related Videos' when paused */}
            {!isPlaying && !isEnded && (
                <div
                    onClick={togglePlay}
                    className="absolute inset-0 z-15 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white/90 cursor-pointer hover:bg-black/50 transition-colors"
                >
                    <div className="bg-white/10 p-4 rounded-full mb-2">
                        <Pause size={32} fill="currentColor" />
                    </div>
                    <p className="font-medium text-lg tracking-wide">Stream Paused</p>
                    <p className="text-sm text-white/50 mt-1">Tap directly to resume</p>
                </div>
            )}

            {/* End Screen Overlay - Hides recommendations */}
            {isEnded && (
                <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center text-white">
                    <p className="text-xl font-bold mb-4">Class Ended</p>
                    <button
                        onClick={togglePlay}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 rounded-full hover:bg-violet-700 transition"
                    >
                        <Play size={20} fill="currentColor" /> Watch Again
                    </button>
                </div>
            )}

            {/* Custom Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Progress Bar (Visual only for live streams usually, but good for recorded) */}
                <div className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer relative group/progress">
                    <div
                        className="h-full bg-violet-500 rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="hover:text-violet-400 transition"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="hover:text-violet-400 transition"
                        >
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>

                        <span className="text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Live Badge if duration is huge or specific flag (optional) */}
                        {duration > 0 && currentTime > duration - 30 && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                LIVE
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="hover:text-violet-400 transition"
                    >
                        {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
