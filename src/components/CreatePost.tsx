import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { blogAPI } from '../api';
import { Image, X, Link, Youtube, FileText, Tag, Upload } from 'lucide-react';

export function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      let totalSize = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalSize += file.size;
        if (file.size > 5 * 1024 * 1024) {
          setError(`Image ${file.name} is too large (max 5MB)`);
          return;
        }
      }

      if (totalSize > 10 * 1024 * 1024) {
        setError('Total image size must be less than 10MB');
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageUrl = () => {
    if (imageUrl.trim()) {
      setImages(prev => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setSubmitting(true);
      await blogAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        images: images.length > 0 ? images : undefined,
        videoUrl: videoUrl.trim() ? extractYouTubeId(videoUrl.trim()) || undefined : undefined
      });
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="announcement-editor" style={{ marginTop: '2rem' }}>
        <div className="editor-header">
          <h3>
            <FileText size={18} />
            Create New Post
          </h3>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              <FileText size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              className="announcement-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, tips, or ideas with the crew..."
              className="announcement-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">
              <Tag size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="productivity, workflow, inspiration"
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>
              <Image size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              Images (optional)
            </label>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('images')?.click()}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Upload size={16} />
                Upload Images
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL..."
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleImageUrl}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Link size={14} />
                  Add
                </button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="image-preview-remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* YouTube Video Section */}
          <div className="form-group">
            <label htmlFor="videoUrl">
              <Youtube size={14} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              YouTube Video URL (optional)
            </label>
            <input
              type="text"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {videoUrl && extractYouTubeId(videoUrl) && (
              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', margin: 0 }}>
                  ✓ Video will be embedded: <strong>{extractYouTubeId(videoUrl)}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="editor-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}