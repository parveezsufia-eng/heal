# HEAL HERE - Design Guidelines

Based on [Dribbble Reference](https://dribbble.com/shots/26968112-Ai-mental-health-app-design)

## Design Philosophy
**Visual Direction**: Clean, minimal, serene wellness aesthetic with line art illustrations and soft organic shapes. The design should feel peaceful, elegant, and spa-like.

## Color Palette

### Primary Colors
- **Gold/Tan**: `#C9A77C` - Primary accent, buttons, highlights
- **Soft Blue**: `#AFCCE1` - Secondary accent, calming elements
- **Peach/Cream**: `#F5E6DC` - Decorative backgrounds

### Background Colors
- **Background Root**: `#FFFFFF` - Pure white
- **Background Secondary**: `#FAFAFA` - Light gray
- **Warm Background**: `#FDF8F5` - Very light cream

### Card Colors
- **Card Blue**: `#E8F4FA` - Light blue cards
- **Card Peach**: `#FDF3ED` - Peachy cards
- **Card Green**: `#EDF7F4` - Mint cards

### Text Colors
- **Text Primary**: `#2D2D2D` - Near black
- **Text Secondary**: `#8B8B8B` - Medium gray
- **Border**: `#EFEFEF` - Light gray

### Semantic Colors
- **Success**: `#9FD8CB` - Mint green
- **Emergency**: `#E85D5D` - Soft red

## Typography

### Font Families
- **Headings**: Playfair Display (elegant serif)
- **Body**: Plus Jakarta Sans (clean sans-serif)

### Text Styles
- **H1**: 32px / Playfair Display Regular - Main titles
- **H2**: 26px / Playfair Display Regular - Section headers
- **H3**: 20px / Playfair Display Regular - Card titles
- **H4**: 17px / Plus Jakarta Sans Medium - Subheadings
- **Body**: 15px / Plus Jakarta Sans Regular - Content
- **Small**: 13px / Plus Jakarta Sans Regular - Labels

## Illustration Style
- Minimalist line art with single continuous black lines
- Soft colored organic blob shapes (peach, blue, amber)
- Meditation, breathing, yoga themes
- Clean white backgrounds
- No heavy details or realistic elements

## Spacing System
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 32px
- **4xl**: 40px

## Border Radius
- **xs**: 8px
- **sm**: 12px
- **md**: 16px
- **lg**: 20px
- **xl**: 24px
- **full**: 9999px (circles/pills)

## Component Patterns

### Onboarding Screen
- Soft warm background (#FDF8F5)
- Large illustration with colored blobs
- Decorative elements (small stars, curves)
- Elegant serif title at bottom
- Circular outlined arrow button
- Pill-shaped pagination dots

### Cards
- Very subtle or no shadows
- Colored backgrounds (blue, peach, green)
- Generous padding (16-20px)
- Large border radius (20-24px)

### Buttons
- Primary: Gold (#C9A77C) with white text
- Secondary: Dark (#2D2D2D) with white text
- Outline: 1.5px border with dark text
- Border radius: 20px
- Height: 56px for primary actions

### Session Cards
- Colored background (cardBlue, cardPeach)
- Line art illustration
- Serif title
- Small metadata in sans-serif

### Input Fields
- Light gray background (#FAFAFA)
- No visible borders
- Pill-shaped search bars
- 44-52px height

## Screen Layouts

### Home Screen
- Greeting + serif title ("Ready to start your goals?")
- Search button in header
- Mood selection row
- Goal cards grid (2 columns)
- Today's schedule list
- Featured breathing card

### Explore Screen
- Header with search
- Category pills (horizontal scroll)
- Session cards grid
- Mentor list

### Journal Screen
- Locked state with illustration
- Unlock button
- Entry cards with mood indicators

### Therapist Screen
- Filter pills
- Therapist cards with availability
- Book button per card

### Profile Screen
- Circular avatar with illustration
- Stats row (3 columns)
- Weekly mood chart
- Achievements grid
- Progress bars

## Floating Elements
- AI Chat button: 52px, dark (#2D2D2D)
- Emergency button: 40px, red (#E85D5D)
- Position: Bottom right corner
