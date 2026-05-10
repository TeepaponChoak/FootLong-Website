import { BlogList } from './BlogList';
import { AnnouncementPanel } from './AnnouncementPanel';

export function Home() {
  return (
    <div className="container">
      <section className="mb-2">
        <h2>FootLong Announce</h2>
        <AnnouncementPanel />
      </section>
      <header className="mb-2">
        <h1>FootLong Tips</h1>
        <p style={{ color: 'var(--color-muted)' }}>
          Tips and ideas from across the universe.
        </p>
      </header>
      <BlogList />
    </div>
  );
}
