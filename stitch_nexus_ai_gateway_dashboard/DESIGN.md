---
name: Aetheric Minimalist
colors:
  surface: '#f9f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f9f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f5'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e4'
  on-surface: '#1a1c1d'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3132'
  inverse-on-surface: '#f0f0f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#5f5e60'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe1'
  on-secondary-container: '#636264'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9fb'
  on-background: '#1a1c1d'
  surface-variant: '#e2e2e4'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.022em
  display-lg:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.021em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.011em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.011em
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.007em
  body-lg:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.011em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.011em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-tablet: 40px
  margin-desktop: 80px
  section-gap: 160px
---

## Brand & Style
The design system is rooted in the philosophy of "Architectural Minimalism." It seeks to evoke a sense of quiet power, precision, and effortless sophistication, drawing direct inspiration from high-end hardware and premium editorial layouts. 

The aesthetic prioritizes expansive whitespace and a meticulous hierarchy, ensuring that every element serves a functional and aesthetic purpose. The style is a hybrid of **Modern Corporate** and **Glassmorphism**, where surfaces feel like solid physical materials—machined aluminum, polished glass, and dense paper—rather than flickering pixels. The goal is to create a digital environment that feels calm, premium, and inherently trustworthy.

## Colors
The palette is intentionally restrained to maximize the impact of content and the singular accent.
- **Primary (Nexus Blue):** Reserved strictly for high-priority actions, links, and active states. It acts as a beacon of interactivity within a monochrome environment.
- **Secondary (Ink Black):** Used for primary text and structural elements that require maximum contrast.
- **Neutral (Cloud Gray):** Provides soft transitions and subtle containment for secondary surfaces.
- **Surface Glass:** A semi-transparent white used for navigation bars and floating overlays, requiring a `backdrop-filter: blur(20px)` to achieve the "architectural glass" effect.

## Typography
The typography system utilizes **Inter** to achieve a clean, systematic appearance. Large display sizes feature tight tracking and bold weights to create an "editorial" feel, while body text uses a slightly more generous line height and tracking for optimal legibility. Labels are frequently set in uppercase with increased letter spacing to provide a sophisticated, technical contrast to the fluid body copy.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for desktop to maintain optimal line lengths and white space. 
- **Desktop:** 12-column grid, 1200px max-width, 24px gutters.
- **Tablet:** 8-column grid, fluid width, 40px side margins.
- **Mobile:** 4-column grid, fluid width, 20px side margins.

A generous vertical "rhythm" is essential; use a 160px gap between major sections to allow the design to "breathe," mirroring the expansive feel of premium retail environments.

## Elevation & Depth
Depth is created through **Glassmorphism** and atmospheric layering rather than traditional drop shadows.
- **Level 0 (Base):** Pure white background (#FFFFFF).
- **Level 1 (Sub-surface):** Soft gray (#F5F5F7) used to define inset areas or background sections.
- **Level 2 (Glass):** Floating containers using `rgba(255, 255, 255, 0.72)` with a 20px - 40px background blur. These surfaces should have a very thin 0.5px border in `rgba(0,0,0,0.1)` to define the edge.
- **Shadows:** When used, shadows must be "Ambient"—very large blur (60px+), very low opacity (3-5%), and no spread, creating a soft glow rather than a hard lift.

## Shapes
The shape language is defined by "Squircle"-inspired curves. Standard components use a 0.5rem (8px) radius, but primary content containers and cards use a significantly larger **24px to 32px** radius (`rounded-xl` and above) to evoke the industrial design of premium hardware. Buttons should be either fully rounded (pill-shaped) or match the 12px container radius.

## Components
- **Buttons:** Primary buttons are pill-shaped, solid Nexus Blue with white text. Secondary buttons are ghost-style with a thin border or a subtle gray fill.
- **Cards:** Large-scale containers with 24px+ corner radius. Use background imagery that bleeds to the edges, with text overlays utilizing the Glassmorphism effect for legibility.
- **Input Fields:** Minimalist lines or very soft gray fills (#F5F5F7). Focus states transition the border or a subtle bottom-glow to Nexus Blue.
- **Chips:** Small, pill-shaped elements with low-contrast backgrounds (#EDEDED) and medium-weight labels.
- **Lists:** Clean, borderless rows separated by expansive whitespace or ultra-thin 0.5px dividers.
- **Iconography:** Use "thin" or "light" weight linear icons to maintain the precise, airy feel of the typography.