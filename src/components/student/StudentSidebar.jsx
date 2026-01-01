import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Calendar, FileText, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function StudentSidebar() {
    const { user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';
    const sidebarBg = isDark
        ? 'bg-gray-900/50 backdrop-blur-2xl border-white/10'
        : 'bg-white/40 backdrop-blur-2xl border-white/20';

    const menuItems = [
        { to: '/student/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/student/timetable', icon: Calendar, label: 'Timetable' },
        { to: '/student/notes', icon: FileText, label: 'Notes' },
    ];

    return (
        <div className={`w-64 ${sidebarBg} border-r shadow-2xl flex flex-col z-10`}>
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                        <BookOpen className="text-white" size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className={`text-2xl font-bold ${textPrimary}`}>TeachFlow</h1>
                        <p className={`text-xs ${textMuted}`}>Student Portal</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${isActive
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                                    : `${textPrimary} hover:bg-white/10`
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={20} className={`shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                    <span className="font-medium">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {user?.batch && (
                <div className="p-4 border-t border-white/10">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        Your Batch
                    </p>
                    <p className={`text-sm font-medium ${textPrimary}`}>
                        {user.batch.name || user.batch}
                    </p>
                </div>
            )}

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${textPrimary} hover:bg-white/10 transition-all group`}
                >
                    {isDark ? <Sun size={20} className="group-hover:rotate-180 transition-transform duration-500 shrink-0" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform shrink-0" />}
                    <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </div>
    );
}
