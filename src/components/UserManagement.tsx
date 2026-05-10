import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { userManagementAPI } from '../api';
import type { User } from '../types';
import { Users, Clapperboard, Star, User as UserIcon, Check, X, Crown } from 'lucide-react';

interface ExtendedUser extends User {
  createdAt: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userManagementAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage('Failed to load cast & crew');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    try {
      await userManagementAPI.updateUserRole(userId, !currentIsAdmin);
      setMessage(currentIsAdmin ? 'Role revoked - Now Crew Member' : 'Role granted - Now Director');
      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update role:', error);
      setMessage('Failed to update role');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="user-management-loading">
        <p>Loading cast & crew...</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3>
          <Clapperboard size={18} /> Cast & Crew Management
        </h3>
        {message && (
          <div className={`user-management-message ${message.includes('revoked') ? 'warning' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="crew-list">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isDirector = user.isAdmin;

          return (
            <div 
              key={user.id} 
              className={`crew-member ${isDirector ? 'crew-director' : ''} ${isCurrentUser ? 'crew-current' : ''}`}
            >
              <div className="crew-member-avatar">
                {isDirector ? (
                  <Crown size={20} className="director-icon" />
                ) : (
                  <UserIcon size={18} className="crew-icon" />
                )}
              </div>

              <div className="crew-member-info">
                <div className="crew-member-name">
                  {user.username}
                  {isCurrentUser && <span className="current-user-badge">(You)</span>}
                </div>
                <div className="crew-member-email">{user.email}</div>
                <div className="crew-member-role">
                  {isDirector ? (
                    <span className="role-badge role-director">
                      <Star size={12} /> Director
                    </span>
                  ) : (
                    <span className="role-badge role-crew">
                      <Users size={12} /> Crew Member
                    </span>
                  )}
                </div>
              </div>

              <div className="crew-member-actions">
                {isDirector ? (
                  <button
                    onClick={() => toggleAdminRole(user.id, true)}
                    className="btn-role btn-role-revoke"
                    title="Revoke Director role"
                    disabled={isCurrentUser}
                  >
                    <X size={14} /> Revoke
                  </button>
                ) : (
                  <button
                    onClick={() => toggleAdminRole(user.id, false)}
                    className="btn-role btn-role-promote"
                    title="Grant Director role"
                  >
                    <Check size={14} /> Promote
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="crew-legend">
        <div className="legend-item">
          <Crown size={14} className="legend-director" />
          <span>Director (Admin)</span>
        </div>
        <div className="legend-item">
          <UserIcon size={14} className="legend-crew" />
          <span>Crew Member (User)</span>
        </div>
      </div>
    </div>
  );
}