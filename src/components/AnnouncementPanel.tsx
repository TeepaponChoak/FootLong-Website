import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { announcementAPI } from '../api';
import type { Announcement } from '../types';
import { Megaphone, Edit2, Trash2, Plus, X, Save, ExternalLink, Image as ImageIcon, Clapperboard, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export function AnnouncementPanel() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editLink, setEditLink] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementAPI.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsNew(true);
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditImage('');
    setEditLink('');
    setIsEditing(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setIsNew(false);
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditImage(announcement.image || '');
    setEditLink(announcement.link || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      if (isNew) {
        await announcementAPI.createAnnouncement({ 
          title: editTitle, 
          content: editContent,
          image: editImage || undefined,
          link: editLink || undefined
        });
      } else {
        await announcementAPI.updateAnnouncement(editingId!, { 
          title: editTitle, 
          content: editContent,
          image: editImage || undefined,
          link: editLink || undefined
        });
      }
      setIsEditing(false);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await announcementAPI.deleteAnnouncement(deleteTargetId);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedAnnouncement(expandedAnnouncement === id ? null : id);
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditImage('');
    setEditLink('');
  };

  if (loading) {
    return (
      <div className="announcement-panel-loading">
        <p>Loading announcements...</p>
      </div>
    );
  }

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;
  // Get history and reverse so older announcements are at the bottom
  const announcementHistory = announcements.length > 1 ? [...announcements.slice(1)].reverse() : [];
  const hasSidebar = announcementHistory.length > 0;

  return (
    <div className="announcement-panel">
      {isAdmin && isEditing && (
        <div className="announcement-editor">
          <div className="editor-header">
            <h3><Clapperboard size={18} /> {isNew ? 'New Announcement' : 'Edit Announcement'}</h3>
            <button onClick={handleCancel} className="btn-icon">
              <X size={18} />
            </button>
          </div>
          <div className="form-group">
            <label><Clapperboard size={14} /> Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Announcement title"
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your announcement..."
              rows={8}
            />
          </div>
          <div className="form-group">
            <label><ImageIcon size={14} /> Image URL</label>
            <input
              type="text"
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group">
            <label><ExternalLink size={14} /> Link URL</label>
            <input
              type="text"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="https://example.com/more-info"
            />
          </div>
          <div className="editor-actions">
            <button onClick={handleCancel} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn">
              <Save size={14} style={{ marginRight: '4px' }} /> Save
            </button>
          </div>
        </div>
      )}

      {isAdmin && !isEditing && (
        <button onClick={handleCreate} className="btn btn-new-announcement">
          <Plus size={16} style={{ marginRight: '4px' }} /> New Announcement
        </button>
      )}

      {announcements.length === 0 && !isEditing && (
        <div className="empty-state" style={{ padding: '3rem', marginTop: '1rem' }}>
          <Megaphone size={48} style={{ marginBottom: '1rem', color: 'var(--color-muted)' }} />
          <h3>No announcements yet</h3>
          <p style={{ color: 'var(--color-muted)' }}>Stay tuned for updates from the production team.</p>
        </div>
      )}

      {latestAnnouncement && !isEditing && (
        <div className={`announcement-layout ${hasSidebar ? '' : 'announcement-layout--no-sidebar'}`}>
          {/* History Sidebar - Left Side */}
          {announcementHistory.length > 0 && (
            <aside className="announcement-history-sidebar">
              <h3 className="history-sidebar-title">
                <Clapperboard size={16} /> Previous Announcements
              </h3>
              <div className="history-sidebar-list">
                {announcementHistory.map((ann) => {
                  const isExpanded = expandedAnnouncement === ann.id;
                  return (
                    <div key={ann.id} className={`history-sidebar-item ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="history-sidebar-item-header" 
                        onClick={() => toggleExpand(ann.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h4>{ann.title}</h4>
                        <span className="history-sidebar-toggle">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                      <span className="history-sidebar-date">
                        {new Date(ann.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {isExpanded && (
                        <div className="history-sidebar-item-content">
                          <p className="history-sidebar-item-text">{ann.content}</p>
                          {ann.image && (
                            <img 
                              src={ann.image} 
                              alt={ann.title}
                              className="history-sidebar-item-image"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          {ann.link && (
                            <a 
                              href={ann.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="history-sidebar-item-link"
                            >
                              <ExternalLink size={12} /> Learn More
                            </a>
                          )}
                        </div>
                      )}
                      {isAdmin && (
                        <div className="history-sidebar-item-actions">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(ann); }} 
                            className="btn-icon-small" 
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(ann.id); }} 
                            className="btn-icon-small btn-icon-delete" 
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Main Announcement - Right Side */}
          <div className="announcement-main">
            <article className="announcement-card">
              <div className="announcement-badge">
                <Megaphone size={14} /> Latest Announcement
              </div>
              
              {latestAnnouncement.image && (
                <div className="announcement-image-container">
                  <img 
                    src={latestAnnouncement.image} 
                    alt={latestAnnouncement.title}
                    className="announcement-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <h2 className="announcement-title">{latestAnnouncement.title}</h2>
              <div className="announcement-content">
                {latestAnnouncement.content.length > 300 ? (
                  <>
                    {truncateContent(latestAnnouncement.content)}{' '}
                    <Link to={`/announcement/${latestAnnouncement.id}`} className="announcement-read-more-inline">
                      Read more
                    </Link>
                  </>
                ) : (
                  latestAnnouncement.content
                )}
              </div>
              
              {latestAnnouncement.link && (
                <a 
                  href={latestAnnouncement.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="announcement-link"
                >
                  <ExternalLink size={14} /> Learn More
                </a>
              )}
              
              <div className="announcement-meta">
                <span className="announcement-date">
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {isAdmin && (
                  <div className="announcement-actions">
                    <button onClick={() => handleEdit(latestAnnouncement)} className="btn-icon" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteClick(latestAnnouncement.id)} className="btn-icon btn-icon-delete" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={handleDeleteCancel}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">
              <AlertTriangle size={48} />
            </div>

            <h3 className="modal-title">
              Delete Announcement?
            </h3>

            <p className="modal-text">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>

              <button
                className="btn-delete"
                onClick={handleDeleteConfirm}
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
