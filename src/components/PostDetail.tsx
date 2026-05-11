import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { blogAPI } from '../api';
import type { BlogPost } from '../types';
import { ArrowLeft, Calendar, User, Trash2, AlertTriangle, Star, Users, ZoomIn, Eye } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
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
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <User size={14} />
              <strong>{post.author}</strong>
              {post.authorRoles && post.authorRoles.length > 0 && (
                <span style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {post.authorRoles.map((role) => (
                    <span
                      key={role}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        background: role === 'Director' || post.authorRoles?.includes('Director')
                          ? 'rgba(234, 179, 8, 0.15)'
                          : 'rgba(168, 85, 247, 0.15)',
                        border: `1px solid ${role === 'Director' || post.authorRoles?.includes('Director')
                          ? 'rgba(234, 179, 8, 0.3)'
                          : 'rgba(168, 85, 247, 0.3)'}`,
                        borderRadius: '12px',
                        color: role === 'Director' || post.authorRoles?.includes('Director')
                          ? '#fbbf24'
                          : 'var(--color-accent)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {role === 'Director' ? <Star size={10} /> : <Users size={10} />}
                      {role}
                    </span>
                  ))}
                </span>
              )}
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
              marginTop: '2rem',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: 'var(--color-accent)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <Eye size={16} />
              Images ({post.images.length})
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  post.images.length === 1
                    ? '1fr'
                    : post.images.length === 2
                    ? 'repeat(2, 1fr)'
                    : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                width: '100%',
              }}
            >
              {post.images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => openLightbox(index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(168, 85, 247, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <img
                      src={img}
                      alt={`${post.title} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: (post.images?.length ?? 0) === 1 ? 'auto' : '250px',
                        objectFit: (post.images?.length ?? 0) === 1 ? 'contain' : 'cover',
                        borderRadius: '8px',
                        display: 'block',
                        transition: 'transform 0.3s ease',
                      }}
                    />

                    {/* Hover Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: '8px',
                      }}
                    />

                    {/* Zoom Icon on Hover */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(168, 85, 247, 0.9)',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease, transform 0.3s ease',
                        zIndex: 1,
                      }}
                    >
                      <ZoomIn size={22} color="white" />
                    </div>

                    {/* Image Counter Badge */}
                    {(post.images?.length ?? 0) > 1 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          zIndex: 1,
                        }}
                      >
                        {index + 1} / {post.images?.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hint Text */}
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--color-muted)',
                marginTop: '0.75rem',
                textAlign: 'center',
              }}
            >
              Click on an image to inspect • Use arrow keys to navigate • Scroll to zoom
            </p>
          </div>
        )}

        {/* Image Lightbox */}
        {post.images && post.images.length > 0 && (
          <ImageLightbox
            images={post.images}
            initialIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={closeLightbox}
          />
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