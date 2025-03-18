import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ["**/node_modules/**", "**/dist/**", "**/build/**"] },
    { files: ["**/*.{js,mjs,cjs,jsx}"] },
    pluginJs.configs.recommended,
    {
        ...pluginReact.configs.flat.recommended,
        settings: {
            react: {
                version: "18.3.1",
            },
        },
    },

    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.es2021,
                ...globals.node,
            },
        },
        settings: {
            "import/resolver": {
                node: {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            },
        },
        ...pluginJs.configs.recommended,
    },

    {
        files: ["eslint.config.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
