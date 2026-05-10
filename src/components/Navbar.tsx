import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Plus, LogOut, User } from 'lucide-react';

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <nav>
      <div className="nav-content">
        <Link to="/" className="logo">FOOTLONG_TIPS</Link>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <Link to="/new">
                <Plus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                New Post
              </Link>
              <Link to="/profile">
                <User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Profile
              </Link>
              <button onClick={logout}>
                <LogOut size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
