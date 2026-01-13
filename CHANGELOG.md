# Changelog

- Add a TypeScript-based `typecheck` script for JS checking.
- Add ESLint with the jsdoc plugin and a default lint script.
- Add a TypeScript build script that emits compiled JS to `build/`.
- Consolidate TypeScript build/typecheck into a single `tsconfig.json`.
- Publish only build output and type declarations.
- Add Jasmine tests and a peak flow config for lint, typecheck, and test.
- Fix default window width resolution in non-Expo React Native.
- Bump `@types/react` to align with React Native peer requirements.
- Add a `release:patch` script for publishing patch releases.
- Adjust TypeScript config to avoid React Native DOM type conflicts.
- Enforce JSDoc descriptions for params and returns.
- Avoid referencing `window` directly in typechecked JS.
- Push `master` during patch releases.
