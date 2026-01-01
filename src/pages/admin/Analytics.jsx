import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnalyticsCard from '../../components/teacher/AnalyticsCard';
import { useTheme } from '../../context/ThemeContext';
import { BarChart3, Users, Video, BookCheck, MessageSquare, Eye } from 'lucide-react';

export default function AdminAnalytics() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark ? 'bg-gray-900/60 backdrop-blur-xl border-white/10' : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Mock data to ensure it looks good if API fails or returns empty
            // In production, remove this mock if API is reliable
            const { data } = await api.get('/analytics/admin');
            setStats(data);
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={`p-8 text-center ${textSecondary}`}>Loading analytics...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Institution Analytics</h1>
                <p className={`${textSecondary} mt-1`}>Platform usage and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    title="Total Classes"
                    value={stats.totalClasses || 0}
                    icon={<BarChart3 size={24} />}
                    subtitle={`${stats.scheduledClasses || 0} scheduled`}
                />
                <AnalyticsCard
                    title="Live Now"
                    value={stats.liveClasses || 0}
                    icon={<Video size={24} />}
                    trend={stats.liveClasses > 0 ? 10 : 0}
                />
                <AnalyticsCard
                    title="Completed Classes"
                    value={stats.completedClasses || 0}
                    icon={<BookCheck size={24} />}
                />
                <AnalyticsCard
                    title="Total Views"
                    value={stats.totalViews || 0}
                    icon={<Eye size={24} />}
                    trend={5}
                />
                <AnalyticsCard
                    title="Avg. Peak Viewers"
                    value={stats.avgPeakViewers || 0}
                    icon={<Users size={24} />}
                />
                <AnalyticsCard
                    title="Total Chat Messages"
                    value={stats.totalChatMessages || 0}
                    icon={<MessageSquare size={24} />}
                />
            </div>

            <div className={`${cardBg} border rounded-2xl p-6 mt-6 shadow-xl`}>
                <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>Platform Overview</h2>
                <div className={`space-y-3 ${textSecondary}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <p>Classes are running smoothly across the platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <p>{stats.liveClasses || 0} classes currently streaming</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p>{stats.completedClasses || 0} classes completed successfully</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
