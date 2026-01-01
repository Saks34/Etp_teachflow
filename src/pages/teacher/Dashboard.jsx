import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClassCard from '../../components/teacher/ClassCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext';

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TeacherDashboard() {
  usePageTitle('Dashboard', 'Teacher');
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [error, setError] = useState(null);

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';
  const cardBg = isDark
    ? 'bg-white/5 backdrop-blur-xl border-white/10'
    : 'bg-white/70 backdrop-blur-xl border-white/50';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const date = todayISODate();
      const { data } = await api.get('/timetables/by-teacher', { params: { date } });

      // Separate today's classes from upcoming
      const today = new Date().toISOString().split('T')[0];
      const todaySlots = (data.slots || []).filter(s => s.date === today || !s.date);
      const upcomingSlots = (data.slots || []).filter(s => s.date && s.date > today);

      setTodayClasses(todaySlots);
      setUpcomingClasses(upcomingSlots);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner centered />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h1>
        <p className={`${textSecondary} mt-1`}>Manage your classes and teaching sessions</p>
      </div>

      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg`}>
          {error}
        </div>
      )}

      {/* Today's Classes */}
      <section>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Today's Classes</h2>
        {todayClasses.length === 0 ? (
          <div className={`${cardBg} border ${borderColor} p-8 text-center rounded-xl shadow-lg`}>
            <p className={textMuted}>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((classData) => (
              <ClassCard key={classData._id} classData={classData} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Classes */}
      {upcomingClasses.length > 0 && (
        <section>
          <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Upcoming Classes</h2>
          <div className={`${cardBg} border ${borderColor} p-6 rounded-xl shadow-lg`}>
            <div className="space-y-3">
              {upcomingClasses.map((slot) => (
                <div
                  key={slot._id}
                  className={`flex items-center justify-between p-4 border ${borderColor} rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div>
                    <h3 className={`font-medium ${textPrimary}`}>{slot.subject}</h3>
                    <p className={`text-sm ${textSecondary}`}>
                      {slot.day} • {slot.startTime} - {slot.endTime}
                    </p>
                    <p className={`text-sm ${textSecondary}`}>
                      Batch: {slot.batch?.name || slot.batch}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
