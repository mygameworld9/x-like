import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bundleBackground() {
  try {
    await build({
      entryPoints: [join(__dirname, 'background.js')],
      bundle: true,
      outfile: join(__dirname, 'dist', 'background.js'),
      format: 'iife',
      platform: 'browser',
      target: 'chrome100',
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env': '{}',
        'global': 'globalThis',
      },
    });
    console.log('✓ Background script bundled successfully');
  } catch (error) {
    console.error('✗ Failed to bundle background script:', error);
    process.exit(1);
  }
}

bundleBackground();
