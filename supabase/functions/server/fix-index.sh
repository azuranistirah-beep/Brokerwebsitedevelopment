#!/bin/bash
# Script to fix corrupted index.tsx by removing lines 842-1108
# Usage: Run this in /supabase/functions/server/ directory

# Backup original
cp index.tsx index.tsx.backup

# Combine clean parts: lines 1-841 + lines 1109-end
head -n 841 index.tsx > index-temp.tsx
tail -n +1109 index.tsx >> index-temp.tsx

# Replace original
mv index-temp.tsx index.tsx

echo "✅ Fixed! Removed 267 lines of corrupt code (lines 842-1108)"
echo "📄 Backup saved as index.tsx.backup"
