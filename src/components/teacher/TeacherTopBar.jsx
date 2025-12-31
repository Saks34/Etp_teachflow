import { useAuth } from '../../context/AuthContext';

export default function TeacherTopBar() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-admin-border flex items-center justify-between px-6">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-admin-text">
                    Teacher Portal
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-admin-text">{user?.name}</p>
                    <p className="text-xs text-admin-text-muted">{user?.role}</p>
                </div>
                <button
                    onClick={logout}
                    className="btn btn-secondary text-sm"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
