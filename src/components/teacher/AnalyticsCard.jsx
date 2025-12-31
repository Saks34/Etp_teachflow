export default function AnalyticsCard({ title, value, icon, subtitle, trend }) {
    return (
        <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-admin-text-muted font-medium">{title}</p>
                    <p className="text-3xl font-bold text-admin-text mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-admin-text-muted mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xl">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
