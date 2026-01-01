import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsCard({ title, value, icon, subtitle, trend }) {
    const { isDark } = useTheme();

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    const bgClass = isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-200/50';

    return (
        <div className={`p-6 rounded-2xl border ${bgClass} shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className={`text-sm ${textSecondary} font-medium`}>{title}</p>
                    <p className={`text-3xl font-bold ${textPrimary} mt-2`}>{value}</p>
                    {subtitle && (
                        <p className={`text-xs ${textSecondary} mt-1`}>{subtitle}</p>
                    )}
                    {trend && (
                        <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
