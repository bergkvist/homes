const { fusebox, pluginLink } = require('fuse-box')

fusebox({
    webIndex: { template: './src/index.html' },
    entry: './src/index.ts',
    target: 'browser',
    plugins: [
        pluginLink(/\.csv/, { useDefault: true })
    ],
}).runProd({ uglify: true, target: 'ES6', screwIE: true })