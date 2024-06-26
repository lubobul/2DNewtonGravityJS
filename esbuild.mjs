import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    sourcemap: true,
    outfile: 'out/bundle.js',
});