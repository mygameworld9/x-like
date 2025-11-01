#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, 'dist');

// 确保dist目录存在
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Bundle background.js with esbuild (includes supabase dependencies)
console.log('Bundling background.js with dependencies...');
try {
  execSync('node bundle-background.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to bundle background.js');
  process.exit(1);
}

// 2. Copy content_script.js and manifest.json
const filesToCopy = [
  'content_script.js',
  'manifest.json'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${file} to dist/`);
  } else {
    console.error(`✗ Source file ${file} not found`);
  }
});

console.log('\nChrome extension files ready!');
console.log('You can now load the extension from the dist/ directory in Chrome.');
