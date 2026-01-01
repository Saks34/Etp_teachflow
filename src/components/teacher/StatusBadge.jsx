import { useTheme } from '../../context/ThemeContext';

export default function StatusBadge({ status }) {
    const { isDark } = useTheme();

    const getStatusStyles = () => {
        switch (status) {
            case 'Live':
                return 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse';
            case 'Scheduled':
                return isDark
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Completed':
                return isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Cancelled':
                return isDark
                    ? 'bg-gray-700 text-gray-400 border border-gray-600'
                    : 'bg-gray-100 text-gray-500 border border-gray-200';
            default:
                return isDark
                    ? 'bg-gray-800 text-gray-300'
                    : 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyles()}`}>
            {status}
        </span>
    );
}
