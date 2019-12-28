const { fusebox, pluginLink } = require('fuse-box')

fusebox({
    webIndex: { template: './src/index.html' },
    entry: './src/index.ts',
    plugins: [
        pluginLink(/\.csv/, { useDefault: true })
    ],
}).runProd()