import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, Loader, Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/verify-reset-token/${token}`);
        const data = await response.json();
        setTokenValid(data.valid);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

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
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="auth-container">
        <h2>Invalid Reset Link</h2>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <XCircle size={48} style={{ color: '#f87171', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem' }}>
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
          <Link to="/login" className="btn">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <h2>Password Reset Successful!</h2>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <CheckCircle size={48} style={{ color: '#4ade80', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem' }}>
            Your password has been successfully reset. Redirecting to login...
          </p>
          <Link to="/login" className="btn btn-secondary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: '#f87171', 
          fontSize: '0.875rem', 
          marginBottom: '1rem',
          background: 'rgba(248, 113, 113, 0.1)',
          padding: '0.5rem',
          borderRadius: '4px'
        }}>
          <XCircle size={14} />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)'
              }}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted)'
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? (
            <>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} />
              Resetting Password...
            </>
          ) : (
            <>
              <Lock size={14} style={{ marginRight: '0.5rem' }} />
              Reset Password
            </>
          )}
        </button>
      </form>
      <p className="mt-2" style={{ textAlign: 'center' }}>
        <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
          Back to Login
        </Link>
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}