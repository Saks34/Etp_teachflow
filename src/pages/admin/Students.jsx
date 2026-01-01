import { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Trash2, Edit } from 'lucide-react';

export default function Students() {
    const { isDark } = useTheme();
    const [students, setStudents] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Student',
        batchId: '',
        sendEmail: true,
        downloadCSV: false,
    });

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    useEffect(() => {
        loadStudents();
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

    const loadStudents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/institutions/staff?role=Student');
            setStudents(data.staff || []);
        } catch (error) {
            console.error('Failed to load students:', error);
            alert(error?.response?.data?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/institutions/staff', formData);
            alert('Student added successfully');
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                role: 'Student',
                batchId: '',
                sendEmail: true,
                downloadCSV: false,
            });
            loadStudents();
        } catch (error) {
            console.error('Error adding student:', error);
            alert(error?.response?.data?.message || 'Failed to add student');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            await api.delete(`/institutions/staff/${userId}`);
            alert('Student deleted successfully');
            loadStudents();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete student');
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            batchId: student.batchId || '',
            sendEmail: false,
            downloadCSV: false,
        });
        setShowEditModal(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/institutions/staff/${editingStudent.id}`, {
                name: formData.name,
                batchId: formData.batchId || null,
            });
            alert('Student updated successfully');
            setShowEditModal(false);
            setEditingStudent(null);
            loadStudents();
        } catch (error) {
            console.error('Error updating student:', error);
            alert(error?.response?.data?.message || 'Failed to update student');
        }
    };

    const openAddModal = () => {
        setFormData({ ...formData, role: 'Student', batchId: '' });
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
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Student"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Student"
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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Student Management</h1>
                    <p className={`${textSecondary} mt-1`}>Manage students and batch assignments</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 border-none shadow-lg hover:shadow-purple-500/30"
                >
                    + Add Student
                </button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={students}
                emptyMessage="No students found. Add your first student to get started."
            />

            {/* Add Student Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Student"
            >
                <form onSubmit={handleAddStudent} className="space-y-4">
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
                            Add Student
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

            {/* Edit Student Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Student"
            >
                <form onSubmit={handleUpdateStudent} className="space-y-4">
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
                        disabled
                        placeholder="email@example.com"
                    />

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
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1 bg-gradient-to-r from-violet-600 to-purple-600 border-none">
                            Update Student
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
