module.exports = {
  root: true,
  env: {
    es2021: true,
    jasmine: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  plugins: ["jsdoc"],
  extends: ["eslint:recommended", "plugin:jsdoc/recommended"],
  rules: {
    "jsdoc/require-param-description": "error",
    "jsdoc/require-jsdoc": ["error", {require: {FunctionDeclaration: true}}],
    "jsdoc/require-returns-description": "error"
  }
}
