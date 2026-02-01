import rawTokens from './theme-values.json';

export interface SpacingTokens {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
}

export interface RadiusTokens {
  small: number;
  medium: number;
  large: number;
}

export interface ColorTokens {
  BG: string;
  PANEL: string;
  PANEL_2: string;
  BORDER: string;
  TEXT: string;
  MUTED: string;
  FAINT: string;
  ACCENT: string;
  ACCENT_INK: string;
  ACCENT_SOFT: string;
  SUCCESS: string;
  WARNING: string;
  DANGER: string;
  INFO: string;
}

export interface TypographyTokens {
  h1: number;
  h2: number;
  body: number;
  caption: number;
  mono: number;
}

export interface DesignTokens {
  spacing: SpacingTokens;
  radius: RadiusTokens;
  colors: ColorTokens;
  typography: TypographyTokens;
}

const parsedTokens = rawTokens as unknown as DesignTokens;

export const designTokens = parsedTokens;

export type DesignTokensShape = DesignTokens;
export type Spacing = SpacingTokens;
export type Radius = RadiusTokens;
export type Colors = ColorTokens;
export type Typography = TypographyTokens;

export const spacing = designTokens.spacing;
export const radius = designTokens.radius;
export const colors = designTokens.colors;
export const typography = designTokens.typography;
