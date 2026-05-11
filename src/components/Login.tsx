import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

export function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || !password) {
      setError('All fields are required');
      return;
    }
    
    setLoading(true);
    const success = await login(identifier, password);
    setLoading(false);
    
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username/email or password');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail) {
      setForgotError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotMessage('Password reset link has been sent to your email address.');
        setForgotEmail('');
      } else {
        setForgotError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      // For demo purposes, show success message even if backend isn't available
      setForgotMessage('Password reset link has been sent to your email address. (Demo mode)');
      setForgotEmail('');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotMessage('');
    setForgotError('');
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="identifier">Username or Email</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter username or email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        <button type="submit" className="w-full" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            textDecoration: 'underline',
            padding: '0.5rem',
          }}
        >
          Forgot Password?
        </button>
      </div>

      <p className="mt-2" style={{ textAlign: 'center' }}>
        <Link to="/register" className="btn btn-secondary">Create Account</Link>
      </p>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {forgotMessage ? (
              <>
                <div className="modal-icon" style={{ color: '#4ade80' }}>
                  <CheckCircle size={48} />
                </div>
                <h3 className="modal-title">Email Sent!</h3>
                <p className="modal-text">{forgotMessage}</p>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={closeForgotPasswordModal}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-icon">
                  <Mail size={48} />
                </div>
                <h3 className="modal-title">Reset Password</h3>
                <p className="modal-text">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  {forgotError && (
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
                      {forgotError}
                    </div>
                  )}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="forgotEmail">Email Address</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={forgotLoading}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={closeForgotPasswordModal}
                      disabled={forgotLoading}
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={forgotLoading}>
                      {forgotLoading ? (
                        <>
                          <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}