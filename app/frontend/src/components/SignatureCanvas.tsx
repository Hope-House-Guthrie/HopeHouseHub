import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Button, Snackbar, Typography } from "@mui/material";
import { hopeHouseColors } from "../lib/hope-house-colors";
import { captureTopazSignature } from "../lib/topaz-signature";

/**
 * For TJ: This is everything I found while testing the Topaz signature pad.
 *
 * TOPAZ SIGNATURE PAD NOTES
 *
 * Hardware tested: Topaz T-S460-HSB-R (SigLite 1x5, USB/HID).
 *
 * Linux proof-of-concept completed successfully using Topaz SigLib:
 * - TabletType=6 (HidSerialTabletType)
 * - TabletModel=SigLite1X5
 * - OpenTablet() successful
 * - Signature strokes/points captured successfully
 * - Signature rendered successfully at 400x150
 * - Topaz BMP output uses grayscale values 0/1 and must be normalized
 *   to 0/255 before converting to a normal PNG.
 *
 * Windows:
 * - Topaz's recommended browser SDK for Windows is SigPlusExtLite.
 * - Supports Windows 10+ with Chrome, Firefox, and Edge.
 * - SigPlusExtLite V3 provides a JavaScript API for browser integration.
 * - Signature data/images can be returned in base64 form.
 * - SigWeb is also available from Topaz as a Windows browser SDK.
 *
 * Official Topaz resources:
 * - T-S460 hardware/model information:
 *   https://www.topazsystems.com/standard/t-s460.html
 *
 * - SigPlusExtLite (recommended Windows browser SDK, downloads + guides):
 *   https://www.topazsystems.com/sdks/sigplusextlite.html
 *
 * - SigPlus Pro C++ Object Library (Windows/Linux/Unix SDK):
 *   https://www.topazsystems.com/sdks/sigpluspro-clibrary.html
 *
 * - Topaz demos and source code:
 *   https://www.topazsystems.com/demos-source.html
 *
 * - Topaz help/developer guides:
 *   https://www.topazsystems.com/guides.html
 *
 * Frontend direction:
 * Keep ONE SignatureCanvas for all signature methods.
 * Mouse, touch, stylus, and Topaz should all produce the same normalized
 * PNG/base64 output through onSignatureChange().
 *
 * Topaz hardware communication should remain behind an adapter/service
 * rather than putting device-specific code directly in this component.
 * This allows the frontend SignatureCanvas contract to remain the same
 * regardless of whether the workstation uses the Linux SigLib path or
 * a Windows Topaz browser integration.
 *
 * Production hardware bridge/deployment is still a backend/infrastructure
 * handoff decision.
 *
 * Longer-term direction is still toward tablet-based signatures,
 * but the Topaz pad is now confirmed as a working Linux option.
 */

interface SignatureCanvasProps {
  onSignatureChange: (base64: string) => void;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export default function SignatureCanvas({
  onSignatureChange,
  width = 400,
  height = 150,
  disabled = false,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isTopazCapturing, setIsTopazCapturing] = useState(false);
  const [topazErrorOpen, setTopazErrorOpen] = useState(false);
  const hasDrawnRef = useRef(false);

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

  // Helper to get pointer coordinates
  const getEventCoords = useCallback(
    (e: React.PointerEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  // Handle touch/mouse events for drawing
  const startDrawing = (e: React.PointerEvent) => {
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

    if (!hasDrawnRef.current) return;

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
    hasDrawnRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing || disabled) return;

    const coords = getEventCoords(e);
    if (coords) {
      drawAtPoint(coords.x, coords.y);
    }
  };

  const handleTopazCapture = async () => {
    if (disabled || isTopazCapturing) return;

    setIsTopazCapturing(true);

    try {
      const result = await captureTopazSignature();
      const image = new Image();
      image.src = `data:image/png;base64,${result.imageBase64}`;
      await image.decode();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      hasDrawnRef.current = true;
      setHasSignature(true);

      onSignatureChange(result.imageBase64);
    } catch (error) {
      console.error("Topaz signature capture failed:", error);
      setTopazErrorOpen(true);
    } finally {
      setIsTopazCapturing(false);
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
      hasDrawnRef.current = false;
      setHasSignature(false);
      onSignatureChange("");
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" gutterBottom>
        Signature:
      </Typography>
      <Box
        sx={{
          border: "2px solid #ccc",
          borderRadius: 1,
          backgroundColor: "white",
          cursor: disabled ? "not-allowed" : "crosshair",
        }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
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
          onClick={handleTopazCapture}
          disabled={disabled || isTopazCapturing}
        >
          {isTopazCapturing ? "Capturing..." : "Use Topaz Pad"}
        </Button>
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

      <Snackbar
        open={topazErrorOpen}
        autoHideDuration={4000}
        onClose={() => setTopazErrorOpen(false)}
        message="Topaz signature pad unavailable. You can still sign in the signature box."
        slotProps={{
          content: {
            sx: {
              bgcolor: hopeHouseColors.blue,
              color: hopeHouseColors.white,
              fontWeight: 600,
            },
          },
        }}
      />
    </Box>
  );
}
