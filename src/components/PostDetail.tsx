import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { blogAPI } from '../api';
import type { BlogPost } from '../types';
import { ArrowLeft, Calendar, User, Trash2, AlertTriangle } from 'lucide-react';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      const data = await blogAPI.getPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      await blogAPI.deletePost(post.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  // Convert URLs into highlighted clickable links
  const renderContentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#60a5fa',
              fontWeight: '700',
              background: 'rgba(96, 165, 250, 0.15)',
              padding: '2px 6px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              margin: '0 2px',
              wordBreak: 'break-word',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'rgba(96, 165, 250, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'rgba(96, 165, 250, 0.15)';
            }}
          >
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Post not found</h3>

          <Link to="/" className="btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary mb-2"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <article className="card" style={{ cursor: 'default' }}>
        <div
          className="card-header"
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}
          >
            {post.title}
          </h1>

          {post.videoUrl && (
            <div
              style={{
                marginBottom: '1rem',
                width: '100%',
              }}
            >
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${post.videoUrl}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  borderRadius: '8px',
                }}
              />
            </div>
          )}

          <div
            className="card-meta"
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <User size={14} />
              {post.author}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Calendar size={14} />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="card-content"
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {renderContentWithLinks(post.content)}
        </div>

        {/* TAGS */}
        {post.tags.length > 0 && (
          <div
            className="card-tags"
            style={{
              marginTop: '2rem',
            }}
          >
            {post.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* IMAGES */}
        {post.images && post.images.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.5rem',
              marginTop: '2rem',
              width: '100%',
            }}
          >
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${post.title} ${index + 1}`}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ))}
          </div>
        )}

        {/* DELETE BUTTON */}
        {user && user.id === post.authorId && (
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => setShowConfirm(true)}
              className="btn-delete"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Trash2 size={16} />
              Delete Post
            </button>
          </div>
        )}
      </article>

      {/* DELETE MODAL */}
      {showConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              <AlertTriangle size={48} />
            </div>

            <h3 className="modal-title">
              Delete Post?
            </h3>

            <p className="modal-text">
              Are you sure you want to delete this
              post? This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn-delete"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}