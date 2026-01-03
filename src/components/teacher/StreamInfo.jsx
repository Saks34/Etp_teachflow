import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Copy, Check } from 'lucide-react';

export default function StreamInfo({ streamKey, ingestionUrl }) {
    const { isDark } = useTheme();
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const copyToClipboard = async (text, setter) => {
        await navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    return (
        <div className={`rounded-2xl shadow-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                OBS Stream Setup
            </h3>

            <div className="space-y-6">
                {/* RTMP URL */}
                <div>
                    <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Server URL (RTMP)
                    </label>
                    <div className="flex gap-2">
                        <code className={`flex-1 px-4 py-3 rounded-lg text-xs font-mono overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                            }`}>
                            {ingestionUrl || 'Loading...'}
                        </code>
                        <button
                            onClick={() => copyToClipboard(ingestionUrl, setCopiedUrl)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${copiedUrl ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                        >
                            {copiedUrl ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Stream Key */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Stream Key
                        </label>
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                            <Eye className="w-3 h-3" />
                            {showKey ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <code className={`flex-1 px-4 py-3 rounded-lg text-xs font-mono overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'
                            }`}>
                            {showKey ? streamKey : '••••••••••••••••••••'}
                        </code>
                        <button
                            onClick={() => copyToClipboard(streamKey, setCopiedKey)}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${copiedKey ? 'bg-green-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                        >
                            {copiedKey ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Quick Guide */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                    }`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                        Quick Setup Steps
                    </h4>
                    <ol className={`space-y-2 text-xs ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                        <li>1. Open OBS Studio → Settings → Stream</li>
                        <li>2. Select "Custom" as Service</li>
                        <li>3. Paste Server URL and Stream Key</li>
                        <li>4. Click "Start Streaming"</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
