const { fusebox, pluginLink } = require('fuse-box')

fusebox({
    webIndex: { template: './src/index.html' },
    entry: './src/index.ts',
    watch: true,
    devServer: { httpServer: { port: 8000 }, hmrServer: { port: 9999 } },
    plugins: [
        pluginLink(/\.csv/, { useDefault: true })
    ]
}).runDev()