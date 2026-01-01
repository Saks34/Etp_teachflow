import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
    Video,
    Copy,
    Check,
    Radio,
    Monitor,
    Key,
    Server,
    Eye,
    EyeOff,
    Cast
} from 'lucide-react';
import CustomYouTubePlayer from '../shared/CustomYouTubePlayer';

export default function StreamInfo({
    liveClassId,
    ytStatus,
    streamKey,
    ingestionUrl,
    liveUrl,
    broadcastId
}) {
    const { isDark } = useTheme();
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [showStreamKey, setShowStreamKey] = useState(false);

    const copyToClipboard = async (text, setter) => {
        try {
            await navigator.clipboard.writeText(text);
            setter(true);
            setTimeout(() => setter(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeVideoId(liveUrl) || broadcastId;

    const getStatusBadge = () => {
        const statusConfig = {
            live: {
                bg: 'bg-red-500',
                text: 'LIVE NOW',
                pulse: true,
                icon: Radio
            },
            ready: {
                bg: 'bg-green-500',
                text: 'READY',
                pulse: false,
                icon: Check
            },
            testing: {
                bg: 'bg-yellow-500',
                text: 'TESTING',
                pulse: false,
                icon: Monitor
            }
        };

        const config = statusConfig[ytStatus] || {
            bg: 'bg-gray-500',
            text: 'NOT STARTED',
            pulse: false,
            icon: Video
        };

        const Icon = config.icon;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.bg} text-white rounded-full text-xs font-bold ${config.pulse ? 'animate-pulse' : ''}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{config.text}</span>
            </div>
        );
    };

    return (
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Cast className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Stream Information
                    </h3>
                </div>
                {ytStatus && getStatusBadge()}
            </div>

            <div className="space-y-6">
                {/* YouTube Player */}
                {videoId && (
                    <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                        <div className={`px-4 py-3 flex items-center justify-between ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                            <div className="flex items-center gap-2">
                                <Video className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Live Stream Preview
                                </span>
                            </div>
                        </div>

                        <div className="aspect-video w-full bg-black relative">
                            <CustomYouTubePlayer videoId={videoId} />
                        </div>


                    </div>
                )}

                {/* RTMP URL (Ingestion Address) */}
                {ingestionUrl && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Server className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <label className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'
                                }`}>
                                Stream URL (RTMP Server)
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <code className={`flex-1 px-4 py-3 rounded-lg border text-sm font-mono overflow-x-auto ${isDark
                                ? 'bg-gray-900 border-gray-700 text-gray-300'
                                : 'bg-gray-50 border-gray-300 text-gray-800'
                                }`}>
                                {ingestionUrl}
                            </code>
                            <button
                                onClick={() => copyToClipboard(ingestionUrl, setCopiedUrl)}
                                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${copiedUrl
                                    ? 'bg-green-500 text-white'
                                    : isDark
                                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {copiedUrl ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>

                        <div className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                            }`}>
                            <Monitor className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'
                                }`} />
                            <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                <strong>OBS Setup:</strong> Settings → Stream → Server → Paste this URL
                            </p>
                        </div>
                    </div>
                )}

                {/* Stream Key */}
                {streamKey && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                <label className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'
                                    }`}>
                                    Stream Key
                                </label>
                            </div>
                            <button
                                onClick={() => setShowStreamKey(!showStreamKey)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${isDark
                                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {showStreamKey ? (
                                    <>
                                        <EyeOff className="w-3.5 h-3.5" />
                                        Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-3.5 h-3.5" />
                                        Show
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <code className={`flex-1 px-4 py-3 rounded-lg border text-sm font-mono overflow-x-auto ${isDark
                                ? 'bg-gray-900 border-gray-700 text-gray-300'
                                : 'bg-gray-50 border-gray-300 text-gray-800'
                                }`}>
                                {showStreamKey ? streamKey : '•'.repeat(32)}
                            </code>
                            <button
                                onClick={() => copyToClipboard(streamKey, setCopiedKey)}
                                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${copiedKey
                                    ? 'bg-green-500 text-white'
                                    : isDark
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {copiedKey ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>

                        <div className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'
                            }`}>
                            <Key className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                }`} />
                            <p className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                                <strong>OBS Setup:</strong> Settings → Stream → Stream Key → Paste this key
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Setup Guide */}
                {(ingestionUrl || streamKey) && (
                    <div className={`rounded-xl p-4 border ${isDark
                        ? 'bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-800'
                        : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                        }`}>
                        <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            <Monitor className="w-4 h-4" />
                            Quick Setup Guide
                        </h4>
                        <ol className={`space-y-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>
                                <span>Open OBS Studio → Settings → Stream</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>
                                <span>Select "Custom" as Service</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>
                                <span>Paste the Server URL and Stream Key above</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">4.</span>
                                <span>Click "Start Streaming" in OBS</span>
                            </li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
