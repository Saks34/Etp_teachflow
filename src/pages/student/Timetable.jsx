import { useState, useEffect } from 'react';
import api from '../../services/api';
import TimetableCalendar from '../../components/shared/TimetableCalendar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, Clock, BookOpen } from 'lucide-react';

export default function StudentTimetable() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.batch?._id && !user?.batch) return;
            setLoading(true);
            try {
                const batchId = user.batch._id || user.batch;
                const { data } = await api.get('/timetables/by-batch', { params: { batchId } });
                setSlots(data.slots || []);
            } catch (error) {
                console.error('Failed to load timetable:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) loadData();
    }, [user]);

    const todaySlots = slots.filter(slot => {
        const today = new Date().toISOString().split('T')[0];
        return !slot.date || slot.date === today;
    });

    if (loading) return <LoadingSpinner centered />;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className={`relative overflow-hidden rounded-2xl ${isDark ? 'bg-[#111118]/60' : 'bg-white/60'} backdrop-blur-xl border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl`}></div>

                <div className="relative p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600`}>
                                <Calendar className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Class Timetable</h1>
                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Your weekly schedule</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <Clock size={14} className={isDark ? 'text-cyan-400' : 'text-cyan-600'} />
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{todaySlots.length}</span>
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Today</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <BookOpen size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{slots.length}</span>
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className={`${isDark ? 'bg-[#111118]/60 border-white/5' : 'bg-white/60 border-gray-200/50'} backdrop-blur-xl border rounded-2xl overflow-hidden`}>
                <div className="p-5">
                    <TimetableCalendar
                        slots={slots}
                        onSlotClick={() => { }}
                        userRole="Student"
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
