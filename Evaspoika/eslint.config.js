// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // _to_delete holds files staged for removal; they still reference modules
    // that moved, so they are kept out of both lint and typecheck.
    ignores: ['dist/*', '_to_delete/*'],
  },
]);
