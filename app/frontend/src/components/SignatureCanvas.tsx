import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button, Typography } from "@mui/material";

interface SignatureCanvasProps {
  onSignatureChange: (base64: string) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
  showLabel?: boolean;
}

export default function SignatureCanvas({
  onSignatureChange,
  width = 400,
  height = 150,
  disabled = false,
  showLabel = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas with proper styling for touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // White background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        // Black stroke
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Helper to get mouse/touch coordinates
  const getEventCoords = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
    ): { x: number; y: number } | null => {
      if (e.type.startsWith("touch")) {
        const touch = (e as React.TouchEvent).touches[0];
        if (!touch) return null;
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect();
        if (!canvas || !rect) return null;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if (!canvas || !rect) return null;
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      } else {
        const mouse = e as React.MouseEvent;
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect();
        if (!canvas || !rect) return null;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if (!canvas || !rect) return null;
        return {
          x: (mouse.clientX - rect.left) * scaleX,
          y: (mouse.clientY - rect.top) * scaleY,
        };
      }
    },
    [],
  );

  // Handle touch/mouse events for drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDrawing(true);
    const coords = getEventCoords(e);
    if (coords) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const stopDrawing = () => {
    if (disabled) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      // Ensure we have a valid data URL before splitting
      const parts = dataURL.split(",");
      if (parts.length > 1 && parts[1]) {
        const base64 = parts[1] as string;
        setHasSignature(true);
        onSignatureChange(base64);
      }
    }
  };

  const drawAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;

    const coords = getEventCoords(e);
    if (coords) {
      drawAtPoint(coords.x, coords.y);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
      }
      setHasSignature(false);
      onSignatureChange("");
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {showLabel && (
        <Typography variant="body2" gutterBottom>
          Signature:
        </Typography>
      )}

      <Box
        sx={{
          border: "2px solid #ccc",
          borderRadius: 1,
          backgroundColor: "white",
          cursor: disabled ? "not-allowed" : "crosshair",
        }}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: "100%", height: "100%", touchAction: "none" }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={clearSignature}
          disabled={!hasSignature || disabled}
        >
          Clear
        </Button>
        <Typography
          variant="caption"
          color={hasSignature ? "success.main" : "text.secondary"}
        >
          {hasSignature ? "Signature captured" : "Draw signature above"}
        </Typography>
      </Box>
    </Box>
  );
}
