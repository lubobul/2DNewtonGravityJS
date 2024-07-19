import * as esbuild from 'esbuild';

const context = await esbuild.context({
    entryPoints: ['index.ts', "index.html", "styles.css"],
    format: "esm",
    bundle: true,
    sourcemap: true,
    //outfile: 'dist/bundle.js',
    outdir: 'dist',
    loader: {
        ".html": "copy",
        ".css": "copy",
    },
    tsconfig: "./tsconfig.json",
    plugins: [{
        name: 'watch-plugin',
        setup(build) {
            build.onEnd(result => {
                console.log("Build finished.");
                if(result.errors && result.errors.length){
                    console.error("Build finished with errors: ", result.errors);
                }
            });
        }
    }]
});

await context.watch();
const serve = await context.serve({port: 8000});
console.log("Serving on: ",  `http://${serve.host}:${serve.port}`);