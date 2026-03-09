const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/content.js'],   // Your source files go in 'src' folder
  bundle: true,
  outfile: 'dist/content.js',        // Output bundled file here
  minify: false,
  sourcemap: true,
  format: 'iife',                   // Immediately Invoked Function Expression for browser
  target: ['chrome58'],             // Target Chrome version (adjust if needed)
}).catch(() => process.exit(1));
