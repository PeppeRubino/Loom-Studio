import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import type { Config } from 'tailwindcss';
import type { DesignTokens } from './src/lib/theme';

const tokens = JSON.parse(
  readFileSync(new URL('./src/lib/theme-values.json', import.meta.url), 'utf-8')
) as DesignTokens;

const { spacing, colors } = tokens;

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: colors.PANEL,
        panel2: colors.PANEL_2,
        border: colors.BORDER,
        accent: colors.ACCENT,
        muted: colors.MUTED,
      },
      spacing: {
        s1: `${spacing.s1}px`,
        s2: `${spacing.s2}px`,
        s3: `${spacing.s3}px`,
        s4: `${spacing.s4}px`,
        s5: `${spacing.s5}px`,
        s6: `${spacing.s6}px`,
      },
    },
  },
  plugins: [],
};

export default config;
