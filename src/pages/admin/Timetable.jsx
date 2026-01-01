import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import TimetableCalendar from '../../components/shared/TimetableCalendar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Plus } from 'lucide-react';

function todayISODate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const SelectField = ({ label, value, onChange, options, required = false, placeholder }) => {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                {label} {required && '*'}
            </label>
            <select
                required={required}
                className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                value={value}
                onChange={onChange}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

const InputField = ({ label, type = "text", required = false, value, onChange, placeholder }) => {
    const { isDark } = useTheme();
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                required={required}
                className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
};

export default function Timetable() {
    const { isDark } = useTheme();
    const { user } = useAuth(); // Get user role
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [batches, setBatches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Initial form state
    const initialFormState = {
        batchId: '',
        subject: '',
        teacherId: '',
        date: todayISODate(),
        startTime: '',
        endTime: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [editingSlotId, setEditingSlotId] = useState(null);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const cardBg = isDark ? 'bg-gray-900/60 backdrop-blur-xl border-white/10' : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load ALL slots for the weekly schedule
            // Populate logic is handled in backend now
            const [timetableRes, batchesRes, teachersRes] = await Promise.all([
                api.get('/timetables'),
                api.get('/batches'),
                api.get('/institutions/staff?role=Teacher')
            ]);

            setSlots(timetableRes.data.slots || []);
            setBatches(batchesRes.data.batches || []);
            setTeachers(teachersRes.data.staff || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateSlot = async (e) => {
        e.preventDefault();

        // Convert selected date to day name (for creating new slots based on date picker)
        const dateObj = new Date(formData.date);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = days[dateObj.getDay()];

        const payload = {
            day, // Backend uses day name
            startTime: formData.startTime,
            endTime: formData.endTime,
            subject: formData.subject,
            batch: formData.batchId,
            teacher: formData.teacherId,
        };

        try {
            if (editingSlotId) {
                await api.patch(`/timetables/${editingSlotId}`, payload);
                toast.success('Class updated successfully');
            } else {
                await api.post('/timetables', payload);
                toast.success('Class scheduled successfully');
            }

            closeModal();
            loadData(); // Refresh calendar
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to save class');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Are you sure you want to delete this class?')) return;
        try {
            await api.delete(`/timetables/${slotId}`);
            toast.success('Class deleted successfully');
            loadData();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete class');
        }
    };

    const openCreateModal = () => {
        setEditingSlotId(null);
        setFormData(initialFormState);
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingSlotId(null);
        setFormData(initialFormState);
    };

    const handleSlotClick = (slot, action) => {
        if (action === 'delete') {
            handleDeleteSlot(slot._id);
        } else if (action === 'edit') {
            setEditingSlotId(slot._id);
            setFormData({
                batchId: slot.batch?._id || slot.batch, // Handle populated or raw ID
                subject: slot.subject,
                teacherId: slot.teacher?._id || slot.teacher, // Handle populated or raw ID
                date: todayISODate(), // We don't store exact date for weekly slots, default to today
                startTime: slot.startTime,
                endTime: slot.endTime,
            });
            setShowCreateModal(true);
        } else if (action === 'join') {
            console.log('Join clicked:', { slot, id: slot?._id, type: typeof slot?._id });
            if (slot?._id) {
                navigate(`/admin/live-class/${String(slot._id)}`);
            } else {
                toast.error('Invalid class ID');
            }
        }
    };

    if (loading) {
        return <LoadingSpinner centered />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>Timetable</h1>
                    <p className={textSecondary}>Schedule and manage classes</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:scale-105 transition-all font-medium`}
                >
                    <Calendar size={18} />
                    Schedule Class
                </button>
            </div>

            {/* Calendar View Container */}
            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <TimetableCalendar
                    slots={slots}
                    onSlotClick={handleSlotClick}
                    userRole={user?.role}
                    loading={loading}
                />
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={closeModal}
                title={editingSlotId ? "Edit Class" : "Schedule New Class"}
                size="md"
            >
                <form onSubmit={handleCreateOrUpdateSlot} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField
                            label="Batch"
                            required
                            value={formData.batchId}
                            onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                            options={batches.map(b => ({ value: b._id, label: b.name }))}
                            placeholder="Select Batch"
                        />

                        <SelectField
                            label="Teacher"
                            required
                            value={formData.teacherId}
                            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                            options={teachers.map(t => ({ value: t.id, label: `${t.name} (${t.email})` }))}
                            placeholder="Select Teacher"
                        />
                    </div>

                    <InputField
                        label="Subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Mathematics"
                    />

                    {/* For Weekly Schedule, day selection is derived from this date picker for simplicity */}
                    {!editingSlotId && (
                        <div className="space-y-1">
                            <InputField
                                label="Select Day (via Date)"
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 ml-1">Pick any date; the class will repeat every {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })}.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Start Time"
                            type="time"
                            required
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                        <InputField
                            label="End Time"
                            type="time"
                            required
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/30 transition-all">
                            {editingSlotId ? 'Update Class' : 'Schedule Class'}
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
