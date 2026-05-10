import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { announcementAPI } from '../api';
import type { Announcement } from '../types';
import { Megaphone, Edit2, Trash2, Plus, X, Save } from 'lucide-react';

export function AnnouncementPanel() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isNew, setIsNew] = useState(false);

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
    setIsEditing(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setIsNew(false);
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      if (isNew) {
        await announcementAPI.createAnnouncement({ title: editTitle, content: editContent });
      } else {
        await announcementAPI.updateAnnouncement(editingId!, { title: editTitle, content: editContent });
      }
      setIsEditing(false);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementAPI.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="announcement-panel-loading">
        <p>Loading announcements...</p>
      </div>
    );
  }

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;
  const announcementHistory = announcements.length > 1 ? announcements.slice(1) : [];

  return (
    <div className="announcement-panel">
      {isAdmin && isEditing && (
        <div className="announcement-editor">
          <div className="editor-header">
            <h3>{isNew ? 'New Announcement' : 'Edit Announcement'}</h3>
            <button onClick={handleCancel} className="btn-icon">
              <X size={18} />
            </button>
          </div>
          <div className="form-group">
            <label>Title</label>
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
              rows={6}
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
        <div className="empty-state" style={{ padding: '2rem', marginTop: '1rem' }}>
          <Megaphone size={32} style={{ marginBottom: '0.5rem', color: 'var(--color-muted)' }} />
          <p style={{ color: 'var(--color-muted)' }}>No announcements yet</p>
        </div>
      )}

      {latestAnnouncement && !isEditing && (
        <div className="announcement-main">
          <article className="announcement-card">
            <div className="announcement-badge">
              <Megaphone size={14} /> Latest Announcement
            </div>
            <h2 className="announcement-title">{latestAnnouncement.title}</h2>
            <div className="announcement-content">
              {latestAnnouncement.content}
            </div>
            <div className="announcement-meta">
              {new Date(latestAnnouncement.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {isAdmin && (
                <div className="announcement-actions">
                  <button onClick={() => handleEdit(latestAnnouncement)} className="btn-icon" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(latestAnnouncement.id)} className="btn-icon btn-icon-delete" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {announcementHistory.length > 0 && !isEditing && (
        <div className="announcement-history">
          <h3 className="history-title">
            <span className="history-line"></span>
            History
            <span className="history-line"></span>
          </h3>
          <div className="history-list">
            {announcementHistory.map((ann) => (
              <div key={ann.id} className="history-item">
                <div className="history-item-header">
                  <h4>{ann.title}</h4>
                  <span className="history-date">
                    {new Date(ann.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="history-content">{ann.content.substring(0, 100)}...</p>
                {isAdmin && (
                  <div className="history-item-actions">
                    <button onClick={() => handleEdit(ann)} className="btn-text">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(ann.id)} className="btn-text btn-text-delete">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}