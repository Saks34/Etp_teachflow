import { useState, useEffect } from 'react';
import api from '../../services/api';
import TimetableCalendar from '../../components/shared/TimetableCalendar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function StudentTimetable() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark
        ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        const loadData = async () => {
            if (!user?.batch?._id && !user?.batch) {
                console.error("No batch assigned to student");
                return;
            }

            setLoading(true);
            try {
                // Students need to pass their batch ID
                const batchId = user.batch._id || user.batch;
                const { data } = await api.get('/timetables/by-batch', {
                    params: { batchId }
                });
                setSlots(data.slots || []);
            } catch (error) {
                console.error('Failed to load timetable:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) loadData();
    }, [user]);

    const handleSlotClick = (slot) => {
        // Students view details or join
        // console.log('Slot clicked:', slot);
    };

    if (loading) return <LoadingSpinner centered />;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>Class Timetable</h1>
                <p className={textSecondary}>Your weekly class schedule</p>
            </div>

            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <TimetableCalendar
                    slots={slots}
                    onSlotClick={handleSlotClick}
                    userRole="Student"
                    loading={loading}
                />
            </div>
        </div>
    );
}
