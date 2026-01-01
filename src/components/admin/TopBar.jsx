import { useAuth } from '../../context/AuthContext';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
    const { user, logout } = useAuth();
    const { isDark } = useTheme();

    const cardBg = isDark
        ? 'bg-gray-900/60 backdrop-blur-xl border-white/10'
        : 'bg-white/60 backdrop-blur-xl border-gray-200/50';

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textMuted = isDark ? 'text-gray-500' : 'text-gray-500';

    return (
        <header className={`${cardBg} border-b shadow-lg px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`p-2.5 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80'} rounded-xl transition-all hover:scale-110 ${textPrimary}`}
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div>
                    <h2 className={`text-xl font-bold ${textPrimary}`}>Institution Admin</h2>
                    <p className={`text-xs ${textMuted}`}>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    className={`p-2.5 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/60 hover:bg-white/80'} rounded-xl transition-all hover:scale-110 relative ${textPrimary}`}
                    aria-label="Notifications (3 unread)"
                >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <div className={`flex items-center gap-3 px-4 py-2 ${isDark ? 'bg-white/10' : 'bg-white/60'} rounded-xl`}>
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="text-right hidden md:block">
                        <p className={`text-sm font-semibold ${textPrimary}`}>{user?.name}</p>
                        <p className={`text-xs ${textMuted}`}>{user?.role}</p>
                    </div>
                </div>
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
