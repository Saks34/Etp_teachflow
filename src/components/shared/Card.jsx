export default function Card({ title, value, subtitle, className = '' }) {
    return (
        <div className={`card p-6 ${className}`}>
            <h3 className="text-sm font-medium text-admin-text-muted uppercase tracking-wide">
                {title}
            </h3>
            <p className="text-3xl font-bold text-admin-text mt-2">{value}</p>
            {subtitle && (
                <p className="text-sm text-admin-text-muted mt-1">{subtitle}</p>
            )}
        </div>
    );
}
