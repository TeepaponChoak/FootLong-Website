import { useState, useEffect, useCallback, useRef } from 'react';
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

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isFitToScreen, setIsFitToScreen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening or changing images
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setIsFitToScreen(true);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

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
    [isOpen, currentIndex, zoom]
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

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    resetImageView();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    resetImageView();
  };

  const resetImageView = () => {
    setZoom(1);
    setIsFitToScreen(true);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsLoading(true);
  };

  const handleZoomIn = () => {
    if (zoom < 5) {
      setZoom((prev) => Math.min(prev + 0.5, 5));
      setIsFitToScreen(false);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) {
      setZoom((prev) => Math.max(prev - 0.5, 0.5));
      if (zoom <= 0.5) {
        setIsFitToScreen(true);
      }
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setIsFitToScreen(true);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleFitToScreen = () => {
    handleResetZoom();
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag functionality for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      style={{
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
      }}
    >
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="lightbox-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: zoom > 1 ? 'grab' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="spinner"
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(168, 85, 247, 0.3)',
                borderTop: '3px solid var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        )}

        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          onLoad={() => setIsLoading(false)}
          style={{
            maxWidth: isFitToScreen ? '90%' : 'none',
            maxHeight: isFitToScreen ? '85vh' : 'none',
            width: isFitToScreen ? 'auto' : `${zoom * 100}%`,
            height: isFitToScreen ? 'auto' : 'auto',
            objectFit: 'contain',
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${isFitToScreen ? 1 : zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              style={{
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(22, 22, 42, 0.8)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <ChevronLeft size={28} />
            </button>

            <button
              onClick={goToNext}
              style={{
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(22, 22, 42, 0.8)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Top Bar - Close Button */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20,
        }}
      >
        <button
          onClick={onClose}
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(22, 22, 42, 0.8)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
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
        }}
      >
        {/* Image Counter */}
        {images.length > 1 && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--color-muted)',
              marginRight: '0.5rem',
              minWidth: '60px',
              textAlign: 'center',
            }}
          >
            {currentIndex + 1} / {images.length}
          </span>
        )}

        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'var(--color-border)',
            margin: '0 0.25rem',
          }}
        />

        {/* Zoom Controls */}
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoom > 0.5 ? 'pointer' : 'not-allowed',
            color: zoom > 0.5 ? 'var(--color-text)' : 'var(--color-muted)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (zoom > 0.5) {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = zoom > 0.5 ? 'var(--color-text)' : 'var(--color-muted)';
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--color-accent)',
            minWidth: '45px',
            textAlign: 'center',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: zoom < 5 ? 'pointer' : 'not-allowed',
            color: zoom < 5 ? 'var(--color-text)' : 'var(--color-muted)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (zoom < 5) {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
              e.currentTarget.style.color = 'var(--color-accent)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = zoom < 5 ? 'var(--color-text)' : 'var(--color-muted)';
          }}
        >
          <ZoomIn size={18} />
        </button>

        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'var(--color-border)',
            margin: '0 0.25rem',
          }}
        />

        {/* Fit to Screen */}
        <button
          onClick={handleFitToScreen}
          title="Fit to screen"
          style={{
            background: isFitToScreen ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            border: isFitToScreen ? '1px solid var(--color-accent)' : 'none',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isFitToScreen ? 'var(--color-accent)' : 'var(--color-text)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isFitToScreen ? 'rgba(168, 85, 247, 0.2)' : 'transparent';
          }}
        >
          {isFitToScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Rotate Controls */}
        <button
          onClick={handleRotateLeft}
          title="Rotate left"
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={handleRotateRight}
          title="Rotate right"
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
        >
          <RotateCw size={18} />
        </button>

        <div
          style={{
            width: '1px',
            height: '24px',
            background: 'var(--color-border)',
            margin: '0 0.25rem',
          }}
        />

        {/* Reset */}
        <button
          onClick={handleResetZoom}
          title="Reset view"
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
        >
          <RotateCcw size={18} />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          title="Download image"
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.color = 'var(--color-accent-2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text)';
          }}
        >
          <Download size={18} />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div
          style={{
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
          }}
        >
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetImageView();
              }}
              style={{
                flexShrink: 0,
                width: '60px',
                height: '60px',
                border: index === currentIndex ? '2px solid var(--color-accent)' : '2px solid transparent',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: index === currentIndex ? 1 : 0.5,
                transition: 'all 0.2s ease',
                padding: 0,
                background: 'none',
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '0.5';
                }
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </button>
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
}