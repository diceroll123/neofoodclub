const CracoSwcPlugin = require("craco-swc");

module.exports = {
    plugins: [
        {
            plugin: CracoSwcPlugin,
            options: {
                swcLoaderOptions: {
                    jsc: {
                        parser: {
                            syntax: "ecmascript",
                            jsx: true,
                            dynamicImport: true,
                            exportDefaultFrom: true,
                        },
                        transform: {
                            react: {
                                runtime: "classic",
                                development: false,
                                throwIfNamespace: true,
                                importSource: "react",
                                pragma: "React.createElement",
                                pragmaFrag: "React.Fragment",
                                useBuiltIns: false,
                                useSpread: false,
                            },
                        },
                    },
                },
            },
        },
    ],
};
