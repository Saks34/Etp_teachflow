import { useAuth } from '../../context/AuthContext';

export default function StudentTopBar() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-admin-border px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-admin-text">
                        Welcome, {user?.name || 'Student'}
                    </h2>
                </div>

                <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-admin-text-muted hover:text-admin-text transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
