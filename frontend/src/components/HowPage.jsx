import React, { useEffect } from 'react';
import './LandingPage.css';
import { Button } from './ui/button';

export default function HowPage({ onClose }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {}
  }, []);

  const scrollTo = (id) => {
    try {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {}
  };

  return (
    <div className="landing-root">
      <div className="landing-content">
        <div className="doc-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(124,58,237,0.9)', fontWeight: 800 }}>NeoGarden Guide</div>
              <h1 style={{ margin: '6px 0 0 0' }}>How It Works — Deep Walkthrough</h1>
              <p style={{ marginTop: 8 }} className="section-desc">A complete workflow: from drawing your land to planting and exporting — with troubleshooting and pro tips.</p>
            </div>
            <div>
              <Button size="sm" onClick={onClose}>Back to Home</Button>
            </div>
          </div>
        </div>

        <nav className="doc-quicknav" aria-hidden>
          <ul>
            <li><button data-target="how-steps" onClick={() => scrollTo('how-steps')}>Steps</button></li>
            <li><button data-target="how-protips" onClick={() => scrollTo('how-protips')}>Pro Tips</button></li>
            <li><button data-target="how-troubleshooting" onClick={() => scrollTo('how-troubleshooting')}>Troubleshooting</button></li>
            <li><button data-target="top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top</button></li>
          </ul>
        </nav>

        <div style={{ position: 'relative' }}>
          <div className="steps" id="how-steps">
            <div className="step-card" id="how-step-1">
              <div className="step-badge">1</div>
              <div className="step-body">
                <h4>Plan Your Area & Units</h4>
                <p>Start by selecting the unit system (metric or imperial). Enter an approximate area to help the app calculate plant density and spacing. If your site includes paths or patios, add ~10–20% extra area as buffer so plants are not pushed to the boundaries.</p>
                <ul className="mini-list">
                  <li><strong>Tip:</strong> If you only know dimensions, enter them and let the app calculate area for you.</li>
                  <li><strong>Pro:</strong> Create a quick hand sketch first — it speeds up placing major trees and circulation.</li>
                </ul>
              </div>
            </div>

            <div className="step-card" id="how-step-2">
              <div className="step-badge">2</div>
              <div className="step-body">
                <h4>Draw the Boundary</h4>
                <p>Click to add points around the perimeter. For curved edges, add more points then use the smoothing control. Use the "close" action to finish the polygon. The area calculator updates live.</p>
                <ol className="mini-list">
                  <li>Click points clockwise around the site.</li>
                  <li>Adjust points by dragging if the shape looks off.</li>
                  <li>Use the smoothing toggle to reduce sharp angles for a natural look.</li>
                </ol>
              </div>
            </div>

            <div className="step-card" id="how-step-3">
              <div className="step-badge">3</div>
              <div className="step-body">
                <h4>Place Hardscape & Layout Zones</h4>
                <p>Add paths, patios or lawn areas before mass-planting. Block out zones for functional uses (play, seating, service). These anchors help guide plant selection and grouping.</p>
              </div>
            </div>

            <div className="step-card" id="how-step-4">
              <div className="step-badge">4</div>
              <div className="step-body">
                <h4>Add Plants — Order & Spacing</h4>
                <p>Place large trees first to establish the vertical structure, then add mid-story shrubs, and finally groundcovers or perennials. Use the spacing helper in the Plant Library to preview mature spread and avoid long-term overcrowding.</p>
                <p><strong>Spacing heuristic:</strong> Plant centers should be separated by the plant's mature spread. The app can auto-distribute multiple copies inside a selected area.</p>
              </div>
            </div>

            <div className="step-card" id="how-step-5">
              <div className="step-badge">5</div>
              <div className="step-body">
                <h4>Adjust Visuals & Reality Settings</h4>
                <p>Use the realism slider to toggle foliage density and LOD (level of detail). Toggle shadows and time-of-day to validate sight-lines and shade patterns for outdoor rooms.</p>
              </div>
            </div>

            <div className="step-card" id="how-step-6">
              <div className="step-badge">6</div>
              <div className="step-body">
                <h4>Refine & Edit</h4>
                <p>Select plants to move, rotate or replace. Use the duplicate tool for repeating patterns. For precise placement use keyboard nudges (arrow keys) while a plant is selected.</p>
              </div>
            </div>

            <div className="step-card" id="how-step-7">
              <div className="step-badge">7</div>
              <div className="step-body">
                <h4>Save Iterations & Export</h4>
                <p>Use <em>Save As</em> to capture design variants. Exports produce JSON that contains layout, species ids and transform data — this can be imported back or used by collaborators/contractors.</p>
                <p className="muted">Example export contents: <code>{'{"plants":[{...}],"bounds":{...}}'}</code></p>
              </div>
            </div>
          </div>

          <section id="how-protips" style={{ marginTop: 22 }}>
            <h3>Pro Tips</h3>
            <ul className="mini-list">
              <li><strong>Massing:</strong> Group plants in 3s or 5s for natural composition — avoid singletons unless focal.</li>
              <li><strong>Visibility:</strong> Keep sight-lines clear to key features (entrances, seating) by pruning low branches or repositioning plants.</li>
              <li><strong>Edge Planting:</strong> Use lower-growing species at paths to avoid tripping hazards.</li>
              <li><strong>Backup:</strong> Keep periodic saves while making large changes — the Undo stack can be limited for very large designs.</li>
            </ul>
          </section>

          <section id="how-troubleshooting" style={{ marginTop: 22 }}>
            <h3>Troubleshooting & FAQ</h3>
            <div className="feature-card" style={{ marginBottom: 12 }}>
              <h4>Plants overlapping?</h4>
              <p className="feature-desc">Enable the spacing overlay, select an area and use <em>Auto-distribute</em> to evenly place multiple plants. To manually resolve issues, select and nudge or delete conflicting items.</p>
            </div>
            <div className="feature-card" style={{ marginBottom: 12 }}>
              <h4>Imported design shows missing species</h4>
              <p className="feature-desc">The JSON references species identifiers. If your local Plant Library is missing a matching ID, the app will show a placeholder. Re-add the species or remap the identifier in the Saved Designs modal.</p>
            </div>
            <div className="feature-card" style={{ marginBottom: 12 }}>
              <h4>Performance slows on large projects</h4>
              <p className="feature-desc">Lower the realism slider, hide foliage temporarily, or split very large sites into phased designs. Use the Performance Controls in the top bar.</p>
            </div>
            <div className="feature-card">
              <h4>Syncing to a backend</h4>
              <p className="feature-desc">If you configured server persistence, use the Save action to push to the server. The backend expects JSON in the same shape as exports; check the API docs (server README) for endpoint URLs and authentication if used.</p>
            </div>
          </section>
        </div>

        <div style={{ marginTop: 22 }}>
          <h3>Troubleshooting & FAQ</h3>
          <div className="feature-card" style={{ marginBottom: 12 }}>
            <h4>Plants overlapping?</h4>
            <p className="feature-desc">Use the selection tool to nudge or delete conflicts; use spacing hints to auto-distribute plants inside an area.</p>
          </div>
          <div className="feature-card" style={{ marginBottom: 12 }}>
            <h4>Imported design shows missing plants</h4>
            <p className="feature-desc">Open the Plant Library and replace any missing species; exported JSON references plant names — ensure your library contains them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Intersection observer to add 'in-view' and quick-nav active highlighting
function initDocObservers() {
  try {
    const navButtons = Array.from(document.querySelectorAll('.doc-quicknav button'));
    if (!navButtons.length) return;

    const targets = ['how-steps', 'how-protips', 'how-troubleshooting'];
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

// initialize when DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => initDocObservers());
}
