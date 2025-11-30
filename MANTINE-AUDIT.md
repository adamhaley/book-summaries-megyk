# Mantine UI Audit - Complete Component Usage

**Date:** 2025-11-30
**Purpose:** Document all Mantine UI components used in the codebase for migration to GlueStack UI + NativeWind

## Summary

**Total Mantine Packages:** 10
**Total Components Used:** 40+
**Total Files Using Mantine:** 11

## Mantine Packages in Use

From `package.json`:
```json
{
  "@mantine/carousel": "^8.3.6",
  "@mantine/charts": "^8.3.5",      // Not actively used
  "@mantine/core": "^8.3.5",
  "@mantine/dates": "^8.3.5",       // Not actively used
  "@mantine/dropzone": "^8.3.5",    // Not actively used
  "@mantine/form": "^8.3.5",        // Not actively used
  "@mantine/hooks": "^8.3.5",
  "@mantine/modals": "^8.3.5",
  "@mantine/next": "^6.0.22",
  "@mantine/notifications": "^8.3.5",
  "@mantine/tiptap": "^8.3.5"       // Not actively used
}
```

## Core Infrastructure Components

### 1. Theme & Providers
**File:** `app/layout.tsx`
```typescript
- MantineProvider
- ModalsProvider
- Notifications
- ColorSchemeScript
```

**File:** `lib/theme.ts`
```typescript
- createTheme
- Theme customization (colors, fonts, radii)
```

### 2. Hooks
**File:** Various components
```typescript
- useMediaQuery (from @mantine/hooks)
```

## Component Usage by File

### app/layout.tsx
- `MantineProvider` - Root theme provider
- `ModalsProvider` - Global modal management
- `Notifications` - Toast notification system
- `ColorSchemeScript` - Dark mode support

### components/dashboard/DashboardLayout.tsx
**Layout Components:**
- `AppShell` - Main dashboard layout structure
- `AppShell.Header` - Top navigation bar
- `AppShell.Navbar` - Sidebar navigation
- `AppShell.Main` - Main content area
- `AppShell.Section` - Sidebar sections

**UI Components:**
- `Group` - Horizontal layout (4 uses)
- `Text` - Typography (3 uses)
- `NavLink` - Sidebar navigation links
- `ActionIcon` - Logout button
- `UnstyledButton` - Mobile nav buttons (4 uses)
- `Box` - Mobile bottom navigation container

**Icons from @tabler/icons-react:**
- IconHome, IconBook, IconUser, IconLogout, IconBookmark, IconAdjustments

### components/MainNavigation.tsx
- `Group` - Layout (3 uses)
- `Text` - Typography (2 uses)
- `ActionIcon` - Logout button

### components/summary/GenerateSummaryModal.tsx
**Modal Components:**
- `Modal` - Dialog container
- `Text` - Typography (13 uses)
- `Box` - Layout containers (3 uses)
- `Stack` - Vertical layout (6 uses)
- `Center` - Centering wrapper (2 uses)
- `Button` - Generate button
- `Slider` - Style/Length selection (2 uses with custom styling)
- `Loader` - Loading indicator (2 uses)
- `Alert` - Error messages

**Icons:**
- IconAlertCircle, IconSparkles, IconCheck

**Notifications API:**
- `notifications.show()` - Success toast

### components/preferences/PreferencesForm.tsx
- `Card` - Container with border (3 uses)
- `Group` - Layout
- `Stack` - Layout (3 uses)
- `Text` - Typography (8 uses)
- `Button` - Save button
- `Alert` - Success/error messages (2 uses)
- `Slider` - Preference selectors (2 uses)
- `Box` - Layout containers (3 uses)
- `Loader` - Loading state
- `Center` - Loading center wrapper

**Icons:**
- IconCheck, IconAlertCircle

### components/onboarding/OnboardingWizard.tsx
- `Stepper` - Multi-step wizard
- `Stepper.Step` - Individual steps (3 uses)
- `Stepper.Completed` - Completion screen
- `Button` - Navigation buttons (3 uses)
- `Group` - Button layout
- `Card` - Content containers (3 uses)
- `Stack` - Layout (7 uses)
- `Text` - Typography (11 uses)
- `Title` - Headings (2 uses)
- `Container` - Page container
- `Alert` - Error display
- `Slider` - Preference selectors (2 uses)
- `Box` - Layout containers (2 uses)

**Icons:**
- IconCheck, IconAlertCircle

### components/carousel/BookCarousel.tsx
**Carousel Components:**
- `Carousel` - Main carousel container
- `Carousel.Slide` - Individual slides

