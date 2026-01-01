import { useTheme } from '../../context/ThemeContext';

export default function Table({ columns, data, onAction, emptyMessage = 'No data available' }) {
    const { isDark } = useTheme();

    const cardBg = isDark
        ? 'bg-gray-900 border-white/10'
        : 'bg-white border-admin-border';

    const headerBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
    const rowHoverBg = isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-white/10' : 'border-admin-border';

    if (!data || data.length === 0) {
        return (
            <div className={`card p-8 text-center ${cardBg} border ${borderColor}`}>
                <p className={textSecondary}>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`card overflow-hidden ${cardBg} border ${borderColor}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className={`${headerBg} border-b ${borderColor}`}>
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${textSecondary}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${borderColor}`}>
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx} className={`${rowHoverBg} transition-colors`}>
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}>
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
