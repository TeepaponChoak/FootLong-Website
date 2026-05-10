import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { blogAPI } from '../api';
import type { BlogPost } from '../types';
import { FileText, ArrowRight, Search } from 'lucide-react';

export function BlogList() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const posts = await blogAPI.getPosts();
      setAllPosts(posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const filteredPosts = allPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="empty-state">
        <h3>Loading...</h3>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} style={{ marginBottom: '1rem' }} />
        <h3>No tips yet</h3>
        <p>Be the first to share something with the crew.</p>
        {isAuthenticated && (
          <Link to="/new" className="btn" style={{ marginTop: '1rem' }}>
            Create First Post
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <h2 className="mb-2">Latest Tips & Ideas</h2>
      {filteredPosts.length === 0 && searchQuery && (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <p>No posts found matching "{searchQuery}"</p>
        </div>
      )}
      {filteredPosts.map((post) => (
        <article 
          key={post.id} 
          className="card"
          onClick={() => handleCardClick(post.id)}
        >
          {post.videoUrl && (
            <div style={{ position: 'relative', width: '100%', height: '200px' }}>
              <img
                src={`https://img.youtube.com/vi/${post.videoUrl}/mqdefault.jpg`}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '50px',
                height: '35px',
                background: 'rgba(0,0,0,0.8)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderLeft: '15px solid white',
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  marginLeft: '3px'
                }} />
              </div>
            </div>
          )}
          {!post.videoUrl && post.images && post.images.length > 0 && (
            <img
              src={post.images[0]}
              alt={post.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
            />
          )}
          <div className="card-header">
            <h3>{post.title}</h3>
            <span className="card-meta">
              by {post.author} · {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="card-content">
            {post.content.substring(0, 200)}
            {post.content.length > 200 ? '...' : ''}
          </div>
          <div className="read-more" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Read more <ArrowRight size={14} />
          </div>
          {post.tags.length > 0 && (
            <div className="card-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}