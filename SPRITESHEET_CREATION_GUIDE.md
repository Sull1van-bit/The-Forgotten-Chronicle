# Spritesheet Creation Guide

## 🎨 How to Create Spritesheet from GIF

### Method 1: Using Online Tools (Easiest)

#### Option A: EZGif
1. Go to https://ezgif.com/gif-to-sprite
2. Upload Eugene's `stand.gif`
3. Click "Upload"
4. Set options:
   - Layout: **Horizontal**
   - Background: **Transparent**
5. Click "Convert to Sprite Sheet"
6. Download as PNG
7. Rename to `stand-spritesheet.png`

#### Option B: Piskel (Free Web App)
1. Go to https://www.piskelapp.com/
2. Import GIF: File → Import → Load from file
3. Export: File → Export → PNG (Spritesheet)
4. Layout: **Horizontal strip**
5. Download and rename

### Method 2: Using Photoshop/GIMP

#### Photoshop
1. Open `stand.gif` in Photoshop
2. Window → Timeline (to see all frames)
3. File → Export → Quick Export as PNG
4. Arrange frames horizontally:
   - Create new canvas: 130x26 pixels (26px × 5 frames)
   - Copy each frame side by side
5. Save as `stand-spritesheet.png`

#### GIMP
1. Open `stand.gif` in GIMP
2. Filters → Animation → Unoptimize
3. Image → Flatten Image
4. Arrange frames horizontally using canvas size
5. Export as PNG with transparency

### Method 3: Using Command Line (ImageMagick)

```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert GIF to horizontal spritesheet
magick convert stand.gif -coalesce +append stand-spritesheet.png

# If you need specific size (26x26 per frame):
magick convert stand.gif -coalesce -resize 26x26 +append stand-spritesheet.png
```

### Method 4: Using Node.js Script

Create a script `create-spritesheet.js`:

```javascript
const sharp = require('sharp');
const gifFrames = require('gif-frames');
const fs = require('fs');

async function createSpritesheet(gifPath, outputPath) {
  // Extract frames from GIF
  const frameData = await gifFrames({ url: gifPath, frames: 'all' });
  
  const frames = [];
  for (let frame of frameData) {
    const buffer = await frame.getImage();
    frames.push(buffer);
  }
  
  // Combine frames horizontally
  const composites = frames.map((frame, index) => ({
    input: frame,
    left: index * 26, // Frame width
    top: 0
  }));
  
  await sharp({
    create: {
      width: 26 * frames.length,
      height: 26,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(composites)
  .png()
  .toFile(outputPath);
  
  console.log(`Created spritesheet: ${outputPath}`);
}

// Usage
createSpritesheet(
  'src/assets/characters/eugene/stand.gif',
  'src/assets/characters/eugene/stand-spritesheet.png'
);
```

Install dependencies:
```bash
npm install sharp gif-frames
```

Run:
```bash
node create-spritesheet.js
```

---

## 📏 Spritesheet Specifications

### Eugene Stand Animation
```
Total Size: 130 × 26 pixels
Frame Count: 5
Frame Size: 26 × 26 pixels each
Layout: [Frame1][Frame2][Frame3][Frame4][Frame5]
Format: PNG with alpha transparency
Background: Transparent
```

### Frame Layout
```
+------+------+------+------+------+
|  F1  |  F2  |  F3  |  F4  |  F5  |
| 26px | 26px | 26px | 26px | 26px |
+------+------+------+------+------+
         Total Width: 130px
         Height: 26px
```

---

## ✅ Verification Checklist

After creating the spritesheet, verify:

- [ ] File name: `stand-spritesheet.png`
- [ ] Location: `src/assets/characters/eugene/`
- [ ] Dimensions: 130 × 26 pixels (use image info/properties)
- [ ] 5 frames visible when viewing at 100% zoom
- [ ] Background is transparent (not white/black)
- [ ] Each frame is 26 × 26 pixels
- [ ] Frames are arranged horizontally (left to right)
- [ ] No gaps between frames
- [ ] Image quality is crisp (not blurry)

---

## 🧪 Testing the Spritesheet

### Quick Test in Browser
1. Open `stand-spritesheet.png` in browser
2. Zoom to 400% to see individual frames clearly
3. You should see 5 distinct Eugene poses side by side

### Test in Game
1. Place `stand-spritesheet.png` in correct folder
2. Run game: `npm run dev`
3. Select Eugene character
4. Stand still in game
5. Eugene should animate smoothly (idle animation)

---

## 🐛 Troubleshooting

### Problem: Animation doesn't show
**Solution:** Check file path and name exactly matches:
```
src/assets/characters/eugene/stand-spritesheet.png
```

### Problem: Only shows one frame
**Solutions:**
- Verify frameCount in metadata: `frameCount: 5`
- Check spritesheet width: Should be 130px (26 × 5)
- Ensure frames are horizontal (not vertical)

### Problem: Frames are cut off
**Solutions:**
- Verify frameWidth: `frameWidth: 26`
- Check each frame is exactly 26 pixels wide
- No overlapping frames

### Problem: Animation is choppy
**Solution:** Adjust FPS in metadata:
```javascript
fps: 8  // Slower, smoother
fps: 12 // Faster
```

---

## 💡 Tips

1. **Keep original GIF** - Don't delete stand.gif, keep as backup
2. **Use PNG format** - Better quality and transparency than GIF
3. **Check alignment** - Frames must be perfectly aligned
4. **Test early** - Create spritesheet and test before making more
5. **Consistent sizing** - All frames must be same size (26x26)

---

## 🔄 Creating More Spritesheets

Once Eugene stand works, you can create spritesheets for:

### Eugene
- [ ] stand-spritesheet.png (5 frames) ✅ Priority
- [ ] walk-up-spritesheet.png (4 frames)
- [ ] walk-down-spritesheet.png (4 frames)
- [ ] walk-left-spritesheet.png (4 frames)
- [ ] walk-right-spritesheet.png (4 frames)
- [ ] eat-spritesheet.png (frames vary)

### Then expand to:
- [ ] Louise spritesheets
- [ ] Alex spritesheets

---

## 📦 File Naming Convention

```
[character]-[action]-spritesheet.png

Examples:
eugene-stand-spritesheet.png
eugene-walk-up-spritesheet.png
louise-stand-spritesheet.png
alex-eat-spritesheet.png
```

Or simpler:
```
stand-spritesheet.png  (inside eugene folder)
walk-up-spritesheet.png
```

---

## 🎯 Quick Start

**Fastest method to get started:**

1. Use EZGif online tool
2. Upload `stand.gif`
3. Convert to horizontal sprite
4. Download PNG
5. Rename to `stand-spritesheet.png`
6. Place in `src/assets/characters/eugene/`
7. Test in game!

**Total time:** ~2 minutes

---

**Need Help?** 
- Check existing GIF frame count: Import in image editor
- Measure frame dimensions: Use image properties
- Verify layout: Open PNG in browser and zoom in

Ready to create your spritesheet! 🎨

