import { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Trash2 } from 'lucide-react';

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
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';
    const tabActive = 'border-violet-500 text-violet-500';
    const tabInactive = isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-gray-500 hover:text-gray-900';

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
            alert(error?.response?.data?.message || 'Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/institutions/staff', formData);
            alert('User added successfully');
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
            alert(error?.response?.data?.message || 'Failed to add user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/institutions/staff/${userId}`);
            alert('User deleted successfully');
            loadStaff();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete user');
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
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View Details">
                        <Eye size={18} />
                    </button>
                    <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete User">
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
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
            ),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => alert(`User Details:\nID: ${row.id}\nName: ${row.name}\nEmail: ${row.email}\nRole: ${row.role}${row.batchId ? `\nBatch: ${getBatchName(row.batchId)}` : ''}`)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                    <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete User">
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
            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                {label} {required && '*'}
            </label>
            <input
                type={type}
                required={required}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Staff Management</h1>
                    <p className={`${textSecondary} mt-1`}>Manage teachers and students</p>
                </div>
                <button
                    onClick={() => openAddModal(activeTab === 'teachers' ? 'Teacher' : 'Student')}
                    className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 border-none shadow-lg hover:shadow-purple-500/30"
                >
                    {activeTab === 'teachers' ? '+ Add Teacher' : '+ Add Student'}
                </button>
            </div>

            {/* Tabs */}
            <div className={`border-b ${isDark ? 'border-white/10' : 'border-admin-border'}`}>
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === 'teachers' ? tabActive : tabInactive}`}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`pb-3 px-1 border-b-2 font-medium transition-colors ${activeTab === 'students' ? tabActive : tabInactive}`}
                    >
                        Students
                    </button>
                </div>
            </div>

            {/* Table */}
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
                        <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Role</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    {formData.role === 'Student' && (
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                                Batch {batches.length > 0 && '(Optional)'}
                            </label>
                            <select
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
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

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.sendEmail}
                                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className={`text-sm ${textPrimary}`}>Send credentials via email</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.downloadCSV}
                                onChange={(e) => setFormData({ ...formData, downloadCSV: e.target.checked })}
                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className={`text-sm ${textPrimary}`}>Download credentials as CSV</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1 bg-gradient-to-r from-violet-600 to-purple-600 border-none">
                            Add {formData.role}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className={`btn flex-1 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
