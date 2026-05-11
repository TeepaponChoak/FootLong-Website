import { Link } from 'react-router-dom';
import { Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-secondary mb-2"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="not-found-page">
        <div className="not-found-animation">
          <div className="not-found-404">404</div>
          <div className="not-found-icon">
            <AlertTriangle size={64} />
          </div>
        </div>

        <h1 className="not-found-title">Page Not Found</h1>
        
        <p className="not-found-subtitle">
          Oops! The page you're looking for seems to have drifted into deep space.
        </p>

        <div className="not-found-suggestions">
          <p>Here are some things you can try:</p>
          <ul>
            <li>Check the URL for typos</li>
            <li>Return to the <Link to="/">homepage</Link></li>
            <li>Use the search bar to find what you need</li>
            <li>Browse our <Link to="/blog">Tips & Ideas</Link> section</li>
          </ul>
        </div>

        <div className="not-found-actions">
          <Link to="/" className="btn">
            <Home size={16} style={{ marginRight: '0.5rem' }} />
            Go Home
          </Link>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${e.currentTarget.value}`);
                }
              }}
            />
          </div>
        </div>

        <div className="not-found-quote">
          <p>"In the vastness of the web, even stars sometimes go supernova."</p>
          <span>— FootLong Web</span>
        </div>
      </div>
    </div>
  );
}