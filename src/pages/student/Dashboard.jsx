import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClassCard from '../../components/student/ClassCard';
import EmptyState from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import usePageTitle from '../../hooks/usePageTitle';
import { Calendar, BookOpen } from 'lucide-react';

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function StudentDashboard() {
  usePageTitle('Dashboard', 'Student');
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';
  const cardBg = isDark
    ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
    : 'bg-white/60 backdrop-blur-xl border-gray-200/50';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  useEffect(() => {
    loadTodayClasses();
  }, []);

  const loadTodayClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const date = todayISODate();
      const batchId = user?.batch?._id || user?.batch;

      if (!batchId) {
        setError('No batch assigned to your account');
        setLoading(false);
        return;
      }

      const { data } = await api.get('/timetables/by-batch', {
        params: { batchId, date },
      });

      // Filter for today's classes
      const today = new Date().toISOString().split('T')[0];
      const todaySlots = (data.slots || []).filter(
        (s) => !s.date || s.date === today
      );

      setTodayClasses(todaySlots);
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
        <p className={textSecondary}>
          View your classes and join live sessions
        </p>
      </div>

      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-xl`}>
          {error}
        </div>
      )}

      {/* Today's Classes */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <Calendar size={24} />
          </div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>
            Today's Classes
          </h2>
        </div>

        {todayClasses.length === 0 ? (
          <div className={`${cardBg} border ${borderColor} p-12 text-center rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4`}>
            <div className={`p-4 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} text-gray-400`}>
              <BookOpen size={48} />
            </div>
            <p className={`${textMuted} text-lg font-medium`}>No classes scheduled for today. Enjoy your free time! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayClasses.map((classData) => (
              <ClassCard key={classData._id} classData={classData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
