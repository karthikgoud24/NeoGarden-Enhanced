import React, { useEffect } from 'react';
import './LandingPage.css';
import { Button } from './ui/button';

export default function FeaturesPage({ onClose }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {}
  }, []);

  const coreFeatures = [
    { 
      title: 'Immersive 3D Preview', 
      desc: 'Interactive real-time visualization with full lighting control. Inspect scale, sight-lines, and plant groupings from any angle. Toggle time-of-day, shadows, and foliage density to validate designs under different conditions.',
      icon: '🎨'
    },
    { 
      title: 'Smart Save & Restore', 
      desc: 'Create unlimited named saves with full version tracking. Export as JSON for contractors, clients, or team collaboration. Import previous versions to compare iterations side-by-side.',
      icon: '💾'
    },
    { 
      title: 'Intuitive Land Drawing', 
      desc: 'Precision boundary drawing with point adjustment, auto-smoothing, and live area calculation. Support for complex shapes, curves, and freeform editing with helpful visualization guides.',
      icon: '🖍️'
    },
    { 
      title: 'Plant Library & Spacing', 
      desc: 'Access a curated library of 500+ species with realistic sizes, seasonal colors, and mature dimensions. Smart spacing helpers prevent overcrowding. Use auto-distribute for mass plantings across zones.',
      icon: '🌿'
    },
    { 
      title: 'Light & Mood Preview', 
      desc: 'Validate designs across seasons and times of day. See how shadows fall, which areas stay clear, and how sunlight interacts with your planting. Crucial for outdoor room composition.',
      icon: '☀️'
    },
    { 
      title: 'Performance Controls', 
      desc: 'Work efficiently on large projects. Toggle foliage visibility, adjust level-of-detail, and use performance modes to keep the editor responsive even with hundreds of plants.',
      icon: '⚡'
    }
  ];

  const advancedFeatures = [
    { 
      title: 'Climate & Zone Filters', 
      desc: 'Automatically filter plants suited to your USDA hardiness zone or climate region. Receive species recommendations based on regional conditions, rainfall patterns, and temperature ranges.'
    },
    { 
      title: 'Irrigation Planning', 
      desc: 'Define watering zones and get AI-assisted recommendations for drip vs. sprinkler systems. Calculate water demand per zone and estimate irrigation coverage and efficiency.'
    },
    { 
      title: 'Maintenance Scheduler', 
      desc: 'Build a seasonal maintenance calendar. Track pruning, fertilizing, mulching, and pest-prevention tasks. Share the schedule with maintenance teams or clients.'
    },
    { 
      title: 'Cost Estimator', 
      desc: 'Get instant rough estimates for plant costs, hardscape materials, and labor. Compare budget-conscious vs. premium plant selections to match any project scope.'
    },
    { 
      title: 'Species Profiles', 
      desc: 'Every plant includes detailed metadata: mature size, growth rate, water needs, bloom times, hardiness, and maintenance notes. Make informed, resilient choices confidently.'
    },
    { 
      title: 'Bulk Edit & Templates', 
      desc: 'Create reusable planting templates for common bed types. Apply templates across multiple zones. Bulk-edit spacing, rotation, or species within selections instantly.'
    },
    { 
      title: 'Export Formats', 
      desc: 'Export as JSON (full data), PNG (top-down snapshot), or CSV (for procurement). Generate simple plant lists, cost breakdowns, or site maps for printing and distribution.'
    },
    { 
      title: 'Collaboration Suite', 
      desc: 'Share designs with collaborators, contractors, or clients. Add review notes, version history, and lightweight change tracking. Optional backend sync for team workflows.'
    }
  ];

  return (
    <div className="landing-root">
      <div className="landing-content">
        {/* Hero Section */}
        <div className="doc-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(124,58,237,0.9)', fontWeight: 800 }}>NeoGarden Toolkit</div>
              <h1 style={{ margin: '6px 0 0 0' }}>Powerful Features for Garden Design</h1>
              <p style={{ marginTop: 8 }} className="section-desc">Everything you need to create stunning, sustainable garden designs. From concept to completion, NeoGarden handles the entire workflow with precision, collaboration, and confidence.</p>
            </div>
            <div>
              <Button size="sm" onClick={onClose}>Back to Home</Button>
            </div>
          </div>
        </div>

        {/* Core Features Section */}
        <section className="features" id="features-core" style={{ marginTop: 48 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Core Design Tools</h2>
            <p className="section-desc">Essential features that power every garden design project. Designed for both professionals and enthusiasts.</p>
          </div>

          <div className="features-grid">
            {coreFeatures.map((f, i) => (
              <div className="feature-card" key={i} data-animate style={{ position: 'relative' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div>
                  <div className="kicker">Core Tool</div>
                  <h4 style={{ margin: '4px 0 8px 0' }}>{f.title}</h4>
                </div>
                <p className="lead" style={{ marginTop: 0, fontSize: 14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Features Section */}
        <section id="features-advanced" style={{ marginTop: 48 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Advanced Planning Tools</h2>
            <p className="section-desc">Professional-grade features for detailed planning, cost estimation, collaboration, and long-term maintenance management.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {advancedFeatures.map((f, i) => (
              <div
                key={i}
                data-animate
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: '0 12px 36px rgba(2,6,23,0.55)',
                  cursor: 'pointer',
                  transition: 'all 320ms cubic-bezier(.2,.9,.3,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 18px 48px rgba(2,6,23,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(2,6,23,0.55)';
                }}
              >
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 800, color: '#e6f4ff' }}>{f.title}</h4>
                <p style={{ margin: 0, color: 'rgba(230,238,248,0.78)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow & Benefits Section */}
        <section id="features-workflow" style={{ marginTop: 48 }}>
          <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Design Workflow</h2>
          <p className="section-desc" style={{ marginBottom: 24 }}>A complete workflow from initial concept to handoff, with every step optimized for success.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderLeft: '3px solid #06b6d4', borderRadius: 8, background: 'rgba(6,182,212,0.05)' }}>
              <h4 style={{ margin: 0, color: '#06b6d4', fontSize: 14, fontWeight: 800 }}>1. Define & Draw</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Set area bounds, draw perimeter, define zones.</p>
            </div>
            <div style={{ padding: 16, borderLeft: '3px solid #7c3aed', borderRadius: 8, background: 'rgba(124,58,237,0.05)' }}>
              <h4 style={{ margin: 0, color: '#7c3aed', fontSize: 14, fontWeight: 800 }}>2. Research & Plan</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Check climate zones, water needs, hardscape options.</p>
            </div>
            <div style={{ padding: 16, borderLeft: '3px solid #8b5cf6', borderRadius: 8, background: 'rgba(139,92,246,0.05)' }}>
              <h4 style={{ margin: 0, color: '#8b5cf6', fontSize: 14, fontWeight: 800 }}>3. Place & Iterate</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Add plants, adjust spacing, preview designs.</p>
            </div>
            <div style={{ padding: 16, borderLeft: '3px solid #a78bfa', borderRadius: 8, background: 'rgba(167,139,250,0.05)' }}>
              <h4 style={{ margin: 0, color: '#a78bfa', fontSize: 14, fontWeight: 800 }}>4. Validate & Refine</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Check lighting, shadows, cost, and maintenance.</p>
            </div>
            <div style={{ padding: 16, borderLeft: '3px solid #60a5fa', borderRadius: 8, background: 'rgba(96,165,250,0.05)' }}>
              <h4 style={{ margin: 0, color: '#60a5fa', fontSize: 14, fontWeight: 800 }}>5. Export & Share</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Produce reports, share with clients, save versions.</p>
            </div>
            <div style={{ padding: 16, borderLeft: '3px solid #34d399', borderRadius: 8, background: 'rgba(52,211,153,0.05)' }}>
              <h4 style={{ margin: 0, color: '#34d399', fontSize: 14, fontWeight: 800 }}>6. Implement & Track</h4>
              <p style={{ margin: '6px 0 0', color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>Use maintenance calendar, track progress.</p>
            </div>
          </div>
        </section>

        {/* Key Benefits Section */}
        <section id="features-benefits" style={{ marginTop: 48 }}>
          <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Why Choose NeoGarden?</h2>
          <p className="section-desc" style={{ marginBottom: 20 }}>Built for landscape designers, architects, and garden enthusiasts who demand both precision and creativity.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {[
              { label: '500+ Plant Species', value: 'Carefully curated library with real-world data' },
              { label: 'Real-Time Visualization', value: 'See designs evolve instantly in 3D' },
              { label: 'Climate Smart', value: 'Automatic recommendations for your zone' },
              { label: 'Collaboration Ready', value: 'Export, share, and iterate with teams' },
              { label: 'Cost Transparent', value: 'Estimate materials and labor upfront' },
              { label: 'Maintenance Focused', value: 'Long-term care planning built in' }
            ].map((b, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: 12, color: 'rgba(124,58,237,0.9)', fontWeight: 800, marginBottom: 6 }}>✓ {b.label}</div>
                <p style={{ margin: 0, color: 'rgba(230,238,248,0.8)', fontSize: 13 }}>{b.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips Section */}
        <section id="features-tips" style={{ marginTop: 48, marginBottom: 32 }}>
          <h2 className="section-title" style={{ fontSize: 24, marginBottom: 8 }}>Pro Tips & Best Practices</h2>
          <p className="section-desc" style={{ marginBottom: 20 }}>Maximize your designs with these professional strategies.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {[
              { title: 'Layered Planting', tip: 'Start with large trees (canopy), then mid-story shrubs, then groundcover. This creates visual depth and ensures mature plants don\'t overshadow neighbors.' },
              { title: 'Water-Smart Zoning', tip: 'Group plants with similar water needs. Use the Irrigation Planner to map zones and reduce overspray and runoff.' },
              { title: 'Year-Round Color', tip: 'Mix evergreens for structure with deciduous plants for seasonal interest. Use the Light Preview to see how foliage changes affect the space.' },
              { title: 'Budget Flexibility', tip: 'Use Cost Estimator to create two designs: one premium, one budget-friendly. Compare to find the best value-to-impact ratio.' },
              { title: 'Sight Line Planning', tip: 'Keep key view lines clear (entrance, seating areas, windows). Use the 3D Preview to validate that plants don\'t block views.' },
              { title: 'Collaborative Handoff', tip: 'Export maintenance schedules and species lists as CSV for contractors. Include plant names, counts, and care notes for clarity.' }
            ].map((p, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.04)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#e6f4ff', fontSize: 15, fontWeight: 800 }}>{p.title}</h4>
                <p style={{ margin: 0, color: 'rgba(230,238,248,0.75)', fontSize: 13, lineHeight: 1.6 }}>{p.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div style={{ marginTop: 48, padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#e6f4ff', fontSize: 20 }}>Ready to Design Your Perfect Garden?</h3>
          <p style={{ margin: '0 0 16px 0', color: 'rgba(230,238,248,0.8)' }}>Bring your vision to life with NeoGarden's comprehensive toolkit.</p>
          <Button size="sm" onClick={onClose} className="nav-button" style={{ padding: '10px 20px', fontSize: 14 }}>
            Open Editor
          </Button>
        </div>

        {/* Quick Nav */}
        <nav className="doc-quicknav" aria-hidden>
          <ul>
            <li><button data-target="features-core">Core</button></li>
            <li><button data-target="features-advanced">Advanced</button></li>
            <li><button data-target="features-workflow">Workflow</button></li>
            <li><button data-target="top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Top</button></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

// Initialize observers for scroll highlights and animations
function initFeaturesObservers() {
  try {
    const navButtons = Array.from(document.querySelectorAll('.doc-quicknav button'));
    if (!navButtons.length) return;
    
    const targets = ['features-core', 'features-advanced', 'features-workflow', 'features-benefits', 'features-tips'];
    const sections = targets.map(id => document.getElementById(id)).filter(Boolean);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
      });
    }, { root: null, threshold: 0.45 });
    
    sections.forEach(s => io.observe(s));

    const animEls = document.querySelectorAll('[data-animate]');
    const animIo = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in-view'); });
    }, { threshold: 0.12 });
    
    animEls.forEach(el => animIo.observe(el));

    return () => { io.disconnect(); animIo.disconnect(); };
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => initFeaturesObservers());
}
