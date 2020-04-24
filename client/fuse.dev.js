const { fusebox, pluginLink } = require('fuse-box')

fusebox({
    target: 'browser',
    webIndex: { template: './src/index.html' },
    entry: './src/index.ts',
    watch: true,
    cache: { strategy: 'memory', enabled: true },
    devServer: { httpServer: { port: 8000 }, hmrServer: { port: 9999 } },
    plugins: [
        pluginLink(/\.csv/, { useDefault: true })
    ],
    hmr: { enabled: true }
}).runDev()