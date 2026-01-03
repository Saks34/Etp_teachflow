import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Bell, Shield } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ sidebarOpen }) {
    const { isDark } = useTheme();

    const menuItems = [
        { id: 'dashboard', path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-blue-500 to-cyan-500' },
        { id: 'teachers', path: '/admin/teachers', icon: Users, label: 'Teachers', gradient: 'from-emerald-500 to-teal-500' },
        { id: 'moderators', path: '/admin/moderators', icon: Shield, label: 'Moderators', gradient: 'from-amber-500 to-orange-500' },
        { id: 'students', path: '/admin/students', icon: GraduationCap, label: 'Students', gradient: 'from-violet-500 to-purple-500' },
        { id: 'batches', path: '/admin/batches', icon: BookOpen, label: 'Batches', gradient: 'from-rose-500 to-pink-500' },
        { id: 'timetable', path: '/admin/timetable', icon: Calendar, label: 'Timetable', gradient: 'from-indigo-500 to-blue-500' },
        { id: 'notifications', path: '/admin/notifications', icon: Bell, label: 'Notifications', gradient: 'from-cyan-500 to-sky-500' },
    ];

    return (
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ${isDark ? 'bg-[#111118]/80' : 'bg-white/70'} backdrop-blur-xl border-r ${isDark ? 'border-white/5' : 'border-gray-200/50'} flex flex-col overflow-hidden relative z-20`}>
            {/* Logo */}
            <div className={`p-5 border-b ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-cyan-600 flex items-center justify-center shadow-lg">
                        <BookOpen className="text-white" size={18} />
                    </div>
                    <div className="whitespace-nowrap overflow-hidden">
                        <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>TeachFlow</h1>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Management
                </p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${isActive
                                    ? ''
                                    : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'}`
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <>
                                            <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl opacity-10`}></div>
                                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b ${item.gradient} rounded-r-full`}></div>
                                        </>
                                    )}
                                    <div className={`relative p-2 rounded-lg transition-all ${isActive
                                        ? `bg-gradient-to-br ${item.gradient} shadow-md`
                                        : `${isDark ? 'bg-white/5' : 'bg-gray-100'}`
                                        }`}>
                                        <Icon size={16} className={isActive ? 'text-white' : ''} />
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? (isDark ? 'text-white' : 'text-gray-900') : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}
