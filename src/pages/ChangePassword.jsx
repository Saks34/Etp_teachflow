import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
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
            login(user);

            // Route by role
            const role = user?.role;
            if (role === 'Teacher') navigate('/teacher');
            else if (role === 'Student') navigate('/student');
            else navigate('/admin');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: '64px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2>Change Password</h2>
            <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
                You must change your password before continuing
            </p>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <label>New Password</label>
                    <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        style={{ width: '100%' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Confirm Password</label>
                    <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        style={{ width: '100%' }}
                        required
                    />
                </div>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <button disabled={loading} type="submit" style={{ width: '100%' }}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
}