**UI Components:**
- `Card` - Book card (1 use)
- `Image` - Book cover
- `Text` - Typography (2 uses)
- `Group` - Layout
- `Badge` - Genre badge
- `Button` - Action buttons (3 uses)
- `Stack` - Layout (2 uses)
- `Container` - Page container
- `Title` - Section title
- `Box` - Layout wrapper

**Icons:**
- IconSparkles, IconChevronLeft, IconChevronRight, IconSettings

**Hooks:**
- `useMediaQuery` - Responsive behavior (4 uses)

### app/page.tsx (Homepage)
- `Container` - Page container (2 uses)
- `Center` - Centering wrapper (2 uses)
- `Loader` - Loading state
- `Text` - Typography (3 uses)
- `Stack` - Layout (3 uses)
- `Title` - Page title
- `Button` - CTA buttons (2 uses)
- `Group` - Button layout
- `Box` - Full-height container

**Icons:**
- IconArrowRight, IconSparkles

### app/auth/signin/page.tsx
- `Container` - Page container
- `Paper` - Card-like container with shadow
- `Title` - Page heading
- `Text` - Typography (2 uses)
- `TextInput` - Email field
- `PasswordInput` - Password field
- `Button` - Submit button
- `Stack` - Layout (2 uses)
- `Anchor` - Link to signup
- `Alert` - Error display

**Icons:**
- IconAlertCircle

### app/dashboard/library/page.tsx
**Layout Components:**
- `Container` - Page container (2 uses)
- `Title` - Page heading
- `Text` - Typography (10+ uses)
- `Stack` - Layout (4 uses)
- `Card` - Content cards (3 uses)

**Table Components:**
- `Table` - Desktop table view
- `Table.ScrollContainer` - Horizontal scroll wrapper
- `Table.Thead` - Table header
- `Table.Tbody` - Table body
- `Table.Tr` - Table rows
- `Table.Th` - Table headers (7 uses)
- `Table.Td` - Table cells (7+ uses)

**UI Components:**
- `Button` - Action buttons (6+ uses)
- `Badge` - Genre badges (2 uses)
- `Loader` - Loading state
- `Alert` - Error display
- `SimpleGrid` - Mobile card grid
- `Group` - Layout (4+ uses)
- `Box` - Layout wrappers (3 uses)
- `Pagination` - Page navigation
- `Center` - Pagination centering
- `UnstyledButton` - Sortable headers (6 uses)
- `Image` - Book covers (2 uses)

**Icons:**
- IconBook, IconAlertCircle, IconSparkles, IconChevronUp, IconChevronDown, IconSelector, IconSettings

### app/dashboard/summaries/page.tsx
**Layout Components:**
- `Container` - Page container
- `Title` - Page heading
- `Text` - Typography (15+ uses)
- `Stack` - Layout (5+ uses)
- `Card` - Content cards (4+ uses)

**Table Components:**
- `Table` - Desktop table view
- `Table.ScrollContainer` - Horizontal scroll
- `Table.Thead` - Table header
- `Table.Tbody` - Table body
- `Table.Tr` - Table rows
- `Table.Th` - Table headers (4 uses)
- `Table.Td` - Table cells (4+ uses)

**UI Components:**
- `Center` - Loading/empty state
- `Button` - Download/delete buttons (6+ uses)
- `Group` - Layout (6+ uses)
- `Badge` - Style/length badges (4+ uses)
- `Loader` - Loading indicator
- `SimpleGrid` - Mobile view (not used)
- `Box` - Layout wrappers (2 uses)
- `Image` - Book covers (2 uses)

**Icons:**
- IconBookmark, IconDownload, IconTrash

## Mantine Component → GlueStack/RN Replacement Map

