export default function EmptyState({ message, action, actionLabel }) {
    return (
        <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
                {message || 'No items found'}
            </h3>
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="btn btn-primary mt-4"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
