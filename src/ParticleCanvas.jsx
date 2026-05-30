import React, { useEffect, useRef } from 'react';

function ParticleCanvas({ type }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let particles = [];

    const createParticles = () => {
      particles = [];
      const count = type === 'rain' ? 120 : type === 'snow' ? 60 : type === 'stars' ? 80 : 30;
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(i));
      }
    };

    const createParticle = (i) => {
      const w = canvas.width || 400;
      const h = canvas.height || 600;
      if (type === 'rain') {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          speed: Math.random() * 6 + 8,
          length: Math.random() * 20 + 15,
          opacity: Math.random() * 0.4 + 0.3,
        };
      }
      if (type === 'snow') {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 4 + 1,
          speed: Math.random() * 1.5 + 0.5,
          drift: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.6 + 0.3,
          angle: 0,
        };
      }
      if (type === 'stars') {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
        };
      }
      if (type === 'thunder') {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          speed: Math.random() * 8 + 10,
          length: Math.random() * 25 + 20,
          opacity: Math.random() * 0.3 + 0.1,
        };
      }
      // default floating dots / mist
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 40 + 10,
        opacity: Math.random() * 0.05 + 0.02,
        speed: Math.random() * 0.2 + 0.1,
        dx: Math.random() * 0.4 - 0.2,
      };
    };

    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      particles.forEach((p, idx) => {
        if (type === 'rain' || type === 'thunder') {
          ctx.save();
          ctx.strokeStyle = type === 'thunder' ? `rgba(174,214,241,${p.opacity})` : `rgba(174,214,241,${p.opacity})`;
          ctx.lineWidth = type === 'thunder' ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.length * 0.2, p.y + p.length);
          ctx.stroke();
          ctx.restore();
          p.y += p.speed;
          p.x += p.speed * 0.2;
          if (p.y > h) { particles[idx] = createParticle(idx); particles[idx].y = -20; }
        }

        if (type === 'snow') {
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.y += p.speed;
          p.x += p.drift + Math.sin(p.angle) * 0.5;
          p.angle += 0.02;
          if (p.y > h) { particles[idx] = createParticle(idx); particles[idx].y = -10; }
        }

        if (type === 'stars') {
          p.twinkle += p.speed;
          const op = (Math.sin(p.twinkle) + 1) / 2 * 0.8 + 0.1;
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${op})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          // glint
          if (p.r > 1.5) {
            ctx.strokeStyle = `rgba(255,255,255,${op * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x - p.r * 3, p.y);
            ctx.lineTo(p.x + p.r * 3, p.y);
            ctx.moveTo(p.x, p.y - p.r * 3);
            ctx.lineTo(p.x, p.y + p.r * 3);
            ctx.stroke();
          }
          ctx.restore();
        }

        if (type === 'mist' || type === 'clouds' || type === 'sun') {
          ctx.save();
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          grad.addColorStop(0, `rgba(255,255,255,${p.opacity})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          p.x += p.dx;
          p.y -= p.speed * 0.3;
          if (p.y < -p.r) { particles[idx] = createParticle(idx); particles[idx].y = h + p.r; }
          if (p.x < -p.r || p.x > w + p.r) { particles[idx] = createParticle(idx); }
        }
      });

      // Lightning flash for thunder
      if (type === 'thunder' && Math.random() < 0.003) {
        ctx.fillStyle = 'rgba(255,255,200,0.08)';
        ctx.fillRect(0, 0, w, h);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

export default ParticleCanvas;
