import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentTopBar from './StudentTopBar';
import { useTheme } from '../../context/ThemeContext';

export default function StudentLayout() {
    const { isDark } = useTheme();

    return (
        <div className={`flex h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-[#f8fafc]'} transition-all duration-500 overflow-hidden`}>
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] ${isDark ? 'bg-blue-600/15' : 'bg-blue-400/20'} rounded-full blur-[100px] animate-pulse`}></div>
                <div className={`absolute top-1/3 right-0 w-[400px] h-[400px] ${isDark ? 'bg-violet-600/10' : 'bg-violet-400/20'} rounded-full blur-[80px] animate-pulse`} style={{ animationDelay: '1s' }}></div>
                <div className={`absolute -bottom-40 left-1/3 w-[500px] h-[500px] ${isDark ? 'bg-cyan-600/10' : 'bg-cyan-400/15'} rounded-full blur-[100px] animate-pulse`} style={{ animationDelay: '2s' }}></div>
            </div>

            <StudentSidebar />

            <div className="flex-1 flex flex-col overflow-hidden relative z-10 pl-64">
                <StudentTopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
