import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { userManagementAPI } from '../api';
import type { User } from '../types';
import { Users, Crown, Check, X, ChevronDown, AlertTriangle } from 'lucide-react';

interface ExtendedUser extends User {
  createdAt: string;
}

// Role abbreviations mapping - Comprehensive list for all production roles
const roleAbbreviations: Record<string, string> = {
  'Director': 'DIR',
  'Assistant Director': 'AD',
  'Second Assistant Director': '2ND AD',
  'Third Assistant Director': '3RD AD',
  'Producer': 'PROD',
  'Executive Producer': 'EP',
  'Line Producer': 'LP',
  'Associate Producer': 'AP',
  'Co-Producer': 'CP',
  'Production Manager': 'PM',
  'Production Coordinator': 'PC',
  'Production Assistant': 'PA',
  'Unit Production Manager': 'UPM',
  'Director of Photography': 'DP',
  'Camera Operator': 'CAM OP',
  'First Assistant Camera': '1ST AC',
  'Second Assistant Camera': '2ND AC',
  'Camera Loader': 'LOADER',
  'Steadicam Operator': 'STEADI',
  'Drone Operator': 'DRONE',
  'Still Photographer': 'STILLS',
  'Gaffer': 'GAF',
  'Best Boy Electric': 'BB ELEC',
  'Lighting Technician': 'LIGHT',
  'Electrician': 'ELEC',
  'Rigging Gaffer': 'RIG GAF',
  'Rigging Electrician': 'RIG ELEC',
  'Key Grip': 'KEY GRIP',
  'Best Boy Grip': 'BB GRIP',
  'Dolly Grip': 'DOLLY',
  'Grip': 'GRIP',
  'Rigging Grip': 'RIG GRIP',
  'Sound Mixer': 'SND',
  'Boom Operator': 'BOOM',
  'Sound Utility': 'SND UT',
  'Playback Operator': 'PLAYBK',
  'Production Designer': 'PD',
  'Art Director': 'ART DIR',
  'Set Decorator': 'SET DEC',
  'Props Master': 'PROPS',
  'Props Assistant': 'PROP ASST',
  'Leadman': 'LEAD',
  'Swing Gang': 'SWING',
  'Set Dresser': 'DRESS',
  'Graphic Designer': 'GRAPH',
  'Storyboard Artist': 'STORY',
  'Concept Artist': 'CONCEPT',
  'Costume Designer': 'COST',
  'Costume Supervisor': 'COST SV',
  'Wardrobe Assistant': 'WARD',
  'Makeup Artist': 'MU',
  'Hair Stylist': 'HAIR',
  'Special Effects Makeup Artist': 'SFX MU',
  'Key Makeup Artist': 'KEY MU',
  'Key Hair Stylist': 'KEY HAIR',
  'Editor': 'EDT',
  'Assistant Editor': 'ASST EDT',
  'Colorist': 'COLOR',
  'Post-Production Supervisor': 'POST SV',
  'Digital Intermediate Editor': 'DI EDT',
  'Conform Editor': 'CONFORM',
  'Visual Effects Supervisor': 'VFX SV',
  'Visual Effects Producer': 'VFX PROD',
  'Visual Effects Coordinator': 'VFX CO',
  'Compositor': 'COMP',
  'Roto Artist': 'ROTO',
  'Matchmove Artist': 'MM',
  'CG Supervisor': 'CG SV',
  '3D Animator': '3D ANIM',
  'Texture Artist': 'TEX',
  'Lighting Artist': 'LGHT ART',
  'Stunt Coordinator': 'STUNT',
  'Stunt Performer': 'STUNT PF',
  'Stunt Double': 'STUNT DB',
  'Fight Choreographer': 'FIGHT',
  'Casting Director': 'CAST',
  'Casting Assistant': 'CAST ASST',
  'Location Manager': 'LOC',
  'Location Scout': 'SCOUT',
  'Location Assistant': 'LOC ASST',
  'Script Supervisor': 'SCRIPT',
  'Script Reader': 'READER',
  'Script Editor': 'SCRIPT ED',
  'Transportation Coordinator': 'TRANS',
  'Driver': 'DRV',
  'Caterer': 'CATER',
  'Craft Service': 'CRAFT',
  'Safety Supervisor': 'SAFETY',
  'Security Guard': 'SEC',
  'Medic': 'MED',
  'Crew Member': 'CREW'
};

