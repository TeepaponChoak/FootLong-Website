import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { blogAPI, authAPI } from '../api';
import type { BlogPost } from '../types';
import { User, Mail, FileText, Trash2, AlertTriangle, ArrowLeft, Edit, Crown, Lock, Eye, EyeOff } from 'lucide-react';
import { UserManagement } from './UserManagement';

export function Profile() {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = true; // Currently viewing own profile
  
  const [bio, setBio] = useState(user?.bio || '');
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const posts = await blogAPI.getPosts();
      if (user) {
        setUserPosts(posts.filter((p: BlogPost) => p.authorId === user.id));
      }
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Profile not found</h3>
        </div>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile({ bio });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      // First login with current password to verify
      const loginSuccess = await authAPI.login(user.email, currentPassword);
      if (loginSuccess) {
        // Then update the password
        await authAPI.updateProfile({ password: newPassword });
        setPasswordMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMessage('');
        }, 3000);
      }
    } catch (error) {
      setPasswordMessage('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="container">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary mb-2"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="card" style={{ cursor: 'default', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ marginBottom: 0 }}>{user.username}</h1>
              {user.isAdmin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '12px',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.7rem',
                  color: '#fbbf24',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <Crown size={12} /> Director
                </span>
              )}
            </div>
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>{user.email}</p>
          </div>
        </div>

        {user.bio && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ lineHeight: '1.6' }}>{user.bio}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-muted)' }}>
          <span><strong style={{ color: 'var(--color-text-bright)' }}>{userPosts.length}</strong> posts</span>
        </div>
      </div>

      {user.isAdmin && (
        <div style={{ marginBottom: '2rem' }}>
          <UserManagement />
        </div>
      )}

      {isOwnProfile && (
        <>
          <h2 style={{ marginBottom: '1rem' }}>
            <Edit size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Edit Profile
          </h2>

          <div className="card" style={{ cursor: 'default' }}>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="username">
                  <User size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={user.username}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">
                  <FileText size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              {message && (
                <p style={{ color: '#4ade80', marginBottom: '1rem' }}>{message}</p>
              )}

              <div className="form-group">
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                >
                  <Lock size={16} />
                  Change Password
                </button>
              </div>

              <div className="flex-between">
                <button type="submit" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={logout} className="btn-secondary">
                  Logout
                </button>
              </div>
            </form>

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ color: '#f87171', marginBottom: '1rem' }}>Danger Zone</h3>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-delete"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                  <AlertTriangle size={48} />
                </div>
                <h3 className="modal-title">Delete Account?</h3>
                <p className="modal-text">
                  Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.
                </p>
                <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                  <button className="btn-delete" onClick={handleDelete}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPasswordModal && (
            <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
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
                        required
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
                  {passwordMessage && (
                    <p style={{ 
                      color: passwordMessage.includes('success') ? '#4ade80' : '#f87171',
                      fontSize: '0.875rem',
                      marginBottom: '1rem'
                    }}>
                      {passwordMessage}
                    </p>
                  )}
                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" disabled={changingPassword}>
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {loadingPosts ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</p>
      ) : userPosts.length > 0 && (
        <>
          <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Posts by {user.username}</h2>
          {userPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/post/${post.id}`}
              className="card-link"
            >
              <article className="card">
                <div className="card-header">
                  <h3>{post.title}</h3>
                  <span className="card-meta">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="card-content">
                  {post.content.substring(0, 150)}...
                </div>
              </article>
            </Link>
          ))}
        </>
      )}
    </div>
  );
}