| Mantine Component | Usage Count | GlueStack/RN Replacement | Notes |
|-------------------|-------------|--------------------------|-------|
| **Layout** |
| `AppShell` | 1 | Custom RN layout | SafeAreaView + flex layout |
| `AppShell.Header` | 1 | Custom Header component | Fixed header with RN View |
| `AppShell.Navbar` | 1 | Custom Sidebar | Drawer for mobile, fixed for desktop |
| `AppShell.Main` | 1 | ScrollView or View | Main content wrapper |
| `Container` | 10+ | Custom Container | View with maxWidth |
| `Group` | 20+ | HStack or View with flexDirection row | Horizontal layout |
| `Stack` | 30+ | VStack or View with flexDirection column | Vertical layout |
| `Box` | 15+ | View | Generic container |
| `Center` | 6+ | View with flex center | Centering wrapper |
| `SimpleGrid` | 2 | FlatList or custom grid | Responsive grid |
| **Typography** |
| `Text` | 60+ | GlueStack Text | Typography primitive |
| `Title` | 6+ | GlueStack Heading | Heading component |
| `Anchor` | 1 | Pressable + Text | Link component |
| **Forms** |
| `TextInput` | 1 | GlueStack Input | Text input |
| `PasswordInput` | 1 | GlueStack Input with secure | Password field |
| `Slider` | 6 | GlueStack Slider | Range slider |
| `Button` | 40+ | GlueStack Button | Primary action button |
| `ActionIcon` | 3 | GlueStack Button or Pressable | Icon button |
| `UnstyledButton` | 10+ | Pressable | Unstyled clickable |
| **Feedback** |
| `Loader` | 6+ | GlueStack Spinner | Loading indicator |
| `Alert` | 6+ | GlueStack Alert | Alert/notification banner |
| `Notifications` | 1 | react-native-toast-message | Toast notifications |
| `Modal` | 1 | GlueStack Modal | Dialog modal |
| **Data Display** |
| `Card` | 15+ | GlueStack Box with shadow | Card container |
| `Paper` | 1 | GlueStack Box with shadow | Paper-like card |
| `Badge` | 10+ | GlueStack Badge | Status badge |
| `Image` | 6+ | GlueStack Image | Image component |
| `Table` | 2 | Custom table or FlatList | Data table |
| `Table.*` | 20+ | Custom components | Table primitives |
| `Pagination` | 1 | Custom pagination | Page navigation |
| **Navigation** |
| `NavLink` | 4+ | Pressable + GlueStack components | Navigation link |
| `Stepper` | 1 | Custom stepper | Multi-step wizard |
| `Carousel` | 1 | react-native-reanimated-carousel | Image carousel |
| **Providers** |
| `MantineProvider` | 1 | GluestackUIProvider | Theme provider |
| `ModalsProvider` | 1 | GlueStack modal context | Modal management |
| `ColorSchemeScript` | 1 | GlueStack color mode | Dark mode support |

## Critical Features to Replicate

### 1. Theme System
**Current:** Mantine's createTheme with custom colors
```typescript
- Primary color: cyan (#00D2FF)
- Dark mode with true black background
- Custom color scale for cyan
```

**Migration:** GlueStack design tokens
```typescript
- Define brand colors in GlueStack theme
- Set up color mode for dark/light toggle
- Maintain cyan as primary color
```

### 2. AppShell Layout
**Current:** Mantine AppShell with responsive sidebar
- Desktop: Fixed 300px sidebar
- Mobile: Hidden sidebar + bottom navigation bar
- Auto-hide mobile nav on scroll

**Migration:** Custom React Native layout
- Use SafeAreaView for proper mobile spacing
- Drawer component for mobile sidebar
- Custom bottom tab bar for mobile
- Implement scroll-based auto-hide

### 3. Notifications System
**Current:** @mantine/notifications with `notifications.show()`
**Migration:** react-native-toast-message
```typescript
Toast.show({
  type: 'success',
  text1: 'Summary Generated!',
  text2: 'Your personalized summary has been downloaded.'
})
```

### 4. Carousel
**Current:** @mantine/carousel with Embla
**Migration:** react-native-reanimated-carousel
- Support responsive slide sizes
- Maintain infinite loop behavior
- Custom controls

