import { NavLink } from 'react-router-dom';

export default function TeacherSidebar() {
    const navItems = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: '📚' },
        { path: '/teacher/timetable', label: 'Timetable', icon: '📅' },
        { path: '/teacher/notes', label: 'My Notes', icon: '📝' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-admin-sidebar border-r border-admin-border">
            <div className="p-6 border-b border-admin-border">
                <h1 className="text-xl font-bold text-admin-text">ETP TeachFlow</h1>
                <p className="text-sm text-admin-text-muted mt-1">Teacher Panel</p>
            </div>

            <nav className="p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-admin-primary text-white'
                                        : 'text-admin-text hover:bg-gray-100'
                                    }`
                                }
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
