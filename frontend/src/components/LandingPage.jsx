import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import './LandingPage.css';
import HeroScene from './3d/HeroScene';
import SharedHeader from './SharedHeader';

// Note: This landing page is a premium, high-performance replacement.
// It uses a lightweight ScrollReveal loader (CDN) for staggered reveals
// and requestAnimationFrame for parallax. No build-time deps added.

// Reusable feature card with SVG icon
const Feature = ({ title, desc, svg }) => (
  <div className="feature-card" data-animate>
    <div
      className="feature-icon"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    <div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  </div>
);

const LandingPage = ({ onStart, onOpenHow, onOpenFeatures }) => {
  const heroRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch (e) {}
    return document.documentElement.classList.contains('dark');
  });
  const [showUpBtn, setShowUpBtn] = useState(false);
  const parallaxRef = useRef(null);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nowDark = !root.classList.contains('dark');
    if (nowDark) root.classList.add('dark'); else root.classList.remove('dark');
    setIsDark(nowDark);
    try { localStorage.setItem('theme', nowDark ? 'dark' : 'light'); } catch (e) {}
  };

  useEffect(() => {
    // Page + hero entrance
    const hero = heroRef.current;
    if (hero) {
      hero.classList.add('hero-loaded-animation');
    }

    // ensure theme from localStorage is applied on mount
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else if (stored === 'light') {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    } catch (e) {}

    // Scroll reveal for data-animate elements
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const animatedEls = document.querySelectorAll('[data-animate]');
    animatedEls.forEach(el => observer.observe(el));

    // Show back-to-top button when scrolling
    const onScroll = () => {
      setShowUpBtn(window.scrollY > 280);
    };
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // init simple parallax for background shapes
    let rafId = null;
    const parallax = () => {
      const sc = window.scrollY;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${sc * -0.06}px)`;
      }
      rafId = requestAnimationFrame(parallax);
    };
    rafId = requestAnimationFrame(parallax);

    // dynamically load ScrollReveal from CDN for stagger reveals
    const srScript = document.createElement('script');
    srScript.src = 'https://unpkg.com/scrollreveal';
    srScript.async = true;
    srScript.onload = () => {
      try {
        // global ScrollReveal
        if (window.ScrollReveal) {
          window.ScrollReveal().reveal('[data-sr]', { distance: '24px', duration: 700, easing: 'cubic-bezier(.2,.9,.3,1)', interval: 80 });
          window.ScrollReveal().reveal('.hero-illustration', { scale: 0.98, duration: 900 }, 100);
        }
      } catch (e) {
        // ignore
      }
    };
    document.head.appendChild(srScript);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (srScript && srScript.parentNode) srScript.parentNode.removeChild(srScript);
    };
  }, []);

  const scrollToLearnMore = () => {
    const target = document.getElementById('learn-more-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coreFeatures = [
    {
      title: 'Immersive 3D Preview',
      desc: 'Preview your plants and layout inside a realistic 3D-like scene with depth and lighting.',
      svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    {
      title: 'Smart Save & Restore',
      desc: 'Save your design locally and reload it later without losing any of your layout decisions.',
      svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10l5 5 5-5"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    {
      title: 'Intuitive Land Drawing',
      desc: 'Sketch the shape of your garden with simple clicks and see it instantly in the design view.',
      svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21l3-3 7-7 4-4 4-4"
                stroke="currentColor" stroke-width="1.2"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    }
  ];

  return (
    <div className="landing-root">
      {/* Glowing background blobs */}
      <div className="bg-shapes" aria-hidden ref={parallaxRef}>
        <div className="shape s1" />
        <div className="shape s2" />
        <div className="shape s3" />
        <div className="shape s4" />
      </div>

      {/* Shared header */}
      <SharedHeader isDark={isDark} onToggleTheme={toggleTheme} onOpenHow={onOpenHow} onOpenFeatures={onOpenFeatures} onStart={onStart} />

      {/* MAIN CONTENT */}
      <main className="landing-content">
        {/* HERO */}
        <section className="hero premium-hero" ref={heroRef}>
          <div className="hero-inner">
            <div className="hero-left" data-sr>
              <h1 className="hero-title">Design the Future of Your Outdoor Space</h1>
              <p className="hero-sub">Plan, experiment and visualize your dream garden in an elegant 3D environment before planting a single seed.</p>
              <div className="hero-ctas">
                <Button onClick={onStart} size="lg" className="primary-cta ripple">Start Designing</Button>
                <Button onClick={scrollToLearnMore} size="lg" className="outline-cta">Learn More</Button>
              </div>
              <div className="hero-features" data-sr>
                <div className="hf">AI hinting & spacing</div>
                <div className="hf">Realistic land shaping</div>
                <div className="hf">Lighting & mood preview</div>
              </div>
            </div>

            <div className="hero-right" data-sr>
              <div className="hero-illustration" aria-hidden>
                {/* Lightweight React-Three-Fiber hero scene */}
                <div className="scene-loop"><HeroScene /></div>
                <div className="scroll-indicator" onClick={scrollToLearnMore}><span /></div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO / LEARN MORE */}
        <section
          id="learn-more-section"
          className="intro"
          data-animate
        >
          <h2 className="section-title">What is NeoGarden?</h2>
          <p className="section-desc">
            NeoGarden is a playground for landscaping ideas. Draw your land,
            drop in plants, and instantly see how everything feels together on
            a clean, modern canvas.
          </p>
          <p className="section-desc small">
            Whether you&apos;re a homeowner, a hobbyist, or a professional
            designer, NeoGarden helps you test layouts, densities and moods
            with zero mess and maximum control.
          </p>
        </section>

        {/* FEATURE CARDS */}
        <section className="features" data-animate>
          <div className="features-grid">
            {coreFeatures.map((f, i) => (
              <Feature key={i} {...f} />
            ))}
          </div>
        </section>

        {/* SHOWCASE SLIDER (CSS-only carousel feel) */}
        <section className="carousel-section" data-animate>
          <div className="carousel-track">
            <div className="carousel-item">🌍 Realistic land shapes</div>
            <div className="carousel-item">🌿 Smart plant placement</div>
            <div className="carousel-item">🌤 Light & mood aware</div>
            <div className="carousel-item">💾 Save & reload instantly</div>
            <div className="carousel-item">🎯 Designer-grade controls</div>
            {/* duplicates for infinite effect */}
            <div className="carousel-item">🌍 Realistic land shapes</div>
            <div className="carousel-item">🌿 Smart plant placement</div>
          </div>
        </section>

        {/* HOW TO USE */}
        <section className="howto" data-animate>
          <h2 className="section-title">How to Get Started</h2>
          <ol className="how-list">
            <li>Click <strong>Start Designing</strong> to open the editor.</li>
            <li>Draw your land boundary or load a previous design.</li>
            <li>Select plants and place them on your virtual garden.</li>
            <li>Refine, save, and return anytime to continue improving.</li>
          </ol>
        </section>

        {/* FOOTER */}
        <footer className="landing-footer" data-animate>
          <div className="footer-inner">
            Crafted with 🌿 — NeoGarden © {new Date().getFullYear()}
          </div>
        </footer>
      </main>

      {/* BACK TO TOP BUTTON */}
      {showUpBtn && (
        <button className="scroll-up-btn" onClick={scrollToTop} aria-label="Back to top">
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
};

export default LandingPage;
