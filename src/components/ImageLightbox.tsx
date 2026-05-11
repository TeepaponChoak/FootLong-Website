import { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  RotateCcw,
  RotateCw,
} from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

// Memoized thumbnail component to prevent unnecessary re-renders
const Thumbnail = memo(({ 
  img, 
  index, 
  currentIndex, 
  onClick 
}: { 
  img: string; 
  index: number; 
  currentIndex: number; 
  onClick: () => void;
}) => {
  const isActive = index === currentIndex;
  
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: '60px',
        height: '60px',
        border: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.5,
        transition: 'opacity 0.2s ease',
        padding: 0,
        background: 'none',
      }}
    >
      <img
        src={img}
        alt={`Thumbnail ${index + 1}`}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </button>
  );
});

Thumbnail.displayName = 'Thumbnail';

export const ImageLightbox = memo(({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFitToScreen, setIsFitToScreen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationFrameRef = useRef<number>();
  const positionRef = useRef(position);
  
  // Keep ref in sync with state
  positionRef.current = position;

  // Preload images for smoother navigation
  const preloadImages = useCallback((index: number) => {
    const preloadNext = (idx: number) => {
      const nextIdx = idx < images.length - 1 ? idx + 1 : 0;
      const img = new Image();
      img.src = images[nextIdx];
    };
    const preloadPrev = (idx: number) => {
      const prevIdx = idx > 0 ? idx - 1 : images.length - 1;
      const img = new Image();
      img.src = images[prevIdx];
    };
    
    preloadNext(index);
    preloadPrev(index);
  }, [images]);

  // Reset state when opening or changing images
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setIsFitToScreen(true);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsLoading(true);
      preloadImages(initialIndex);
    }
  }, [isOpen, initialIndex, preloadImages]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    },
    [isOpen, currentIndex, zoom, images.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev > 0 ? prev - 1 : images.length - 1;
      preloadImages(next);
      return next;
    });
    resetImageView();
  }, [images.length, preloadImages]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev < images.length - 1 ? prev + 1 : 0;
      preloadImages(next);
      return next;
    });
    resetImageView();
  }, [images.length, preloadImages]);

  const resetImageView = useCallback(() => {
    setZoom(1);
    setIsFitToScreen(true);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsLoading(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (zoom < 5) {
      setZoom((prev) => Math.min(prev + 0.5, 5));
      setIsFitToScreen(false);
    }
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > 0.5) {
      setZoom((prev) => Math.max(prev - 0.5, 0.5));
      if (zoom <= 0.5) {
        setIsFitToScreen(true);
      }
    }
  }, [zoom]);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setIsFitToScreen(true);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleFitToScreen = useCallback(() => {
    handleResetZoom();
  }, [handleResetZoom]);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [images, currentIndex]);

  // Optimized drag functionality using requestAnimationFrame
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - positionRef.current.x, y: e.clientY - positionRef.current.y });
    }
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // Debounced wheel zoom
  const wheelTimeoutRef = useRef<number>();
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
    
    wheelTimeoutRef.current = window.setTimeout(() => {
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }, 16); // ~60fps
  }, [handleZoomIn, handleZoomOut]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];
  const transformStyle = isFitToScreen 
    ? 'scale(1)' 
    : `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      style={styles.overlay}
    >
      {/* Main Image Container */}
      <div
        className="lightbox-container"
        onClick={(e) => e.stopPropagation()}
        style={styles.container}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {isLoading && (
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner} />
          </div>
        )}

        <img
          ref={imageRef}
          src={currentImage}
          alt={`Image ${currentIndex + 1}`}
          onLoad={() => setIsLoading(false)}
          style={{
            ...styles.image,
            ...(isFitToScreen ? styles.imageFit : styles.imageZoom),
            transform: transformStyle,
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              style={styles.navButton}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.navButtonHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.navButton)}
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={goToNext}
              style={styles.navButtonRight}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.navButtonHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.navButton)}
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Top Bar - Close Button */}
      <div style={styles.closeButtonContainer}>
        <button
          onClick={onClose}
          style={styles.closeButton}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.closeButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.closeButton)}
        >
          <X size={22} />
        </button>
      </div>

      {/* Bottom Controls Bar */}
      <div style={styles.controlsBar}>
        {/* Image Counter */}
        {images.length > 1 && (
          <span style={styles.counter}>
            {currentIndex + 1} / {images.length}
          </span>
        )}

        <div style={styles.divider} />

        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          style={{
            ...styles.controlButton,
            ...(zoom <= 0.5 ? styles.controlButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (zoom > 0.5) {
              Object.assign(e.currentTarget.style, styles.controlButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, styles.controlButton);
            if (zoom <= 0.5) {
              Object.assign(e.currentTarget.style, styles.controlButtonDisabled);
            }
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span style={styles.zoomLevel}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          style={{
            ...styles.controlButton,
            ...(zoom >= 5 ? styles.controlButtonDisabled : {}),
          }}
          onMouseEnter={(e) => {
            if (zoom < 5) {
              Object.assign(e.currentTarget.style, styles.controlButtonHover);
            }
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, styles.controlButton);
            if (zoom >= 5) {
              Object.assign(e.currentTarget.style, styles.controlButtonDisabled);
            }
          }}
        >
          <ZoomIn size={18} />
        </button>

        <div style={styles.divider} />

        {/* Fit to Screen */}
        <button
          onClick={handleFitToScreen}
          title="Fit to screen"
          style={{
            ...styles.controlButton,
            ...(isFitToScreen ? styles.controlButtonActive : {}),
          }}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, isFitToScreen ? styles.controlButtonActiveHover : styles.controlButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, isFitToScreen ? styles.controlButtonActive : styles.controlButton)}
        >
          {isFitToScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Rotate Controls */}
        <button
          onClick={handleRotateLeft}
          title="Rotate left"
          style={styles.controlButton}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.controlButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.controlButton)}
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={handleRotateRight}
          title="Rotate right"
          style={styles.controlButton}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.controlButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.controlButton)}
        >
          <RotateCw size={18} />
        </button>

        <div style={styles.divider} />

        {/* Reset */}
        <button
          onClick={handleResetZoom}
          title="Reset view"
          style={styles.controlButton}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.controlButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.controlButton)}
        >
          <RotateCcw size={18} />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          title="Download image"
          style={styles.controlButton}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.downloadButtonHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.controlButton)}
        >
          <Download size={18} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div style={styles.thumbnailStrip}>
          {images.map((img, index) => (
            <Thumbnail
              key={index}
              img={img}
              index={index}
              currentIndex={currentIndex}
              onClick={() => {
                setCurrentIndex(index);
                preloadImages(index);
                resetImageView();
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

ImageLightbox.displayName = 'ImageLightbox';

// Styles object for better performance (avoid inline style recreation)
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'default',
  },
  image: {
    objectFit: 'contain',
    transition: 'transform 0.15s ease-out',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    willChange: 'transform',
  },
  imageFit: {
    maxWidth: '90%',
    maxHeight: '85vh',
  },
  imageZoom: {
    maxWidth: 'none',
    maxHeight: 'none',
  },
  spinnerContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(168, 85, 247, 0.3)',
    borderTop: '3px solid var(--color-accent)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  navButton: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(22, 22, 42, 0.8)',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  navButtonRight: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(22, 22, 42, 0.8)',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease',
    zIndex: 10,
  },
  navButtonHover: {
    background: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'var(--color-accent)',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 20,
  },
  closeButton: {
    background: 'rgba(22, 22, 42, 0.8)',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease',
  },
  closeButtonHover: {
    background: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.6)',
    color: '#f87171',
  },
  controlsBar: {
    position: 'absolute',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(22, 22, 42, 0.9)',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    zIndex: 20,
    backdropFilter: 'blur(10px)',
  },
  counter: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginRight: '0.5rem',
    minWidth: '60px',
    textAlign: 'center',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: 'var(--color-border)',
    margin: '0 0.25rem',
  },
  controlButton: {
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text)',
    transition: 'all 0.2s ease',
  },
  controlButtonDisabled: {
    cursor: 'not-allowed',
    color: 'var(--color-muted)',
  },
  controlButtonHover: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: 'var(--color-accent)',
  },
  controlButtonActive: {
    background: 'rgba(168, 85, 247, 0.2)',
    border: '1px solid var(--color-accent)',
    color: 'var(--color-accent)',
  },
  controlButtonActiveHover: {
    background: 'rgba(168, 85, 247, 0.3)',
    border: '1px solid var(--color-accent)',
    color: 'var(--color-accent)',
  },
  downloadButtonHover: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: 'var(--color-accent-2)',
  },
  zoomLevel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--color-accent)',
    minWidth: '45px',
    textAlign: 'center',
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(22, 22, 42, 0.8)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    zIndex: 10,
    maxWidth: '90%',
    overflowX: 'auto',
  },
};