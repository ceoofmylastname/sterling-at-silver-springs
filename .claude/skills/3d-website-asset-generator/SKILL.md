# 3D Website Asset Generator

## Purpose
Generate production-ready Three.js 3D animated assets for embedding in websites. Specializes in scroll-controlled transformation animations that show before/after states with smooth interpolation.

## When to Use
- Client wants an interactive 3D element on their website
- Before/after transformation animations (renovation, restoration, seasonal change)
- Architectural or environmental 3D scenes
- Scroll-driven or slider-driven interactive experiences
- Hero section showpieces that demonstrate quality/transformation

## Output
A single self-contained HTML file with embedded CSS and JavaScript. No build tools, no dependencies to install — just open in a browser or embed via iframe.

## Tech Stack
- **Three.js** (v0.160.0) via CDN importmap (ES modules)
- **Pure CSS** for UI overlays (progress bar, labels, controls)
- **Vanilla JavaScript** for interaction logic
- No GSAP, no React, no build step

## Phase 1: Scene Brief

Before writing any code, define:

1. **Subject** — What is being shown? (building entrance, park, streetscape, interior)
2. **Transformation** — What changes? (neglected → pristine, empty → furnished, day → night)
3. **Key Elements** — List every object in the scene:
   - Static elements (ground plane, sky, background structures)
   - Transforming elements (objects that change appearance, grow, shrink, appear, disappear)
   - Lighting elements (fixtures, ambient light, atmospheric effects)
   - Particle effects (fireflies, dust, sparkles, rain)
4. **Color Palette** — Match the client's brand colors for UI elements
5. **Interaction Model** — How does the user control the transformation?
   - Scroll-driven (scroll position maps to progress 0→1)
   - Slider-driven (draggable slider)
   - Auto-play (oscillates automatically)
   - All three (recommended — let user choose)

## Phase 2: Scene Architecture

Structure the Three.js scene with these components:

```
Scene
├── Camera (PerspectiveCamera, slow auto-orbit)
├── Lighting
│   ├── Ambient Light (intensity lerps with progress)
│   ├── Directional Light (sun/moon, color shifts)
│   └── Point Lights (fixtures, lerp color/intensity)
├── Ground
│   ├── Ground Plane (color lerps)
│   └── Path/Walkway (material lerps)
├── Primary Structures
│   ├── Main objects (pillars, walls, buildings)
│   └── Signage (text geometry or textured planes)
├── "Before" Elements (visible at progress=0, fade/shrink by progress=1)
│   ├── Weeds, debris, damage indicators
│   └── Broken/flickering lights
├── "After" Elements (invisible at progress=0, grow/fade in by progress=1)
│   ├── Landscaping, flowers, manicured elements
│   └── Path lights, decorative elements
└── Particle Systems
    ├── "Before" particles (dust, insects)
    └── "After" particles (fireflies, golden sparkles)
```

## Phase 3: Transformation Logic

All transformations are driven by a single `progress` variable (0.0 to 1.0):

```javascript
function updateScene(progress) {
  // 1. Material color lerps (dirty → clean)
  material.color.lerpColors(colorBefore, colorAfter, progress);

  // 2. Scale transitions (weeds shrink, bushes grow)
  weed.scale.setScalar(Math.max(0, 1 - progress * 2));      // gone by 50%
  bush.scale.setScalar(Math.max(0, (progress - 0.3) / 0.7)); // starts at 30%

  // 3. Opacity transitions
  mesh.material.opacity = progress; // or 1 - progress for disappearing

  // 4. Light transitions
  light.intensity = THREE.MathUtils.lerp(0.2, 1.0, progress);
  light.color.lerpColors(coldColor, warmColor, progress);

  // 5. Position animations (lights rising, elements shifting)
  pathLight.position.y = progress * targetHeight;

  // 6. Special effects (flickering at low progress)
  if (progress < 0.3) {
    light.intensity *= 0.5 + Math.random() * 0.5; // flicker
  }
}
```

## Phase 4: Interaction & UI

### Controls
1. **Scroll listener** — Map `window.scrollY` to progress (0→1)
2. **Slider** — Range input overlay, synced with scroll position
3. **Auto-play toggle** — Sine wave oscillation: `progress = (Math.sin(time) + 1) / 2`
4. **Play/Pause button** — Toggle auto-play

### UI Overlay
- Progress bar at the bottom showing current state
- State labels that change: "Before Label" → "Transitioning..." → "After Label"
- Minimal, semi-transparent controls that don't obstruct the 3D view
- Brand-colored UI elements

### Page Structure
```html
<!-- Make page tall enough to scroll through the transformation -->
<body style="height: 400vh">
  <div id="canvas-container" style="position: fixed; inset: 0">
    <!-- Three.js canvas renders here -->
  </div>
  <div id="ui-overlay">
    <!-- Progress bar, slider, labels, controls -->
  </div>
</body>
```

## Phase 5: Quality Checklist

- [ ] File opens in browser with no errors (check DevTools console)
- [ ] Transformation is smooth from 0% to 100% with no visual glitches
- [ ] All three interaction modes work (scroll, slider, auto-play)
- [ ] Performance: maintains 60fps on mid-range hardware
- [ ] Responsive: works on mobile viewports (touch scroll)
- [ ] Colors match the client's brand palette
- [ ] No z-fighting (overlapping geometry flickering)
- [ ] Particle effects enhance but don't overwhelm
- [ ] Labels and UI text are readable
- [ ] Scene looks good at both extremes (0% and 100%) and mid-states

## Embedding in a Website

The output HTML file can be embedded via iframe:
```html
<iframe src="3d-asset.html" width="100%" height="600" frameborder="0"></iframe>
```

Or the `<script>` and `<canvas>` sections can be extracted and placed directly into a page.

## Tips
- Keep geometry simple (BoxGeometry, CylinderGeometry, SphereGeometry) — stylized looks better than failed realism in basic Three.js
- Use `MeshStandardMaterial` for objects that need to respond to lighting changes
- Add subtle camera auto-orbit (`camera.position.x = Math.sin(time * 0.1) * radius`) for a living feel
- Stars/sky add depth even to ground-level scenes
- Test on mobile — touch scrolling behaves differently than desktop
