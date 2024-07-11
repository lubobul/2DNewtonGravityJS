import * as esbuild from 'esbuild';
// import fs from 'node:fs'
//
// const myCustomPlugin = {
//     name: 'my-custom-plugin',
//     setup(build) {
//         build.onLoad({ filter: /\.ts$/ }, async (args) => {
//             const contents = await fs.promises.readFile(args.path, 'utf8');
//             const transformedContents = addGlobalAssignments(contents);
//             return { contents: transformedContents };
//         });
//
//     },
// };
//
// function addGlobalAssignments(code) {
//     // Parse the code using an AST parser (e.g., @babel/parser)
//     // Identify exported functions and add assignment statements
//     // Example: export function myFunction() { ... } -> window.myFunction = myFunction;
//     // Modify the code accordingly
//     // ...
//
//     console.log(code);
//
//     // For demonstration purposes, let's assume we have a simple regex-based approach:
//     const modifiedCode = code.replace(
//         /export\s+function\s+(\w+)\s*\(/g,
//         'window.$1 = $1('
//     );
//
//     return modifiedCode;
// }

await esbuild.build({
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
    // plugins: [myCustomPlugin],
});