import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { isDark } = useTheme();

    const bgClass = isDark
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';

    return (
        <div className={`flex h-screen ${bgClass} transition-all duration-500`}>
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-20 left-10 w-72 h-72 ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/30'} rounded-full blur-3xl animate-pulse`}></div>
                <div className={`absolute bottom-20 right-10 w-96 h-96 ${isDark ? 'bg-blue-500/10' : 'bg-blue-300/30'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
                <div className={`absolute top-1/2 left-1/2 w-80 h-80 ${isDark ? 'bg-pink-500/10' : 'bg-pink-300/30'} rounded-full blur-3xl animate-pulse delay-2000`}></div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
