import { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    const { isDark } = useTheme();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    const modalBg = isDark ? 'bg-gray-900 border border-white/10' : 'bg-white';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-admin-text-muted';
    const borderColor = isDark ? 'border-white/10' : 'border-admin-border';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`${modalBg} rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{title}</h3>
                    <button
                        onClick={onClose}
                        className={`${textSecondary} hover:${textPrimary} transition-colors`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={`p-6 overflow-y-auto max-h-[calc(90vh-140px)] ${textPrimary}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
