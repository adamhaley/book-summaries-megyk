# PDR: Megyk Books – UI Framework Pivot & Consolidation
# Purpose:
# Migrate existing web-only Mantine UI app into a unified
# cross-platform Expo app using:
# - NativeWind (styling)
# - GlueStack UI (component + design system)
# - React Native Web (web target)
# - Expo (native target)
#
# Goal:
# One shared UI codebase across Web, iOS, Android.

===========================================================
1. TECHNOLOGY STACK
===========================================================

Frontend:
- Expo (latest)
- React Native (latest)
- React Native Web
- NativeWind (Tailwind-compatible styling for RN)
- GlueStack UI (design system + components)

Development Tools:
- TypeScript
- Expo Router (preferred)
- AI assistants (Claude Code / Cursor)

Theming:
- GlueStack design tokens (colors, radii, spacing)
- NativeWind for layout & utility classes

===========================================================
2. MIGRATION SCOPE
===========================================================

We are replacing:
- Mantine UI (web-only)
- Mantine theming system
- Mantine layout components
- DOM-based components (div, span, etc.)

With:
- React Native primitives (View, Text, Pressable)
- GlueStack UI components where applicable
- NativeWind class-based styling
- Shared UI layer for both web + native

===========================================================
3. CORE REQUIREMENTS
===========================================================

3.1 Unify UI components so they render on BOTH:
- Web (via React Native Web)
- Native (iOS + Android)

3.2 All new UI components MUST:
- Use React Native primitives or GlueStack components
- Use NativeWind classes for styling/layout
- Use GlueStack tokens for brand colors, radii, spacing

3.3 Replace Mantine components with RN/GlueStack equivalents:
- <Button>  → <Button> from GlueStack
- <Card>    → <Box> + <Text> (or GlueStack <Card> if available)
- <Group>   → <HStack> / <VStack> or RN <View> with flex classes
- <Container> → RN <View> + NativeWind classes
- <Text>    → GlueStack <Text>
- <Tabs>    → GlueStack <Tabs>
- <Modal>   → GlueStack <Modal>
- <Drawer>  → GlueStack <Actionsheet>
- <Input>   → GlueStack <Input>

===========================================================
4. BRANDING & DESIGN SYSTEM
===========================================================

4.1 Create a “MegykTheme” via GlueStack tokens:
Colors:
- primary: #264653
- secondary: #2A9D8F
- accent: #E76F51
- background: #F8F9FA
- text: #1D1D1D

Add brand tokens:
- spacing scale (xs, sm, md, lg, xl)
- corner radii (sm=6, md=10, lg=16)
- font sizes (sm, base, lg, xl, 2xl)

4.2 Configure NativeWind to reference brand colors:
tailwind.config.js:
- theme.extend.colors = Megyk brand colors
- set fontFamily for headings/body

===========================================================
5. ARCHITECTURE
===========================================================

Directory structure:

/app
  /[platform-shared screens]
  /components
  /hooks
  /utils

/components/ui
  Button.tsx      → GlueStack-themed Button wrapper
  Card.tsx        → Branded Card component
  Input.tsx       → Branded Input
  Header.tsx      → Branded Header bar
  Badge.tsx
  Modal.tsx

/components/layout
  HStack.tsx
  VStack.tsx
  Container.tsx

/themes
  gluestack-theme.ts
  nativewind-theme.ts (tailwind config)

/styles
  globals.css (web only for base resets)

===========================================================
6. MIGRATION STEPS
===========================================================

Step 1 – Create new Expo app with web support
- npx create-expo-app@latest megyk-app
- npx expo install react-native-web

Step 2 – Install NativeWind
- npm install nativewind tailwindcss
- npx tailwindcss init

Step 3 – Install GlueStack UI
- npm install @gluestack-ui/themed @gluestack-style/react

Step 4 – Port Mantine components → RN versions
- Replace div/span with View/Text
- Replace Mantine Box/Grid with RN flexbox + NativeWind
- Replace Mantine Buttons/Inputs with GlueStack equivalents
- Replace Mantine modals/tabs/drawers with GlueStack components

Step 5 – Create branded Megyk theme
- Set color tokens
- Set typography scale
- Build small set of branded components (Button, Card, Header)

Step 6 – Rebuild screens
- Use NativeWind for layout (px, py, mt, flex, gap, etc.)
- Use GlueStack for UI primitives
- Ensure screens run on both native + web

===========================================================
7. ACCEPTANCE CRITERIA
===========================================================

- No Mantine packages remain in package.json
- Web app renders fully via React Native Web
- iOS + Android build successfully in Expo Go
- Shared component library contains branded Megyk UI components
- All screens compile on ALL platforms with no divergence
- Theming is consistent across platforms
- App uses NativeWind utilities for layout/styling
- GlueStack components handle interactive UI patterns

===========================================================
8. AI CODING ASSISTANT DIRECTIVES
===========================================================

When generating or modifying code, AI must:
- Prefer React Native primitives + GlueStack components
- NEVER produce DOM-specific markup (no div/span/input/button)
- ALWAYS use NativeWind utility classes for layout
- ALWAYS use Megyk brand tokens and branded components
- KEEP code platform-agnostic (no platform-specific branching unless required)
- Use Expo Router conventions (file-based routes)
- Follow TypeScript strict mode
- Avoid Mantine imports entirely

===========================================================
END OF PDR
===========================================================

