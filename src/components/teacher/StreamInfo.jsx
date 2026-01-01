import { useState } from 'react';

export default function StreamInfo({ liveClassId, ytStatus, streamKey, ingestionUrl, liveUrl, broadcastId }) {
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    const copyToClipboard = async (text, setter) => {
        try {
            await navigator.clipboard.writeText(text);
            setter(true);
            setTimeout(() => setter(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Extract video ID from YouTube URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeVideoId(liveUrl) || broadcastId;

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-admin-text mb-4">Stream Information</h3>

            <div className="space-y-4">
                {/* YouTube Player */}
                {videoId && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-admin-text-muted">
                                Live Stream Preview
                            </label>
                            {ytStatus === 'live' && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span>LIVE NOW</span>
                                </div>
                            )}
                        </div>
                        <div className="aspect-video w-full bg-black rounded overflow-hidden relative">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0`}
                                title="YouTube Live Stream"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <p className="text-xs text-admin-text-muted mt-2">
                            Share this link with students: <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{liveUrl}</a>
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-admin-text-muted mb-1">
                        YouTube Status
                    </label>
                    <p className="text-sm text-admin-text">
                        {ytStatus || 'Not Started'}
                    </p>
                </div>

                {/* RTMP URL (Ingestion Address) */}
                {ingestionUrl && (
                    <div>
                        <label className="block text-sm font-medium text-admin-text-muted mb-1">
                            Stream URL (RTMP)
                        </label>
                        <div className="flex gap-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded border border-admin-border text-sm font-mono overflow-x-auto whitespace-nowrap">
                                {ingestionUrl}
                            </code>
                            <button
                                onClick={() => copyToClipboard(ingestionUrl, setCopiedUrl)}
                                className="btn btn-secondary whitespace-nowrap"
                            >
                                {copiedUrl ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-admin-text-muted mt-1">Paste this into OBS Settings &gt; Stream &gt; Server</p>
                    </div>
                )}

                {/* Stream Key */}
                {streamKey && (
                    <div>
                        <label className="block text-sm font-medium text-admin-text-muted mb-1">
                            Stream Key
                        </label>
                        <div className="flex gap-2">
                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded border border-admin-border text-sm font-mono overflow-x-auto">
                                {streamKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(streamKey, setCopiedKey)}
                                className="btn btn-secondary whitespace-nowrap"
                            >
                                {copiedKey ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-admin-text-muted mt-1">Paste this into OBS Settings &gt; Stream &gt; Stream Key</p>
                    </div>
                )}
            </div>
        </div>
    );
}
