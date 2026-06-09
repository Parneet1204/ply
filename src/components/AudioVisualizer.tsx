import React, { useEffect, useRef } from 'react';
import audioService from '../services/audioService';

interface AudioVisualizerProps {
  playbackState: 'idle' | 'playing' | 'paused';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ playbackState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        // Adjust for device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // Fetch dynamic frequency domain data
      const dataArray = audioService.getAnalyserData();
      const bufferLength = dataArray.length;

      if (bufferLength === 0 || playbackState === 'idle') {
        // Draw a static subtle baseline when idle
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height - 10);
        ctx.lineTo(width, height - 10);
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i];
        // Calculate height scale
        const percent = value / 255;
        const barHeight = height * percent * 0.9; // max 90% of container height

        if (barHeight > 0) {
          // Glow gradient
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');  // indigo translucent
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.7)'); // violet glow
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.95)');  // pink peak

          ctx.fillStyle = gradient;

          // Draw rounded bars
          ctx.beginPath();
          const radius = Math.min(barWidth / 2, 4);
          const y = height - barHeight;
          
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth - 1.5, barHeight, radius);
          } else {
            ctx.rect(x, y, barWidth - 1.5, barHeight);
          }
          ctx.fill();
        }

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playbackState]);

  return (
    <canvas
      ref={canvasRef}
      className="visualizer-canvas"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
};
export default AudioVisualizer;
