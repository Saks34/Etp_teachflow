import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState('light');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/change-password', { newPassword });
            const { user, accessToken, refreshToken } = data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            login(user);
            toast.success('Password changed successfully!');

            // Route by role
            const role = user?.role;
            if (['SuperAdmin', 'InstitutionAdmin', 'AcademicAdmin', 'Moderator'].includes(role)) {
                navigate('/admin/dashboard');
            } else if (role === 'Teacher') {
                navigate('/teacher/dashboard');
            } else if (role === 'Student') {
                navigate('/student/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to change password';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDark
                ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900'
                : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
            }`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border`}
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform" />
                ) : (
                    <Moon className="w-5 h-5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                )}
            </button>

            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-4 transform hover:scale-110 transition-transform">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Secure Your Account
                    </h1>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Please set a new secure password to continue
                    </p>
                </div>

                {/* Main Card */}
                <div className={`rounded-2xl shadow-2xl p-8 backdrop-blur-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    } border`}>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark
                                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark
                                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={`p-4 rounded-lg border flex items-start gap-3 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="w-1 h-full bg-red-500 rounded-full"></div>
                                <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Change Password
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ensure your new password is strong and unique
                </p>
            </div>
        </div>
    );
}
