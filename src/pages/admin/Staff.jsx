import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Trash2, UserPlus, Users, GraduationCap } from 'lucide-react';

export default function Staff() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('teachers');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Teacher',
        batchId: '',
        sendEmail: true,
        downloadCSV: false,
    });

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const inputBg = isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900';
    const cardBg = isDark ? 'bg-gray-900/60 backdrop-blur-xl border-white/10' : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadStaff();
        loadBatches();
    }, []);

    const loadBatches = async () => {
        try {
            const { data } = await api.get('/batches');
            setBatches(data.batches || []);
        } catch (error) {
            console.error('Failed to load batches:', error);
        }
    };

    const loadStaff = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/institutions/staff');
            const staff = data.staff || [];

            // Separate teachers and students
            setTeachers(staff.filter(s => s.role === 'Teacher'));
            setStudents(staff.filter(s => s.role === 'Student'));
        } catch (error) {
            console.error('Failed to load staff:', error);
            toast.error(error?.response?.data?.message || 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/institutions/staff', formData);
            toast.success('User added successfully');
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                role: 'Teacher',
                batchId: '',
                sendEmail: true,
                downloadCSV: false,
            });
            loadStaff();
        } catch (error) {
            console.error('Error adding staff:', error);
            toast.error(error?.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/institutions/staff/${userId}`);
            toast.success('User deleted successfully');
            loadStaff();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete user');
        }
    };

    const openAddModal = (role) => {
        setFormData({ ...formData, role, batchId: '' });
        setShowAddModal(true);
    };

    const getBatchName = (batchId) => {
        if (!batchId) return '-';
        const batch = batches.find(b => b._id === batchId);
        return batch ? batch.name : batchId;
    };

    const teacherColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium border border-emerald-500/20`}>Active</span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-50'}`} title="View Details">
                        <Eye size={18} />
                    </button>
                    <button onClick={() => handleDelete(row._id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'}`} title="Delete User">
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    const studentColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Batch',
            render: (row) => getBatchName(row.batchId)
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium border border-emerald-500/20`}>Active</span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => alert(`User Details:\nID: ${row.id}\nName: ${row.name}\nEmail: ${row.email}\nRole: ${row.role}${row.batchId ? `\nBatch: ${getBatchName(row.batchId)}` : ''}`)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-600 hover:bg-blue-50'}`}
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                    <button onClick={() => handleDelete(row._id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'}`} title="Delete User">
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner centered />;
    }

    const InputField = ({ label, type = "text", required = false, value, onChange, placeholder }) => (
        <div>
            <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                required={required}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-3xl font-bold ${textPrimary}`}>Staff Management</h1>
                    <p className={`${textSecondary} mt-1`}>Manage teachers and students</p>
                </div>
                <button
                    onClick={() => openAddModal(activeTab === 'teachers' ? 'Teacher' : 'Student')}
                    className="btn btn-primary flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all active:scale-95"
                >
                    <UserPlus size={20} />
                    <span>{activeTab === 'teachers' ? 'Add Teacher' : 'Add Student'}</span>
                </button>
            </div>

            {/* Content Container */}
            <div className={`${cardBg} border rounded-2xl overflow-hidden shadow-xl min-h-[600px] flex flex-col`}>
                {/* Tabs */}
                <div className="flex border-b border-white/5 px-6 pt-4 gap-6">
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`pb-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'teachers' ? 'border-violet-500 text-violet-500' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
                    >
                        <Users size={18} />
                        Teachers
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`pb-4 px-2 border-b-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'students' ? 'border-violet-500 text-violet-500' : 'border-transparent text-gray-500 hover:text-gray-400'}`}
                    >
                        <GraduationCap size={18} />
                        Students
                    </button>
                </div>

                {/* Table Area */}
                <div className="p-6 flex-1">
                    {activeTab === 'teachers' ? (
                        <Table
                            columns={teacherColumns}
                            data={teachers}
                            emptyMessage="No teachers found. Add your first teacher to get started."
                        />
                    ) : (
                        <Table
                            columns={studentColumns}
                            data={students}
                            emptyMessage="No students found. Add your first student to get started."
                        />
                    )}
                </div>
            </div>

            {/* Add Staff Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Add ${formData.role}`}
            >
                <form onSubmit={handleAddStaff} className="space-y-4">
                    <InputField
                        label="Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                    />

                    <InputField
                        label="Email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>Role</label>
                        <select
                            className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    {formData.role === 'Student' && (
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${textPrimary}`}>
                                Batch {batches.length > 0 && '(Optional)'}
                            </label>
                            <select
                                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                                value={formData.batchId}
                                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                            >
                                <option value="">Select a batch (optional)</option>
                                {batches.map((batch) => (
                                    <option key={batch._id} value={batch._id}>
                                        {batch.name} {batch.academicYear && `(${batch.academicYear})`}
                                    </option>
                                ))}
                            </select>
                            {batches.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">
                                    No batches available. Create a batch first.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-dashed border-gray-500/30 hover:bg-gray-500/5 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.sendEmail}
                                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                            />
                            <span className={`text-sm ${textPrimary}`}>Send credentials via email</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-dashed border-gray-500/30 hover:bg-gray-500/5 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.downloadCSV}
                                onChange={(e) => setFormData({ ...formData, downloadCSV: e.target.checked })}
                                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                            />
                            <span className={`text-sm ${textPrimary}`}>Download credentials as CSV</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95">
                            Add {formData.role}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className={`flex-1 py-3 rounded-xl font-medium transition-all ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
