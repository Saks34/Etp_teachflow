import { useState, useEffect } from 'react';
import api from '../../services/api';
import AnalyticsCard from '../../components/teacher/AnalyticsCard';

export default function AdminAnalytics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await api.get('/analytics/admin');
            setStats(data);
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-red-600">Failed to load analytics</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-admin-text">Institution Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnalyticsCard
                    title="Total Classes"
                    value={stats.totalClasses || 0}
                    icon="📚"
                    subtitle={`${stats.scheduledClasses || 0} scheduled`}
                />
                <AnalyticsCard
                    title="Live Now"
                    value={stats.liveClasses || 0}
                    icon="🔴"
                />
                <AnalyticsCard
                    title="Completed Classes"
                    value={stats.completedClasses || 0}
                    icon="✅"
                />
                <AnalyticsCard
                    title="Total Views"
                    value={stats.totalViews || 0}
                    icon="👀"
                />
                <AnalyticsCard
                    title="Avg. Peak Viewers"
                    value={stats.avgPeakViewers || 0}
                    icon="📊"
                />
                <AnalyticsCard
                    title="Total Chat Messages"
                    value={stats.totalChatMessages || 0}
                    icon="💬"
                />
            </div>

            <div className="card p-6 mt-6">
                <h2 className="text-lg font-semibold text-admin-text mb-4">Platform Overview</h2>
                <div className="space-y-2 text-sm text-admin-text-muted">
                    <p>• Classes are running smoothly across the platform</p>
                    <p>• {stats.liveClasses || 0} classes currently streaming</p>
                    <p>• {stats.completedClasses || 0} classes completed successfully</p>
                </div>
            </div>
        </div>
    );
}
