import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'success') {
      setSuccess('Institution created successfully. Please log in with your admin account.');
    }
    if (params.get('session') === 'expired') {
      setError('Your session has expired. Please log in again.');
    }
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // Handle password change requirement
      if (data.mustChangePassword) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/change-password');
        return;
      }

      const { user, accessToken, refreshToken } = data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      login(user);
      // Route to home which will redirect based on role
      navigate('/home');
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '64px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Sign in</h2>
      {success && <div style={{ background: '#e8f5e9', color: '#1b5e20', padding: 8, borderRadius: 4, marginBottom: 12 }}>{success}</div>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ width: '100%' }}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <p style={{ color: '#666', fontSize: 14 }}>
          Don't have an institution account?{' '}
          <Link to="/institution/signup" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 500 }}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
