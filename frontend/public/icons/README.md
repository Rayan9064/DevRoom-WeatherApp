# PWA Icon Generation Instructions

## ✅ Automated Generation (Recommended)

Icons are now **automatically generated** during the build process!

### Quick Start
```bash
# Generate all icons from source
npm run generate-icons

# Or build (includes icon generation)
npm run build
```

### Source Icon
The icons are generated from `public/icon-source.svg`. To customize:
1. Edit `public/icon-source.svg` (current: weather-themed icon)
2. Run `npm run generate-icons`
3. All 8 sizes are created automatically in `public/icons/`

---

## Generated Icons

The script automatically creates these sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

---

## Manual Generation (Alternative)

### Option 1: Using Online Tools
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon (at least 512x512px recommended)
3. Download the generated icon pack
4. Extract to `public/icons/` directory

### Option 2: Using ImageMagick (CLI)
```bash
# Install ImageMagick first
# Then convert your source icon:

convert source-icon.png -resize 72x72 public/icons/icon-72x72.png
convert source-icon.png -resize 96x96 public/icons/icon-96x96.png
convert source-icon.png -resize 128x128 public/icons/icon-128x128.png
convert source-icon.png -resize 144x144 public/icons/icon-144x144.png
convert source-icon.png -resize 152x152 public/icons/icon-152x152.png
convert source-icon.png -resize 192x192 public/icons/icon-192x192.png
convert source-icon.png -resize 384x384 public/icons/icon-384x384.png
convert source-icon.png -resize 512x512 public/icons/icon-512x512.png
```

### Option 3: Using Figma/Photoshop
1. Create or import your icon design
2. Export at each required size
3. Save as PNG with transparency
4. Place in `public/icons/` directory

## Design Recommendations

- Use a simple, recognizable design
- Ensure good contrast for both light and dark backgrounds
- Keep important elements centered (safe area)
- Test how it looks at small sizes (72x72)
- Weather-related icon recommended (cloud, sun, etc.)

## Temporary Placeholder

Until you generate proper icons, you can use a weather emoji or text-based icon as a placeholder.
