# HEAL HERE - Design Guidelines

Based on [Dribbble Reference](https://dribbble.com/shots/26968112-Ai-mental-health-app-design)

## Brand Identity
**Purpose**: Mental health and wellness companion app providing therapy access, mood tracking, wellness tools, and AI-powered support for students, employees, and anyone seeking mental health guidance.

**Visual Direction**: Warm, sophisticated pastel aesthetic with minimalist approach. The design should feel like a safe, peaceful sanctuary - gentle, approachable, and healing-focused.

**Memorable Element**: Floating AI companion button and emergency SOS button always accessible, symbolizing constant support and safety.

## Navigation Architecture
**Root Navigation**: Tab Bar (5 tabs)
- Home (home icon)
- Explore (compass icon)
- Journal (book-open icon) 
- Therapist (users icon)
- Profile (user icon)

**Floating Elements** (present on ALL screens):
- AI Chatbot button (bottom-right corner, purple)
- Emergency SOS button (above chatbot, red accent)

## Color Palette (Dribbble Reference)

### Primary Colors
- **Primary Purple**: `#9B65AA` - Main accent, buttons, selected states, tab highlights
- **Soft Blue**: `#AFCCE1` - Secondary accent, calming elements, tags
- **Warm Amber**: `#DA914A` - Tertiary accent, ratings, energy indicators

### Background & Surface
- **Background Root**: `#F2F1F0` - Warm off-white, main app background
- **Background Default**: `#FFFFFF` - Cards, modals
- **Background Secondary**: `#F8F7F6` - Input fields, secondary surfaces
- **Background Tertiary**: `#EDECEB` - Elevated elements

### Accent Colors
- **Dusty Rose/Warm**: `#DCC3BB` - Decorative accents, avatar backgrounds
- **Success**: `#7BB89E` - Completed states, positive indicators
- **Emergency**: `#E85D5D` - Urgent actions, SOS button

### Text Colors
- **Text Primary**: `#343232` - Main content, headings
- **Text Secondary**: `#7A7878` - Captions, metadata
- **Border**: `#E5E3E2` - Dividers, outlines
- **Inactive**: `#B3B3B4` - Disabled states, tab icons

## Typography

**Font Family**: Plus Jakarta Sans (Google Font - modern, sophisticated)

### Text Styles
- **H1**: 28px / Bold (700) - Page titles
- **H2**: 22px / SemiBold (600) - Section headers
- **H3**: 18px / SemiBold (600) - Card titles
- **H4**: 16px / SemiBold (600) - Subheadings
- **Body**: 15px / Regular (400) - Main content
- **Small**: 13px / Regular (400) - Labels, captions
- **Link**: 15px / Medium (500) - Interactive text

## Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **4xl**: 40px
- **5xl**: 48px
- **Input Height**: 52px
- **Button Height**: 56px

## Border Radius
- **xs**: 8px - Small elements, tags
- **sm**: 12px - Chips, badges
- **md**: 16px - Secondary cards
- **lg**: 20px - Primary cards, buttons
- **xl**: 24px - Large cards
- **2xl**: 32px - Modals
- **3xl**: 40px - Special decorative elements
- **full**: 9999px - Circular, pills

## Shadows

### Small
- shadowColor: #343232
- shadowOffset: { width: 0, height: 2 }
- shadowOpacity: 0.06
- shadowRadius: 8
- elevation: 2

### Medium
- shadowColor: #343232
- shadowOffset: { width: 0, height: 4 }
- shadowOpacity: 0.08
- shadowRadius: 16
- elevation: 4

### Large
- shadowColor: #343232
- shadowOffset: { width: 0, height: 8 }
- shadowOpacity: 0.1
- shadowRadius: 24
- elevation: 8

## Screen Specifications

### Onboarding (3 screens, swipeable)
- Warm background (#F2F1F0)
- Logo + app name in header
- Large illustration container with warm tint background
- Centered title and subtitle
- Pill-shaped pagination dots (active: 28px wide, inactive: 8px)
- Primary button at bottom

### Home Screen
**Header**: Transparent with app logo and title
**Content** (scrollable):
- Greeting + date display
- Inspirational quote card (warm accent background)
- Mood tracker (5 moods: happy, calm, neutral, sad, anxious)
- Daily tracking grid (2x2: sleep, steps, water, mood)
- To-Do list with circular checkboxes
- Meal planning card with time-based icons
- Streak counter card

### Explore Screen
**Header**: Search bar with icon
**Content**:
- Category chips (Mentorship, Guidance, Self Heal)
- Mentor cards with avatar, name, specialty, rating
- Guidance resource grid
- Wellness tools grid (breathing, mind test, diet, audio)
- Mind boosters row (facts, riddles, stories)

### Journal Screen
**Header**: "Journal" title
**Security**: PIN protection (hint: 1234)
**Content**: 
- Locked state: Large lock icon, unlock button
- Unlocked: List of entries with mood badge, FAB for new entry
- Entry card: Date, mood icon, title, preview text

### Therapist Screen
**Header**: Filter chips for counseling types
**Content**:
- Therapist cards with:
  - Avatar with availability indicator (green dot)
  - Name, title, specialty tags
  - Rating, experience, session count
  - Price range and book button

### Profile Screen
**Header**: Settings button
**Content**:
- Large centered avatar
- Name and member date
- Weekly mood chart (bar chart)
- Summary cards (3 columns: mood, sleep, stress)
- Progress bars (goals, habits)
- Achievements grid (2x2)
- Records list (days active, entries, sessions)

## Component Patterns

### Cards
- Background: #FFFFFF
- Border radius: 20px (BorderRadius.lg)
- Padding: 16px (Spacing.lg)
- Shadow: Small shadow
- No borders

### Buttons
- Primary: Purple (#9B65AA), white text
- Height: 56px
- Border radius: 20px
- Scale on press: 0.97

### Input Fields
- Background: Secondary (#F8F7F6)
- Height: 52px
- Border radius: Full (pills for search)
- Padding: 16px horizontal

### Mood Buttons
- Vertical layout: icon + label
- Selected: Filled background, white icon
- Unselected: White background, colored icon

### Floating Action Button
- Size: 56px (chat), 44px (emergency)
- Border radius: Full circle
- Shadow: Medium
- Position: Bottom right, above tab bar

## Design Principles

### 1. Warm & Calming
- Consistent warm background (#F2F1F0)
- Soft, muted colors
- Safe, peaceful atmosphere

### 2. Clean & Minimal
- Generous whitespace
- Avoid visual clutter
- Focus on essentials

### 3. Rounded & Soft
- Rounded corners everywhere (20px minimum for cards)
- Circular elements for avatars and icons
- Approachable feel

### 4. Clear Hierarchy
- Size and weight for importance
- Color for emphasis and meaning
- Consistent spacing patterns

### 5. Accessible Interaction
- Large touch targets (56px buttons)
- Clear active states
- Haptic feedback on iOS/Android

## Assets Required
1. **icon.png** - App icon with healing theme
2. **splash-icon.png** - Launch screen icon
3. **onboarding illustrations** (3) - Meditation, support, growth themes
4. **empty-journal.png** - Journal empty state
