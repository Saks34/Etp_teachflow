import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Bell } from 'lucide-react';

export default function TeacherTopBar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const cardBg = isDark
        ? 'bg-white/5 backdrop-blur-xl border-white/10'
        : 'bg-white/70 backdrop-blur-xl border-white/50';

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';

    return (
        <header className={`h-16 ${cardBg} border-b shadow-lg flex items-center justify-between px-6`}>
            <div>
                <h2 className={`text-xl font-bold ${textPrimary}`}>
                    Teacher Portal
                </h2>
                <p className={`text-xs ${textMuted}`}>Welcome back, {user?.name?.split(' ')[0] || 'Teacher'} 👋</p>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`p-2.5 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80'} rounded-xl transition-all hover:scale-110 ${textPrimary}`}
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button
                    className={`p-2.5 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80'} rounded-xl transition-all hover:scale-110 relative ${textPrimary}`}
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* User Info */}
                <div className={`flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-white/10' : 'bg-white/60'} rounded-xl`}>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.substring(0, 2).toUpperCase() || 'TE'}
                    </div>
                    <div className="text-right hidden md:block">
                        <p className={`text-sm font-semibold ${textPrimary}`}>{user?.name}</p>
                        <p className={`text-xs ${textMuted}`}>Teacher</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'} rounded-xl transition-all hover:scale-105`}
                >
                    <LogOut size={18} />
                    <span className="font-medium hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
