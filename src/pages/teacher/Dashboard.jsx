import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ClassCard from '../../components/teacher/ClassCard';

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [error, setError] = useState(null);

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
        <h1 className="text-2xl font-bold text-admin-text">Dashboard</h1>
        <p className="text-admin-text-muted mt-1">Manage your classes and teaching sessions</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Today's Classes */}
      <section>
        <h2 className="text-lg font-semibold text-admin-text mb-4">Today's Classes</h2>
        {todayClasses.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-admin-text-muted">No classes scheduled for today</p>
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
          <h2 className="text-lg font-semibold text-admin-text mb-4">Upcoming Classes</h2>
          <div className="card p-6">
            <div className="space-y-3">
              {upcomingClasses.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between p-4 border border-admin-border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-admin-text">{slot.subject}</h3>
                    <p className="text-sm text-admin-text-muted">
                      {slot.day} • {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="text-sm text-admin-text-muted">
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
