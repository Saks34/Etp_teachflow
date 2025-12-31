import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Bell, AlertTriangle, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function Notifications() {
    const { isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const cardBg = isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white border-admin-border';
    const borderColor = isDark ? 'border-white/10' : 'border-admin-border';
    const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            // Mock data for now
            setNotifications([
                {
                    id: 1,
                    title: 'Class Cancelled',
                    message: 'Mathematics class for Batch A has been cancelled.',
                    timestamp: new Date().toISOString(),
                    type: 'class_cancelled',
                },
                {
                    id: 2,
                    title: 'New Teacher Joined',
                    message: 'Sarah Johnson has joined as a Physics teacher.',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    type: 'teacher_joined',
                },
                {
                    id: 3,
                    title: 'System Update',
                    message: 'System maintenance scheduled for Sunday at 2 AM.',
                    timestamp: new Date(Date.now() - 86400000).toISOString(),
                    type: 'system',
                }
            ]);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'class_cancelled': return <AlertTriangle className="text-red-500" size={24} />;
            case 'teacher_joined': return <CheckCircle className="text-green-500" size={24} />;
            case 'system': return <Bell className="text-blue-500" size={24} />;
            default: return <Bell className="text-purple-500" size={24} />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Notifications</h1>
                <p className={`${textSecondary} mt-1`}>System events and updates</p>
            </div>

            {notifications.length === 0 ? (
                <div className={`card p-12 text-center ${cardBg} border ${borderColor}`}>
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <Bell className={textSecondary} size={32} />
                        </div>
                    </div>
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No notifications</h3>
                    <p className={textSecondary}>
                        You're all caught up! New notifications will appear here.
                    </p>
                </div>
            ) : (
                <div className={`card divide-y ${borderColor} ${cardBg} border overflow-hidden`}>
                    {notifications.map((notification) => (
                        <div key={notification.id} className={`p-6 ${hoverBg} transition-colors cursor-pointer group`}>
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-base font-semibold ${textPrimary} mb-1`}>{notification.title}</h4>
                                    <p className={`${textSecondary} text-sm mb-2`}>{notification.message}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} />
                                        <span>{formatTimestamp(notification.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
