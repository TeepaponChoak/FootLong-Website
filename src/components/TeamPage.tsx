import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { UserManagement } from './UserManagement';
import { Users, Crown, User } from 'lucide-react';
import { userManagementAPI } from '../api';

interface TeamMember {
  id: string;
  username: string;
  email: string;
  roles?: string[];
  isAdmin?: boolean;
}

interface ApiUser {
  id: string;
  username: string;
  email: string;
  roles?: string[];
  isAdmin?: boolean;
}

export function TeamPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        // Fetch real user data from API
        const users: ApiUser[] = await userManagementAPI.getAllUsers();
        // Transform to TeamMember format
        const members: TeamMember[] = users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          roles: u.roles || (u.isAdmin ? ['director'] : ['crew']),
          isAdmin: u.isAdmin
        }));
        setTeamMembers(members);
      } catch (error) {
        console.error('Failed to load team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const isAdmin = user?.isAdmin;

  if (loading) {
    return (
      <div className="container">
        <div className="team-page-loading">
          <p>Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="mb-2">
        <h1>
          <Users size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Team
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Meet the crew behind FootLong Website.
        </p>
      </header>

      {/* Crew Management - Admin Only */}
      {isAdmin && (
        <div className="team-management-section">
          <h2 style={{ marginBottom: '1.5rem' }}>
            Crew Management
          </h2>
          <UserManagement />
        </div>
      )}

      {/* Our Team - Visible to everyone */}
      <div className="team-grid-section">
        <h2 style={{ marginTop: isAdmin ? '3rem' : '0', marginBottom: '1.5rem' }}>
          Our Team
        </h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className={`team-member-card ${member.isAdmin ? 'team-member-director' : ''}`}>
              <div className="team-member-avatar">
                {member.isAdmin ? (
                  <Crown size={24} className="director-icon" />
                ) : (
                  <User size={24} className="crew-icon" />
                )}
              </div>
              <div className="team-member-info">
                <h3 className="team-member-name">
                  {member.username}
                  {member.id === user?.id && <span className="current-user-badge">(you)</span>}
                </h3>
                <p className="team-member-email">{member.email}</p>
                <div className="team-member-roles">
                  {member.roles?.map((role) => (
                    <span 
                      key={role} 
                      className={`role-badge ${role === 'director' ? 'role-director' : 'role-crew'}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}