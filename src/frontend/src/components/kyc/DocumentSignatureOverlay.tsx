import { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Undo2, Trash2 } from 'lucide-react';

interface DocumentSignatureOverlayProps {
  imageFile: File;
  onSignatureChange: (hasSignature: boolean) => void;
  onExportSignature: () => Promise<Blob | null>;
}

export default function DocumentSignatureOverlay({
  imageFile,
  onSignatureChange,
  onExportSignature,
}: DocumentSignatureOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number }>>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image and setup canvas
  useEffect(() => {
    if (!imageFile || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(imageFile);

    img.onload = () => {
      // Set canvas size to match image aspect ratio while fitting container
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      setImageLoaded(true);
    };
  }, [imageFile]);

  // Redraw canvas when strokes change
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all strokes
    ctx.strokeStyle = '#2563eb'; // Blue color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }

    // Notify parent of signature state
    onSignatureChange(strokes.length > 0 || currentStroke.length > 0);
  }, [strokes, currentStroke, imageLoaded, onSignatureChange]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke([coords]);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    setCurrentStroke((prev) => [...prev, coords]);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  // Export signature as blob
  useEffect(() => {
    const exportFn = async () => {
      if (!canvasRef.current) return null;

      return new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    };

    // Store export function reference
    (onExportSignature as any).current = exportFn;
  }, [onExportSignature]);

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Sign on the document</p>
          <p className="text-xs text-muted-foreground">
            Draw your signature on the document preview below using your mouse or touch
          </p>
        </div>

        <div className="relative border rounded-lg overflow-hidden bg-muted/20">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="max-w-full h-auto cursor-crosshair touch-none"
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
          <img ref={imageRef} alt="Document" className="hidden" />
          {!imageLoaded && (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Loading image...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="flex-1"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={strokes.length === 0 && currentStroke.length === 0}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
