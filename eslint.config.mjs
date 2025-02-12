import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended, // Add ESLint recommended rules
  reactRecommended, // Add React recommended rules
  ...compat.extends("next/core-web-vitals", "next/typescript"), // Add Next.js rules
  {
    rules: {
      'react/no-unescaped-entities': 'off', // Disable the rule
    },
  },
];