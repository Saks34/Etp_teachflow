import { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Trash2, Edit } from 'lucide-react';

export default function Teachers() {
    const { isDark } = useTheme();
    const [teachers, setTeachers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Teacher',
        sendEmail: true,
        downloadCSV: false,
    });

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    useEffect(() => {
        loadTeachers();
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

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/institutions/staff?role=Teacher');
            const staff = data.staff || [];
            // Filter for both Teachers and Moderators
            setTeachers(staff.filter(s => s.role === 'Teacher' || s.role === 'Moderator'));
        } catch (error) {
            console.error('Failed to load teachers:', error);
            alert(error?.response?.data?.message || 'Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        try {
            await api.post('/institutions/staff', formData);
            alert('Teacher added successfully');
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                role: 'Teacher',
                sendEmail: true,
                downloadCSV: false,
            });
            loadTeachers();
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert(error?.response?.data?.message || 'Failed to add teacher');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            await api.delete(`/institutions/staff/${userId}`);
            alert('Teacher deleted successfully');
            loadTeachers();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete teacher');
        }
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
            sendEmail: false,
            downloadCSV: false,
        });
        setShowEditModal(true);
    };

    const handleUpdateTeacher = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/institutions/staff/${editingTeacher.id}`, {
                name: formData.name,
                role: formData.role,
            });
            alert('Teacher updated successfully');
            setShowEditModal(false);
            setEditingTeacher(null);
            loadTeachers();
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert(error?.response?.data?.message || 'Failed to update teacher');
        }
    };

    const openAddModal = () => {
        setFormData({ ...formData, role: 'Teacher' });
        setShowAddModal(true);
    };

    const getBatchName = (batchId) => {
        if (!batchId) return '-';
        const batch = batches.find(b => b._id === batchId);
        return batch ? batch.name : batchId;
    };

    const columns = [
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
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Teacher"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Teacher"
                    >
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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Teacher Management</h1>
                    <p className={`${textSecondary} mt-1`}>Manage teachers and moderators</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 border-none shadow-lg hover:shadow-purple-500/30"
                >
                    + Add Teacher
                </button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={teachers}
                emptyMessage="No teachers found. Add your first teacher to get started."
            />

            {/* Add Staff Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={`Add ${formData.role}`}
            >
                <form onSubmit={handleAddTeacher} className="space-y-4">
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
                            <option value="Moderator">Moderator</option>
                        </select>
                    </div>



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

            {/* Edit Teacher Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Teacher"
            >
                <form onSubmit={handleUpdateTeacher} className="space-y-4">
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
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        disabled
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>Role</label>
                        <select
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Teacher">Teacher</option>
                            <option value="Moderator">Moderator</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1 bg-gradient-to-r from-violet-600 to-purple-600 border-none">
                            Update Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
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