### 5. Slider Component
**Current:** Mantine Slider with custom marks and styling
**Migration:** GlueStack Slider
- Support discrete marks (style/length options)
- Custom thumb and track styling
- Maintain current styling (#00D2FF accent)

### 6. Table with Sorting
**Current:** Mantine Table with sortable headers
**Migration:** Custom FlatList or react-native-table-component
- Implement sort indicators
- Maintain responsive behavior (table on desktop, cards on mobile)

### 7. Modal with Custom Styling
**Current:** Mantine Modal with custom height/scrolling
**Migration:** GlueStack Modal
- Support mobile viewport height (dvh units equivalent)
- Smooth scrolling on iOS
- Custom sizing and styling

### 8. Responsive Visibility
**Current:** Mantine's `visibleFrom` and `hiddenFrom` props
**Migration:** useMediaQuery or Platform-specific rendering
```typescript
// Mantine
<Text visibleFrom="sm">Desktop only</Text>

// React Native
const isDesktop = useMediaQuery({ minWidth: 768 })
{isDesktop && <Text>Desktop only</Text>}
```

## Files That Need Heavy Refactoring

### High Complexity (Major Rewrite)
1. ✅ **components/dashboard/DashboardLayout.tsx** - AppShell → Custom RN layout
2. ✅ **components/carousel/BookCarousel.tsx** - Carousel library change
3. ✅ **app/dashboard/library/page.tsx** - Table → FlatList with sortable headers
4. ✅ **app/dashboard/summaries/page.tsx** - Table → FlatList with grouped data

### Medium Complexity (Component Swaps)
5. ✅ **components/summary/GenerateSummaryModal.tsx** - Modal + Slider components
6. ✅ **components/preferences/PreferencesForm.tsx** - Form components + Slider
7. ✅ **components/onboarding/OnboardingWizard.tsx** - Stepper → Custom wizard

### Low Complexity (Simple Replacements)
8. ✅ **components/MainNavigation.tsx** - Simple component swaps
9. ✅ **app/page.tsx** - Simple layout and typography
10. ✅ **app/auth/signin/page.tsx** - Form components
11. ✅ **app/layout.tsx** - Provider changes

## Dependencies to Remove

After migration, these packages can be removed:
```json
{
  "@mantine/carousel": "^8.3.6",
  "@mantine/charts": "^8.3.5",
  "@mantine/core": "^8.3.5",
  "@mantine/dates": "^8.3.5",
  "@mantine/dropzone": "^8.3.5",
  "@mantine/form": "^8.3.5",
  "@mantine/hooks": "^8.3.5",
  "@mantine/modals": "^8.3.5",
  "@mantine/next": "^6.0.22",
  "@mantine/notifications": "^8.3.5",
  "@mantine/tiptap": "^8.3.5",
  "@emotion/react": "^11.14.0",
  "@emotion/server": "^11.11.0",
  "embla-carousel": "^8.6.0",
  "embla-carousel-react": "^8.6.0"
}
```

## Dependencies to Add

```json
{
  "@gluestack-ui/themed": "latest",
  "@gluestack-style/react": "latest",
  "nativewind": "latest",
  "react-native-reanimated": "latest",
  "react-native-reanimated-carousel": "latest",
  "react-native-toast-message": "latest",
  "react-native-safe-area-context": "latest"
}
```

## Tabler Icons Migration

**Current:** `@tabler/icons-react` (DOM SVGs)
**Replacement Options:**
1. **react-native-vector-icons** - Pre-built icon sets
2. **@expo/vector-icons** - Expo's built-in icons (includes Ionicons, FontAwesome, MaterialIcons)
3. **lucide-react-native** - Modern icon library (similar to Tabler)

**Recommendation:** Use `@expo/vector-icons` (Ionicons) as it's included with Expo and has similar icons.

## Styling Migration

### Current Approach
- Mantine's CSS-in-JS with theme variables
- Inline styles with Mantine color tokens
- CSS modules for custom styles

### New Approach
- **NativeWind** for layout and utility classes
- **GlueStack** design tokens for colors and spacing
- **Inline styles** only when necessary (StyleSheet.create)

**Example Migration:**
```typescript
// Mantine
<Box p="md" style={{ backgroundColor: 'var(--mantine-color-default-hover)' }}>
  <Text c="dimmed" size="lg" fw={600}>Title</Text>
</Box>

// React Native + NativeWind
<View className="p-4 bg-gray-100 dark:bg-gray-800">
  <Text className="text-gray-500 text-lg font-semibold">Title</Text>
</View>
```

## Testing Checklist

After migration, verify:
- [ ] Theme (colors, typography) matches current design
- [ ] Dark mode works consistently
- [ ] Responsive layout (mobile/tablet/desktop)
- [ ] All interactive components work (buttons, sliders, modals)
- [ ] Navigation (sidebar, bottom nav, links)
- [ ] Forms (inputs, validation, submission)
- [ ] Data tables (sorting, pagination)
- [ ] Carousel (touch gestures, infinite loop)
- [ ] Notifications/toasts
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

## Priority Order for Migration

1. **Theme & providers** - Foundation for everything else
2. **Layout components** - Container, HStack, VStack, Box
3. **UI primitives** - Text, Button, Input, Card, Badge
4. **DashboardLayout** - Core navigation structure
5. **Homepage & auth** - Simple pages to validate approach
6. **Forms & modals** - Interactive components
7. **Complex pages** - Library, summaries (tables/lists)
8. **Carousel** - Specialized component

---

**Document Status:** Complete
**Last Updated:** 2025-11-30
**Next Step:** Begin Phase 2 - Monorepo restructuring
