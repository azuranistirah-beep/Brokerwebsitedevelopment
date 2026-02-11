# Cache headers for optimal performance and cache busting

# HTML files - no cache (always get fresh)
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0

# JavaScript and CSS - cache with versioning
/assets/*.js
  Cache-Control: public, max-age=31536000, immutable

/assets/*.css
  Cache-Control: public, max-age=31536000, immutable

# Images - cache for 1 year
/assets/*.png
  Cache-Control: public, max-age=31536000, immutable

/assets/*.jpg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.svg
  Cache-Control: public, max-age=31536000, immutable

/assets/*.webp
  Cache-Control: public, max-age=31536000, immutable

# Main entry point - no cache
/src/main.tsx
  Cache-Control: no-cache, no-store, must-revalidate

# Fonts - cache for 1 year
/fonts/*
  Cache-Control: public, max-age=31536000, immutable

# Favicon - cache for 1 week
/vite.svg
  Cache-Control: public, max-age=604800
