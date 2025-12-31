import { Outlet } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import TeacherTopBar from './TeacherTopBar';

export default function TeacherLayout() {
    return (
        <div className="min-h-screen bg-admin-bg">
            <TeacherSidebar />

            <div className="ml-64">
                <TeacherTopBar />

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
