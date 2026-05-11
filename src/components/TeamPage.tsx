import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { UserManagement } from './UserManagement';
import { Users, Crown, User } from 'lucide-react';

interface TeamMember {
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
    // Mock team data - in a real app, this would come from an API
    const mockTeam: TeamMember[] = [
      { id: '1', username: 'Admin User', email: 'admin@footlong.com', roles: ['director', 'admin'], isAdmin: true },
      { id: '2', username: 'Staff Member 1', email: 'staff1@footlong.com', roles: ['crew'] },
      { id: '3', username: 'Staff Member 2', email: 'staff2@footlong.com', roles: ['crew'] },
    ];
    setTeamMembers(mockTeam);
    setLoading(false);
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
          Our Team
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Meet the crew behind FootLong Website.
        </p>
      </header>

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

      {isAdmin && (
        <div className="team-management-section">
          <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>
            Crew Management
          </h2>
          <UserManagement />
        </div>
      )}
    </div>
  );
}