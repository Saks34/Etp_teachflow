import { useState, useEffect } from 'react';
import api from '../../services/api';
import TimetableCalendar from '../../components/shared/TimetableCalendar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function TeacherTimetable() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Teacher endpoint automatically uses logical teacher ID from token
                const { data } = await api.get('/timetables/by-teacher');
                setSlots(data.slots || []);
            } catch (error) {
                console.error('Failed to load timetable:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSlotClick = (slot, action) => {
        // Teachers might have different actions like "Start Class" (handled inside Calendar for generic 'live' status button)
        // But for now, maybe just view details.
        console.log('Slot clicked:', slot);
    };

    if (loading) return <LoadingSpinner centered />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Class Schedule</h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>View your weekly teaching schedule</p>
            </div>

            <TimetableCalendar
                slots={slots}
                onSlotClick={handleSlotClick}
                userRole="Teacher"
                loading={loading}
            />
        </div>
    );
}
