import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Sun, Moon, GraduationCap, Building2, User, Mail, Lock, ArrowRight, School, BookOpen, Briefcase } from 'lucide-react';

export default function InstitutionSignup() {
  const navigate = useNavigate();
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState('school');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

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
    if (!instName || !adminName || !adminEmail || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.post('/institutions/register', {
        name: instName,
        type: instType,
        admin: {
          name: adminName,
          email: adminEmail,
          password: password
        }
      });
      toast.success('Institution created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create institution';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  const institutionTypes = [
    { value: 'school', label: 'School', icon: School },
    { value: 'coaching', label: 'Coaching Center', icon: BookOpen },
    { value: 'college', label: 'College/University', icon: Briefcase },
  ];

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

      <div className="w-full max-w-2xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-4 transform hover:scale-110 transition-transform">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Your Institution
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Set up your institution and admin account in minutes
          </p>
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl shadow-2xl p-8 backdrop-blur-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          } border`}>

          <div className="space-y-6">
            {/* Institution Details Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                <Building2 className="w-5 h-5 text-indigo-600" />
                Institution Details
              </h3>

              <div className="space-y-4">
                {/* Institution Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Institution Name *
                  </label>
                  <input
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="e.g., Springfield High School"
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                      }`}
                  />
                </div>

                {/* Institution Type */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Institution Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {institutionTypes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setInstType(value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${instType === value
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : isDark
                              ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${instType === value
                            ? 'text-indigo-600'
                            : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        <span className={`text-sm font-medium ${instType === value
                            ? 'text-indigo-600'
                            : isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Admin Account Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'
                }`}>
                <User className="w-5 h-5 text-indigo-600" />
                Admin Account
              </h3>

              <div className="space-y-4">
                {/* Admin Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Admin Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                    />
                  </div>
                </div>

                {/* Admin Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Admin Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      type="email"
                      placeholder="admin@example.com"
                      required
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

            {/* Info Box */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                💡 This will create an <strong>Institution Admin</strong> account for your institution.
                Teachers and students will be added separately after setup.
              </p>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              onClick={handleSubmit}
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Institution...
                </>
              ) : (
                <>
                  Create Institution
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className={`font-semibold inline-flex items-center gap-1 group transition-colors ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
                }`}
            >
              Sign in here
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
