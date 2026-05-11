import { AnnouncementPanel } from './AnnouncementPanel';

export function Home() {
  return (
    <div className="container">
      <header className="mb-2">
        <h1>FootLong Announce</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Official announcements and updates from the production team.
        </p>
      </header>
      <AnnouncementPanel />
    </div>
  );
}