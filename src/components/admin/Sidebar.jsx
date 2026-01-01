import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ sidebarOpen }) {
    const { isDark, toggleTheme } = useTheme();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';
    const sidebarBg = isDark
        ? 'bg-gray-900/50 backdrop-blur-2xl border-white/10'
        : 'bg-white/40 backdrop-blur-2xl border-white/20';

    const menuItems = [
        { id: 'dashboard', path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'teachers', path: '/admin/teachers', icon: Users, label: 'Teachers' },
        { id: 'students', path: '/admin/students', icon: GraduationCap, label: 'Students' },
        { id: 'batches', path: '/admin/batches', icon: BookOpen, label: 'Batches' },
        { id: 'timetable', path: '/admin/timetable', icon: Calendar, label: 'Timetable' },
        { id: 'notifications', path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ];

    return (
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ${sidebarBg} border-r shadow-2xl flex flex-col overflow-hidden relative z-10`}>
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                        <BookOpen className="text-white" size={20} />
                    </div>
                    <div className="whitespace-nowrap overflow-hidden">
                        <h1 className={`text-2xl font-bold ${textPrimary}`}>TeachFlow</h1>
                        <p className={`text-xs ${textMuted}`}>Education Platform</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group whitespace-nowrap ${isActive
                                ? `bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/50`
                                : `${textPrimary} hover:bg-white/10`
                                }`}
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

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${textPrimary} hover:bg-white/10 transition-all group whitespace-nowrap`}
                >
                    {isDark ? <Sun size={20} className="group-hover:rotate-180 transition-transform duration-500 shrink-0" /> : <Moon size={20} className="group-hover:-rotate-12 transition-transform shrink-0" />}
                    <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </aside>
    );
}
