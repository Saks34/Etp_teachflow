import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentSidebar() {
    const { user } = useAuth();

    const menuItems = [
        { to: '/student/dashboard', icon: '🏠', label: 'Dashboard' },
        { to: '/student/timetable', icon: '📅', label: 'Timetable' },
        { to: '/student/notes', icon: '📚', label: 'Notes' },
    ];

    return (
        <div className="w-64 bg-white border-r border-admin-border flex flex-col">
            <div className="p-6 border-b border-admin-border">
                <h1 className="text-xl font-bold text-admin-text">ETP TeachFlow</h1>
                <p className="text-sm text-admin-text-muted mt-1">Student Portal</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-admin-primary text-white'
                                : 'text-admin-text hover:bg-gray-50'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {user?.batch && (
                <div className="p-4 border-t border-admin-border">
                    <p className="text-xs text-admin-text-muted uppercase tracking-wide mb-1">
                        Your Batch
                    </p>
                    <p className="text-sm font-medium text-admin-text">
                        {user.batch.name || user.batch}
                    </p>
                </div>
            )}
        </div>
    );
}