// Role categories for grouping in dropdown
const roleCategories: Record<string, string[]> = {
  'Direction & Production': [
    'Director', 'Assistant Director', 'Second Assistant Director', 'Third Assistant Director',
    'Producer', 'Executive Producer', 'Line Producer', 'Associate Producer', 'Co-Producer',
    'Production Manager', 'Production Coordinator', 'Production Assistant', 'Unit Production Manager'
  ],
  'Camera Department': [
    'Director of Photography', 'Camera Operator', 'First Assistant Camera', 'Second Assistant Camera',
    'Camera Loader', 'Steadicam Operator', 'Drone Operator', 'Still Photographer'
  ],
  'Lighting & Electrical': [
    'Gaffer', 'Best Boy Electric', 'Lighting Technician', 'Electrician', 'Rigging Gaffer', 'Rigging Electrician'
  ],
  'Grip Department': [
    'Key Grip', 'Best Boy Grip', 'Dolly Grip', 'Grip', 'Rigging Grip'
  ],
  'Sound Department': [
    'Sound Mixer', 'Boom Operator', 'Sound Utility', 'Playback Operator'
  ],
  'Art Department': [
    'Production Designer', 'Art Director', 'Set Decorator', 'Props Master', 'Props Assistant',
    'Leadman', 'Swing Gang', 'Set Dresser', 'Graphic Designer', 'Storyboard Artist', 'Concept Artist'
  ],
  'Costume & Makeup': [
    'Costume Designer', 'Costume Supervisor', 'Wardrobe Assistant', 'Makeup Artist',
    'Hair Stylist', 'Special Effects Makeup Artist', 'Key Makeup Artist', 'Key Hair Stylist'
  ],
  'Editing & Post-Production': [
    'Editor', 'Assistant Editor', 'Colorist', 'Post-Production Supervisor',
    'Digital Intermediate Editor', 'Conform Editor'
  ],
  'Visual Effects': [
    'Visual Effects Supervisor', 'Visual Effects Producer', 'Visual Effects Coordinator',
    'Compositor', 'Roto Artist', 'Matchmove Artist', 'CG Supervisor', '3D Animator', 'Texture Artist', 'Lighting Artist'
  ],
  'Stunts': [
    'Stunt Coordinator', 'Stunt Performer', 'Stunt Double', 'Fight Choreographer'
  ],
  'Casting': [
    'Casting Director', 'Casting Assistant'
  ],
  'Locations': [
    'Location Manager', 'Location Scout', 'Location Assistant'
  ],
  'Script & Continuity': [
    'Script Supervisor', 'Script Reader', 'Script Editor'
  ],
  'Transportation': [
    'Transportation Coordinator', 'Driver'
  ],
  'Catering & Craft': [
    'Caterer', 'Craft Service'
  ],
  'Safety & Security': [
    'Safety Supervisor', 'Security Guard', 'Medic'
  ],
  'General': [
    'Crew Member'
  ]
};

function getRoleAbbreviation(role: string): string {
  return roleAbbreviations[role] || role.substring(0, 4).toUpperCase();
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  
  // Custom dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ userId: string; role: string } | null>(null);

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
      setOpenDropdown(null);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage('Failed to add role');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const confirmRemoveRole = (userId: string, role: string) => {
    setPendingDelete({ userId, role });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { userId, role } = pendingDelete;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const currentRoles = user.roles || ['Crew Member'];
    if (currentRoles.length <= 1) {
      setMessage('User must have at least one role');
      setShowDeleteConfirm(false);
      setPendingDelete(null);
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    
    try {
      const newRoles = currentRoles.filter(r => r !== role);
      await userManagementAPI.updateUserRoles(userId, newRoles);
      setMessage('Role removed');
      loadUsers();
      setShowDeleteConfirm(false);
      setPendingDelete(null);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage('Failed to remove role');
      setShowDeleteConfirm(false);
      setPendingDelete(null);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDelete(null);
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

  const toggleDropdown = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
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
                    <span 
                      key={role} 
                      className={`role-badge ${isDirector ? 'role-director' : 'role-crew'} ${!isCurrentUser ? 'role-clickable' : ''}`}
                      onClick={() => !isCurrentUser && confirmRemoveRole(user.id, role)}
                      title={!isCurrentUser ? `Click to remove ${role}` : role}
                    >
                      {getRoleAbbreviation(role)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="crew-member-actions">
                {!isCurrentUser && (
                  <div className="custom-dropdown">
                    <button 
                      className="custom-dropdown-toggle"
                      onClick={() => toggleDropdown(user.id)}
                    >
                      <span>+ Add Role</span>
                      <ChevronDown size={14} className={`dropdown-arrow ${openDropdown === user.id ? 'open' : ''}`} />
                    </button>
                    
                    {openDropdown === user.id && unassignedRoles.length > 0 && (
                      <div className="custom-dropdown-menu">
                        {Object.entries(roleCategories).map(([category, roles]) => {
                          const availableInCategory = roles.filter(r => unassignedRoles.includes(r));
                          if (availableInCategory.length === 0) return null;
                          return (
                            <div key={category} className="dropdown-category">
                              <div className="dropdown-category-header">{category}</div>
                              {availableInCategory.map((role) => (
                                <button
                                  key={role}
                                  className="dropdown-item"
                                  onClick={() => addRole(user.id, userRoles, role)}
                                >
                                  <span className="dropdown-item-full">{role}</span>
                                  <span className="dropdown-item-abbr">{getRoleAbbreviation(role)}</span>
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {!isCurrentUser && (
                  isDirector ? (
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
                  )
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
        <div className="legend-item">
          <span style={{ color: 'var(--color-muted)', fontSize: '0.7rem' }}>
            Click role badge to remove
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && pendingDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <AlertTriangle size={48} />
            </div>
            <h3 className="modal-title">Remove Role?</h3>
            <p className="modal-text">
              Are you sure you want to remove the <strong>"{pendingDelete.role}"</strong> role from this user?
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="btn-delete" onClick={handleConfirmDelete}>
                Remove Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}