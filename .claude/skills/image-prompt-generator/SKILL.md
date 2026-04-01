# Image Prompt Generator

## Purpose
Generate detailed, production-ready prompts for AI image generators (Midjourney, DALL-E, Stable Diffusion, Flux, etc.). Produces copy-paste-ready prompts that create consistent, high-quality images for use in websites, marketing materials, and presentations.

## When to Use
- Client needs hero images, banners, or section backgrounds for a website
- Before/after comparison images (renovation, transformation, seasonal)
- Architectural visualization or community imagery
- Brand-consistent imagery when stock photos won't cut it
- Any scenario where the client needs specific imagery they can't photograph

## Output
Numbered, copy-paste-ready text prompts. Each prompt is a self-contained paragraph the user pastes directly into their image generator of choice.

## Prompt Structure

Every prompt follows this anatomy:

```
[STYLE/MEDIUM] + [SUBJECT] + [ENVIRONMENT/SETTING] + [LIGHTING] + [MOOD/ATMOSPHERE] + [TECHNICAL SPECS]
```

### 1. Style/Medium (lead with this)
Sets the overall look. Examples:
- "A photorealistic wide-angle shot of..."
- "A cinematic aerial photograph of..."
- "A warm, editorial-style photograph of..."
- "A hyperrealistic 3D render of..."
- "An architectural visualization of..."
- "A watercolor illustration of..."

### 2. Subject (the main thing)
Describe the primary subject with specific, concrete details:
- **Materials**: "warm honey-toned sandstone", "brushed steel", "weathered cedar"
- **Condition**: "freshly painted", "moss-covered", "immaculately maintained"
- **Specific objects**: Name every important element in the scene
- **Text/signage**: Specify exact text in quotes (note: most generators struggle with text)

### 3. Environment/Setting
Ground the subject in a specific place and time:
- **Location type**: "suburban HOA community", "downtown plaza", "coastal boardwalk"
- **Time of day**: "golden hour", "blue hour", "high noon", "overcast morning"
- **Season**: "early spring with cherry blossoms", "peak autumn foliage"
- **Weather**: "after a rain shower with wet pavement reflections", "light morning fog"

### 4. Lighting
Lighting makes or breaks the image:
- **Direction**: "warm directional light from the left", "backlit with rim lighting"
- **Quality**: "soft diffused light", "harsh dramatic shadows", "even overcast lighting"
- **Artificial sources**: "warm LED path lights casting soft pools", "neon signage glow"
- **Contrast**: "warm artificial lights against cool blue hour sky"

### 5. Mood/Atmosphere
Tell the generator how the image should *feel*:
- "The mood is welcoming, elegant, and aspirational"
- "The atmosphere is abandoned and foreboding"
- "The feeling is energetic and hopeful — transformation in progress"
- "Cozy, intimate, community-oriented"

### 6. Technical Specs (end with this)
Camera and post-processing details:
- **Camera**: "Shot on a full-frame camera", "drone photography"
- **Lens**: "24mm wide angle", "85mm portrait", "35mm street photography"
- **Depth of field**: "shallow depth of field with bokeh", "everything in sharp focus"
- **Color grading**: "cinematic warm tones", "desaturated and moody", "vibrant and saturated"
- **Effects**: "slight lens bloom on lights", "gentle vignetting", "film grain"

## Process

### Step 1: Gather Context
Before writing prompts, understand:
- What is the image for? (hero banner, comparison set, gallery, social media)
- What brand colors/aesthetic should it match?
- What specific elements must be included?
- What mood/feeling should it evoke?
- Will these images be used together? (consistency matters for sets)

### Step 2: Plan the Set
If generating multiple related prompts (e.g., before/after series):
- Maintain consistent camera angle, lens, and framing across all prompts
- Use the same location/setting description as a base
- Vary only the elements that change (condition, lighting, mood)
- Number them clearly and label what each represents

### Step 3: Write the Prompts
- Write each prompt as a single flowing paragraph (most generators work best this way)
- Be specific and concrete — "warm honey-toned sandstone" not "nice stone"
- Include negative space descriptions — what's NOT in the image matters too
- Front-load the most important details (generators weight early words more heavily)
- Keep each prompt under 300 words (diminishing returns beyond that)

### Step 4: Adaptation Notes
Add brief notes for platform-specific adjustments:
- **Midjourney**: Add `--ar 16:9` for landscape, `--v 6` for latest version, `--style raw` for photorealism
- **DALL-E**: Works well with natural language, no special flags needed
- **Stable Diffusion**: May need negative prompts ("no text, no watermark, no blur")
- **Flux**: Handles longer, more detailed prompts well

## Quality Checklist
- [ ] Each prompt can be copied and pasted with zero editing
- [ ] Prompts are specific enough to produce consistent results across regenerations
- [ ] Camera angle and framing are consistent across related prompts
- [ ] Brand colors/aesthetic are referenced where appropriate
- [ ] Mood and lighting match the intended use case
- [ ] Technical specs are realistic and compatible with AI generators
- [ ] No ambiguous descriptions that could be interpreted multiple ways

## Common Prompt Patterns

### Before/After Series (3 prompts)
1. **Before** — Neglected/damaged state. Cold lighting, desaturated colors, overcast sky, visible deterioration
2. **Mid-transformation** — Split composition showing old and new side by side. Golden hour, warm light on the restored side, cool shadow on the unfinished side
3. **After** — Pristine/completed state. Blue hour with warm artificial lighting, rich colors, inviting atmosphere

### Seasonal Series (4 prompts)
Same location, same angle, four seasons. Vary: foliage, sky color, lighting angle, ground cover, clothing on any people

### Time-of-Day Series (3 prompts)
Same location: morning (soft, misty), midday (bright, active), evening (warm, atmospheric)

### Aerial/Ground Pair (2 prompts)
Same location from two perspectives: drone shot for context, ground-level shot for detail and immersion

## Tips
- The word "photorealistic" at the start dramatically changes output quality
- Specifying exact camera/lens (e.g., "Sony A7R IV, 24mm f/1.4") can improve realism
- "Cinematic color grading" is a magic phrase — generators know what this means
- Avoid asking for text in images — most generators can't render it reliably
- For consistency across a set, copy your base description and only modify the changing elements
- Include "no people" or "no faces" if you want empty scenes (avoids uncanny valley issues)
