import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { announcementAPI } from '../api';
import type { Announcement } from '../types';
import { Megaphone, ArrowLeft, ExternalLink, ChevronLeft } from 'lucide-react';

export function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const data = await announcementAPI.getAnnouncements();
        const found = data.find((a: Announcement) => a.id === id);
        if (found) {
          setAnnouncement(found);
        }
      } catch (error) {
        console.error('Failed to load announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, [id]);

  if (loading) {
    return (
      <div className="announcement-detail-page-loading">
        <p>Loading announcement...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="announcement-detail-page">
        <div className="announcement-not-found">
          <Megaphone size={48} style={{ marginBottom: '1rem', color: 'var(--color-muted)' }} />
          <h2>Announcement Not Found</h2>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
            The announcement you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn">
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="announcement-detail-page">
      <div className="announcement-detail-container">
        <button 
          onClick={() => navigate(-1)} 
          className="announcement-back-btn"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <article className="announcement-detail-full">
          <div className="announcement-detail-header">
            <div className="announcement-detail-badge">
              <Megaphone size={16} /> Announcement
            </div>
            <div className="announcement-detail-date">
              {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          {announcement.image && (
            <div className="announcement-detail-image-container">
              <img 
                src={announcement.image} 
                alt={announcement.title}
                className="announcement-detail-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <h1 className="announcement-detail-title">{announcement.title}</h1>

          <div className="announcement-detail-content">
            {announcement.content}
          </div>

          {announcement.link && (
            <a 
              href={announcement.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="announcement-detail-link"
            >
              <ExternalLink size={16} /> Learn More
            </a>
          )}
        </article>
      </div>
    </div>
  );
}