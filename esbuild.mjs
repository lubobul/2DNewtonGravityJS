import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['gravity/index.ts'],
    bundle: true,
    sourcemap: true,
    outfile: 'bundle.js',
});