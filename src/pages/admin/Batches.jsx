import { useState, useEffect } from 'react';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

export default function Batches() {
    const { isDark } = useTheme();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        academicYear: '',
        description: '',
    });

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';

    useEffect(() => {
        loadBatches();
    }, []);

    const loadBatches = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/batches');
            setBatches(data.batches || []);
        } catch (error) {
            console.error('Failed to load batches:', error);
            alert(error?.response?.data?.message || 'Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/batches', formData);
            alert('Batch created successfully');
            setFormData({ name: '', academicYear: '', description: '' });
            setShowCreateModal(false);
            loadBatches();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to create batch');
        }
    };

    const handleEditBatch = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/batches/${selectedBatch._id}`, formData);
            alert('Batch updated successfully');
            setShowEditModal(false);
            setSelectedBatch(null);
            setFormData({ name: '', academicYear: '', description: '' });
            loadBatches();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update batch');
        }
    };

    const handleDeleteBatch = async (batchId, batchName) => {
        if (!confirm(`Are you sure you want to delete "${batchName}"?`)) return;

        try {
            await api.delete(`/batches/${batchId}`);
            alert('Batch deleted successfully');
            loadBatches();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete batch');
        }
    };

    const openEditModal = (batch) => {
        setSelectedBatch(batch);
        setFormData({
            name: batch.name,
            academicYear: batch.academicYear || '',
            description: batch.description || '',
        });
        setShowEditModal(true);
    };

    const columns = [
        { header: 'Batch Name', accessor: 'name' },
        {
            header: 'Academic Year',
            render: (row) => row.academicYear || '-'
        },
        {
            header: 'Student Count',
            render: (row) => row.studentCount || 0,
        },
        {
            header: 'Created',
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Batch"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteBatch(row._id, row.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Batch"
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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Batch Management</h1>
                    <p className={`${textSecondary} mt-1`}>Organize students into batches</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary bg-gradient-to-r from-violet-600 to-purple-600 border-none shadow-lg hover:shadow-purple-500/30"
                >
                    + Create Batch
                </button>
            </div>

            <Table
                columns={columns}
                data={batches}
                emptyMessage="No batches found. Create your first batch to get started."
            />

            {/* Create Batch Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', academicYear: '', description: '' });
                }}
                title="Create New Batch"
                size="sm"
            >
                <form onSubmit={handleCreateBatch} className="space-y-4">
                    <InputField
                        label="Batch Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Batch A, Class 10A"
                    />

                    <InputField
                        label="Academic Year"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        placeholder="e.g., 2025-2026"
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                            Description
                        </label>
                        <textarea
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional notes about this batch"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1 bg-gradient-to-r from-violet-600 to-purple-600 border-none">
                            Create Batch
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(false);
                                setFormData({ name: '', academicYear: '', description: '' });
                            }}
                            className={`btn flex-1 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Batch Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedBatch(null);
                    setFormData({ name: '', academicYear: '', description: '' });
                }}
                title="Edit Batch"
                size="sm"
            >
                <form onSubmit={handleEditBatch} className="space-y-4">
                    <InputField
                        label="Batch Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <InputField
                        label="Academic Year"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    />

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                            Description
                        </label>
                        <textarea
                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-admin-primary focus:border-transparent outline-none transition-all ${inputBg}`}
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn btn-primary flex-1 bg-gradient-to-r from-violet-600 to-purple-600 border-none">
                            Update Batch
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedBatch(null);
                                setFormData({ name: '', academicYear: '', description: '' });
                            }}
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
