import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Table from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { useTheme } from '../../context/ThemeContext';
import { Shield, Trash2, Edit, Plus, UserPlus } from 'lucide-react';


export default function Moderators() {
    const { isDark } = useTheme();
    const [moderators, setModerators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingModerator, setEditingModerator] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Moderator',
        sendEmail: true,
        downloadCSV: false,
    });

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';
    const cardBg = isDark ? 'bg-gray-900/60 backdrop-blur-xl border-white/10' : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    useEffect(() => {
        loadModerators();
    }, []);

    const loadBatches = async () => {
        try {
            const { data } = await api.get('/batches');
            setBatches(data.batches || []);
        } catch (error) {
            console.error('Failed to load batches:', error);
        }
    };

    const loadModerators = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/institutions/staff?role=Moderator');
            setModerators(data.staff || []);
        } catch (error) {
            console.error('Failed to load moderators:', error);
            toast.error(error?.response?.data?.message || 'Failed to load moderators');
        } finally {
            setLoading(false);
        }
    };

    const handleAddModerator = async (e) => {
        e.preventDefault();
        try {
            // Force role to be Moderator
            const payload = { ...formData, role: 'Moderator' };
            await api.post('/institutions/staff', payload);
            toast.success('Moderator added successfully');
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                role: 'Moderator',
                sendEmail: true,
                downloadCSV: false,
            });
            loadModerators();
        } catch (error) {
            console.error('Error adding moderator:', error);
            toast.error(error?.response?.data?.message || 'Failed to add moderator');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this moderator?')) return;

        try {
            await api.delete(`/institutions/staff/${userId}`);
            toast.success('Moderator deleted successfully');
            loadModerators();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete moderator');
        }
    };

    const handleEdit = (moderator) => {
        setEditingModerator(moderator);
        setFormData({
            name: moderator.name,
            email: moderator.email,
            role: 'Moderator',
            sendEmail: false,
            downloadCSV: false,
        });
        setShowEditModal(true);
    };

    const handleUpdateModerator = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/institutions/staff/${editingModerator.id}`, {
                name: formData.name,
                role: 'Moderator',
            });
            toast.success('Moderator updated successfully');
            setShowEditModal(false);
            setEditingModerator(null);
            loadModerators();
        } catch (error) {
            console.error('Error updating moderator:', error);
            toast.error(error?.response?.data?.message || 'Failed to update moderator');
        }
    };

    const openAddModal = () => {
        setFormData({ ...formData, role: 'Moderator' });
        setShowAddModal(true);
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Role',
            render: () => <span className="font-medium">Moderator</span>
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs border ${isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-200'}`}>
                    Active
                </span>
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
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit Moderator"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Moderator"
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



    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-4xl font-bold ${textPrimary} mb-2`}>Moderators</h1>
                    <p className={textSecondary}>Manage your content moderators and support staff</p>
                </div>
                <button
                    onClick={openAddModal}
                    className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:scale-105 transition-all font-medium`}
                >
                    <Shield size={18} />
                    Add Moderator
                </button>
            </div>

            <div className={`${cardBg} border rounded-2xl p-6 shadow-xl`}>
                <Table
                    columns={columns}
                    data={moderators}
                    emptyMessage="No moderators found. Add your first moderator to get started."
                />
            </div>

            {/* Add Staff Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Moderator"
            >
                <form onSubmit={handleAddModerator} className="space-y-4">
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

                    {/* Role Selection Removed - defaults to Moderator */}

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
                        <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/30 transition-all">
                            Add Moderator
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Moderator Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Moderator"
            >
                <form onSubmit={handleUpdateModerator} className="space-y-4">
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
                        <input
                            className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg}`}
                            value="Moderator"
                            disabled
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/30 transition-all">
                            Update Moderator
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
}

const InputField = ({ label, type = "text", required = false, value, onChange, placeholder, disabled }) => {
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
                className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all ${inputBg} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
};
