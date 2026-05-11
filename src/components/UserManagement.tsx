import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { userManagementAPI } from '../api';
import type { User } from '../types';
import { Users, Crown, Check, X } from 'lucide-react';

interface ExtendedUser extends User {
  createdAt: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
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
      setMessage('Failed to load users');
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

  const addRole = async (userId: string, currentRoles: string[], role: string) => {
    if (currentRoles.includes(role)) return;
    try {
      let newRoles = [...currentRoles];
      if (role !== 'Crew Member') {
        newRoles = newRoles.filter(r => r !== 'Crew Member');
      }
      newRoles.push(role);
      await userManagementAPI.updateUserRoles(userId, newRoles);
      setMessage('Role added');
      loadUsers();
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage('Failed to add role');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const removeRole = async (userId: string, currentRoles: string[], role: string) => {
    if (currentRoles.length <= 1) {
      setMessage('User must have at least one role');
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    try {
      const newRoles = currentRoles.filter(r => r !== role);
      await userManagementAPI.updateUserRoles(userId, newRoles);
      setMessage('Role removed');
      loadUsers();
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage('Failed to remove role');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const newRoles = currentIsAdmin ? ['Crew Member'] : ['Director'];
      await userManagementAPI.updateUserRoles(userId, newRoles, !currentIsAdmin);
      setMessage(currentIsAdmin ? 'Admin revoked' : 'Admin granted');
      loadUsers();
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage('Failed to update');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="user-management"><p>Loading users...</p></div>;

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h3><Users size={18} /> User Management</h3>
        {message && (
          <div className={`user-management-message ${message.includes('Failed') ? 'warning' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="crew-list">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isDirector = user.isAdmin;
          const userRoles = user.roles || ['Crew Member'];
          const unassignedRoles = availableRoles.filter(r => !userRoles.includes(r));

          return (
            <div 
              key={user.id} 
              className={`crew-member ${isDirector ? 'crew-director' : ''} ${isCurrentUser ? 'crew-current' : ''}`}
            >
              <div className="crew-member-avatar">
                {isDirector ? <Crown size={20} className="director-icon" /> : <Users size={18} className="crew-icon" />}
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
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="crew-member-actions">
                {!isCurrentUser && (
                  <>
                    {unassignedRoles.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) addRole(user.id, userRoles, e.target.value);
                        }}
                        className="role-select"
                      >
                        <option value="">+ Add role</option>
                        {unassignedRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    )}
                    {userRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => removeRole(user.id, userRoles, role)}
                        className="btn-role btn-role-revoke"
                        title={`Remove ${role}`}
                      >
                        × {role}
                      </button>
                    ))}
                    {isDirector ? (
                      <button
                        onClick={() => toggleAdmin(user.id, true)}
                        className="btn-role btn-role-revoke"
                      >
                        <X size={14} /> Revoke Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleAdmin(user.id, false)}
                        className="btn-role btn-role-promote"
                      >
                        <Check size={14} /> Make Admin
                      </button>
                    )}
                  </>
                )}
                {isCurrentUser && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
                    Your account
                  </span>
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
          <Users size={14} className="legend-crew" />
          <span>User</span>
        </div>
      </div>
    </div>
  );
}