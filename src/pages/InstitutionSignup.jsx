import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function InstitutionSignup() {
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState('school');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Backend expects: { name, logo?, admin: { name, email, password } }
      // We include institution type as part of the payload for potential future use; backend will ignore if unsupported.
      const body = {
        name: instName,
        type: instType,
        admin: {
          name: adminName,
          email: adminEmail,
          password,
        },
      };
      await api.post('/institutions/register', body);
      navigate('/login?signup=success');
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '48px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Institution Signup</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Institution name</label>
          <input value={instName} onChange={(e) => setInstName(e.target.value)} placeholder="Your Institution" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Institution type</label>
          <select value={instType} onChange={(e) => setInstType(e.target.value)} style={{ width: '100%' }}>
            <option value="school">School</option>
            <option value="coaching">Coaching</option>
            <option value="college">College</option>
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Admin name</label>
          <input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Admin Name" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Admin email</label>
          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ width: '100%' }}>{loading ? 'Signing up...' : 'Create Institution'}</button>
      </form>
      <p style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
        This will create an InstitutionAdmin account for your institution. Teachers and students do not sign up here.
      </p>
    </div>
  );
}
