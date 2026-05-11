import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Plus, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';

export function Navbar() {
  const { logout, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/tips', label: 'FootLong Tips' },
    { path: '/team', label: 'Team' },
    { path: '/updates', label: 'Updates' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav>
      <div className="nav-content">
        {/* Left Side: Logo */}
        <div className="nav-left">
          <Link to="/" className="logo">FOOTLONG_WEB</Link>
          
          {/* Center Navigation Tabs */}
          <div className="nav-links">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`nav-tab ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              <Link to="/new" className="btn-new-post">
                <Plus size={16} />
                <span>New Post</span>
              </Link>
              <div className="nav-dropdown" ref={dropdownRef}>
                <button 
                  className="nav-dropdown-toggle" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={14} />
                  <span>{user?.username || 'Profile'}</span>
                  <ChevronDown size={12} className={dropdownOpen ? 'open' : ''} />
                </button>
                <div className={`nav-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={14} />
                    <span>Profile</span>
                  </Link>
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className="dropdown-item logout-btn">
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`mobile-nav-tab ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mobile-auth-section">
              {isAuthenticated ? (
                <>
                  <Link to="/new" className="mobile-new-post" onClick={() => setMobileMenuOpen(false)}>
                    <Plus size={16} />
                    <span>New Post</span>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <User size={14} />
                    <span>Profile</span>
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}