import { FileText, Bug, Rocket, Wrench } from 'lucide-react';

interface Update {
  id: string;
  type: 'feature' | 'bugfix' | 'changelog' | 'devlog';
  title: string;
  description: string;
  date: string;
  version?: string;
}

export function UpdatesPage() {
  const updates: Update[] = [
    {
      id: '1',
      type: 'feature',
      title: 'Announcement System Redesigned',
      description: 'The announcement panel now features a clean card-based layout with truncated content and "Read more" links that navigate to full announcement pages. Thai font support has been added with the Prompt font family.',
      date: '2026-05-11',
      version: 'v2.1.0'
    },
    {
      id: '2',
      type: 'changelog',
      title: 'Navigation Restructured',
      description: 'The navbar has been redesigned with separate tabs for Home, FootLong Tips, Team, and Updates. Logo is now positioned on the left with navigation tabs on the right.',
      date: '2026-05-11',
      version: 'v2.1.0'
    },
    {
      id: '3',
      type: 'bugfix',
      title: 'Fixed Content Truncation',
      description: 'Resolved issues with announcement content not properly truncating at 300 characters. Added inline "Read more" links for better UX.',
      date: '2026-05-10',
      version: 'v2.0.5'
    },
    {
      id: '4',
      type: 'devlog',
      title: 'Galaxy Theme Enhancements',
      description: 'Enhanced the animated galaxy background with improved star field rendering and radial gradients. Added smooth transitions and hover effects throughout the UI.',
      date: '2026-05-09',
      version: 'v2.0.4'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Rocket size={16} />;
      case 'bugfix':
        return <Bug size={16} />;
      case 'changelog':
        return <FileText size={16} />;
      case 'devlog':
        return <Wrench size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'Feature';
      case 'bugfix':
        return 'Bug Fix';
      case 'changelog':
        return 'Changelog';
      case 'devlog':
        return 'Dev Log';
      default:
        return 'Update';
    }
  };

  return (
    <div className="container">
      <header className="mb-2">
        <h1>
          <FileText size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Updates & Changelogs
        </h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Stay up to date with the latest features, bug fixes, and development progress.
        </p>
      </header>

      <div className="updates-list">
        {updates.map((update) => (
          <article key={update.id} className="update-card">
            <div className="update-header">
              <div className="update-type-badge">
                {getTypeIcon(update.type)}
                <span>{getTypeLabel(update.type)}</span>
              </div>
              {update.version && (
                <span className="update-version">{update.version}</span>
              )}
            </div>
            <h3 className="update-title">{update.title}</h3>
            <p className="update-description">{update.description}</p>
            <div className="update-meta">
              <span className="update-date">
                {new Date(update.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}