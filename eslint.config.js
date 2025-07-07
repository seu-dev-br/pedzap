const babelParser = require('@babel/eslint-parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = [
  {
    ignores: ["node_modules/**", "frontend/node_modules/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [require.resolve("@babel/preset-react")],
        },
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        process: "readonly"
      }
    },
    plugins: {
      "unused-imports": unusedImports,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
      ],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  {
    files: ["waSession.js"],
    rules: {
      "react-hooks/rules-of-hooks": "off"
    }
  }
]; 