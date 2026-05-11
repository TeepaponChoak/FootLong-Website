import { BlogList } from './BlogList';

export function TipsPage() {
  return (
    <div className="container">
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