import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { userManagementAPI } from '../api';
import type { User } from '../types';
import { Users, Clapperboard, Star, User as UserIcon, Check, X, Crown } from 'lucide-react';

interface ExtendedUser extends User {
  createdAt: string;
}

const productionRoles = [
  'Director', 'Producer', 'Editor', 'Gaffer', 
  'Grip', 'Sound Mixer', 'Camera Operator', 'Script Supervisor',
  'Production Designer', 'Costume Designer', 'Makeup Artist', 'Stunt Coordinator',
  'Visual Effects', 'Colorist', 'Casting Director', 'Location Manager', 'Crew Member'
];

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(productionRoles);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
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

  const loadRoles = async () => {
    try {
      const roles = await userManagementAPI.getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const toggleUserRole = async (userId: string, currentRoles: string[], roleToToggle: string) => {
    try {
      let newRoles = [...currentRoles];
      if (newRoles.includes(roleToToggle)) {
        // Don't allow removing the last role
        if (newRoles.length <= 1) {
          setMessage('User must have at least one role');
          setTimeout(() => setMessage(null), 3000);
          return;
        }
        newRoles = newRoles.filter(r => r !== roleToToggle);
      } else {
        // Remove 'Crew Member' if adding another role
        if (roleToToggle !== 'Crew Member') {
          newRoles = newRoles.filter(r => r !== 'Crew Member');
        }
        newRoles.push(roleToToggle);
      }
      await userManagementAPI.updateUserRoles(userId, newRoles);
      setMessage(`Roles updated`);
      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update roles:', error);
      setMessage('Failed to update roles');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const newRoles = currentIsAdmin ? ['Crew Member'] : ['Director'];
      await userManagementAPI.updateUserRoles(userId, newRoles, !currentIsAdmin);
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
          <div className={`user-management-message ${message.includes('revoked') || message.includes('Failed') ? 'warning' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="crew-list">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isDirector = user.isAdmin;
          const userRoles = user.roles || ['Crew Member'];

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
                <div className="crew-member-roles">
                  {userRoles.map((role) => (
                    <span key={role} className={`role-badge ${isDirector ? 'role-director' : 'role-crew'}`}>
                      {isDirector ? <Star size={12} /> : <Users size={12} />} {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="crew-member-actions">
                <div className="role-dropdown">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleUserRole(user.id, userRoles, e.target.value);
                      }
                    }}
                    className="role-select-multi"
                    disabled={isCurrentUser && isDirector}
                  >
                    <option value="">Select roles...</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role} disabled={userRoles.includes(role)}>
                        {role} {userRoles.includes(role) ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="selected-roles">
                    {userRoles.map((role) => (
                      <span key={role} className="selected-role-tag">
                        {role}
                        {!isCurrentUser && (
                          <button
                            onClick={() => toggleUserRole(user.id, userRoles, role)}
                            className="remove-role-btn"
                            title={`Remove ${role}`}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                {!isCurrentUser && (
                  isDirector ? (
                    <button
                      onClick={() => toggleAdminRole(user.id, true)}
                      className="btn-role btn-role-revoke"
                      title="Revoke Director role"
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
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="crew-legend">
        <div className="legend-item">
          <Crown size={14} className="legend-director" />
          <span>Admin</span>
        </div>
        <div className="legend-item">
          <UserIcon size={14} className="legend-crew" />
          <span>User</span>
        </div>
      </div>
    </div>
  );
}