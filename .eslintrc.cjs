module.exports = {
  root: true,
  env: {
    es2020: true,
    jasmine: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module"
  },
  plugins: ["jsdoc"],
  extends: ["eslint:recommended", "plugin:jsdoc/recommended"],
  rules: {
    "jsdoc/require-jsdoc": ["error", {require: {FunctionDeclaration: true}}]
  }
}
