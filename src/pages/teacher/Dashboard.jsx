import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClassCard from '../../components/teacher/ClassCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, Clock, BookOpen } from 'lucide-react';

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
    ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white/60 backdrop-blur-xl border-gray-200/50';
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
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>Dashboard</h1>
        <p className={textSecondary}>Manage your classes and teaching sessions</p>
      </div>

      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl`}>
          {error}
        </div>
      )}

      {/* Today's Classes */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
            <Calendar size={24} />
          </div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Today's Classes</h2>
        </div>

        {todayClasses.length === 0 ? (
          <div className={`${cardBg} border ${borderColor} p-12 text-center rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4`}>
            <div className={`p-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} text-gray-400`}>
              <Calendar size={48} />
            </div>
            <p className={`${textMuted} text-lg font-medium`}>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayClasses.map((classData) => (
              <ClassCard key={classData._id} classData={classData} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Classes */}
      {upcomingClasses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Clock size={24} />
            </div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Upcoming Classes</h2>
          </div>

          <div className={`${cardBg} border ${borderColor} rounded-2xl shadow-xl overflow-hidden`}>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {upcomingClasses.map((slot) => (
                <div
                  key={slot._id}
                  className={`p-6 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${textSecondary}`}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${textPrimary} mb-1`}>{slot.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {slot.day}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'} text-sm font-medium`}>
                    Batch: {slot.batch?.name || slot.batch}
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
