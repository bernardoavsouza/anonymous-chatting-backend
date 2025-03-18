import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintPluginPrettier,
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  { files: ['src/**.ts'] },
);
