import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClassCard from '../../components/student/ClassCard';
import EmptyState from '../../components/shared/EmptyState';
import { useAuth } from '../../context/AuthContext';

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="text-admin-text-muted mt-1">
          View your classes and join live sessions
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Today's Classes */}
      <section>
        <h2 className="text-xl font-semibold text-admin-text mb-4">
          Today's Classes
        </h2>
        {todayClasses.length === 0 ? (
          <EmptyState message="No classes scheduled for today. Enjoy your free time! 🎉" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayClasses.map((classData) => (
              <ClassCard key={classData._id} classData={classData} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
