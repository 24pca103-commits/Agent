import React, { useEffect, useRef } from 'react';

export const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse parallax coordinates
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Stars simulation
    interface Star3D {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speed: number;
    }

    const starCount = 180;
    const stars: Star3D[] = [];
    const colors = ['#818cf8', '#a78bfa', '#38bdf8', '#c084fc', '#ffffff', '#e0e7ff'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.8 + 0.3
      });
    }

    // 3D Orbital Rings simulation
    let angle3D = 0;

    const render = () => {
      const isDark = document.documentElement.classList.contains('dark');

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const offsetX = (mouseX - width / 2) * 0.08;
      const offsetY = (mouseY - height / 2) * 0.08;

      ctx.clearRect(0, 0, width, height);

      if (isDark) {
        // Deep space ambient nebula backdrop
        const bgGrad = ctx.createRadialGradient(
          width * 0.5 + offsetX,
          height * 0.4 + offsetY,
          50,
          width * 0.5,
          height * 0.5,
          Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#0f1738');
        bgGrad.addColorStop(0.4, '#090d20');
        bgGrad.addColorStop(1, '#04060d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Enterprise Clean Light Atmosphere (Stripe / Apollo style)
        const bgGrad = ctx.createRadialGradient(
          width * 0.5 + offsetX,
          height * 0.3 + offsetY,
          50,
          width * 0.5,
          height * 0.5,
          Math.max(width, height)
        );
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Render 3D Rotating Gyroscopic Orbital Rings in the background
      angle3D += 0.003;
      const centerX = width * 0.75 + offsetX * 1.5;
      const centerY = height * 0.45 + offsetY * 1.5;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Ring 1 (Horizontal tilt)
      ctx.beginPath();
      ctx.ellipse(0, 0, 320, 110, angle3D * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(99, 102, 241, 0.07)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Ring 2 (Vertical tilted)
      ctx.beginPath();
      ctx.ellipse(0, 0, 360, 130, -angle3D * 1.2 + 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(167, 139, 250, 0.09)' : 'rgba(99, 102, 241, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ring 3 (Outer orbit)
      ctx.beginPath();
      ctx.ellipse(0, 0, 420, 160, angle3D * 0.5 - 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.07)' : 'rgba(56, 189, 248, 0.04)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Core 3D Glowing Planet/Nucleus
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 75);
      if (isDark) {
        coreGrad.addColorStop(0, 'rgba(129, 140, 248, 0.45)');
        coreGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
        coreGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else {
        coreGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        coreGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.04)');
        coreGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      }
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Render 3D Depth Particles
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= star.speed;

        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 280 / star.z;
        const px = star.x * k + width / 2 - offsetX * (1 - star.z / width);
        const py = star.y * k + height / 2 - offsetY * (1 - star.z / width);
        const pSize = Math.max(0.5, (1 - star.z / width) * star.size * 2.2);

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1 - star.z / width) * 1.2);
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? star.color : '#6366f1';
          ctx.globalAlpha = isDark ? alpha : alpha * 0.22;
          if (isDark && pSize > 2) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = star.color;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
