import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentTopBar from './StudentTopBar';

export default function StudentLayout() {
    return (
        <div className="flex h-screen bg-admin-bg">
            <StudentSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <StudentTopBar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
