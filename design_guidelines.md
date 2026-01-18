# HEAL HERE - Design Guidelines

## Brand Identity
**Purpose**: Mental health and wellness companion app providing therapy access, mood tracking, wellness tools, and AI-powered support for students, employees, and anyone seeking mental health guidance.

**Visual Direction**: Soft, calming pastel aesthetic with minimalist approach. The design should feel like a safe, peaceful sanctuary - gentle, approachable, and healing-focused.

**Memorable Element**: Floating AI companion button and emergency SOS button always accessible, symbolizing constant support and safety.

## Navigation Architecture
**Root Navigation**: Tab Bar (5 tabs)
- Home (house icon)
- Explore (compass icon)
- Journal (book icon) 
- Therapist (user-check icon)
- Profile (user icon)

**Floating Elements** (present on ALL screens):
- AI Chatbot button (bottom-right corner)
- Emergency SOS button (top-right corner, red accent)

## Screen-by-Screen Specifications

### Onboarding (3 screens, swipeable)
- Full-screen 3D illustrations with mental health quotes
- Minimalist text overlay
- Skip button (top-right), Next/Get Started buttons (bottom)

### Authentication
**Sign Up**: Scrollable form with fields: Name, Phone, Email, OTP verification, Password, Confirm Password
**Login**: Phone/Email, Password, Forgot Password link
**User Profile Form**: Name, Contact, Age, Address, Emergency Contact, Medical History (textarea), Photo upload, Submit button

### Home Screen
**Header**: Transparent with greeting "How are you feeling today?" + date
**Content** (scrollable):
- Daily motivational quote card
- Mood tracker with calendar integration (emoji selection: happy, sad, neutral, anxious, angry)
- Daily Activities grid (2 columns): Sleep, Steps, Water, Exercise, Meditate, Mood, Food, Stress (each shows icon + value)
- To-Do List section (collapsible)
- Meal Planning card
- Daily Streaks counter
**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Explore Screen
**Header**: Search bar, "Explore" title
**Content** (scrollable):
- Mentorship section (cards with mentor profiles)
- Guidance resources (articles, videos)
- Self-Heal tools grid: Breathing bubble, Mind testing, Diet plans, Mindful audio
- Mind Booster section: Fun facts, Riddles, Stories
- Healthcare content: Vlogs, Podcasts, Audio exercises
**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Journal Screen
**Header**: "Journal" title, lock icon (PIN protection)
**Content**: List of journal entries with dates, Add new entry FAB
**Empty State**: Illustration with "Start your healing journey"
**Detail View**: Full-screen text editor with date, mood emoji, save button
**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Therapist Screen
**Header**: Filter icon (right)
**Content** (scrollable):
- Types of Counselling chips (Family, Relationship, Burnout, Academic, etc.)
- Therapist cards: Photo, Name, Rating, Expertise, Experience, "Book Session" button
- Filters modal: Expertise, Language, Availability
**Detail View**: Bio, Background, Certifications, Testimonials, Session packages, Connect options (Audio/Video/Message)
**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Profile Screen
**Header**: Settings icon (right)
**Content** (scrollable):
- User photo + name
- Weekly/Monthly health comparison charts (mood curve, energy score, sleep score, stress level, calories)
- Overall Records section
- AI Progress Dashboard: Trigger heatmap, Habits consistency, Goal achievement %
- Daily Streaks & Rewards
- Settings: Theme (Light/Dark/Custom pastel), Language, Notifications, Privacy
**Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

## Color Palette
- **Primary**: #A8D5BA (Soft mint green - healing, growth)
- **Secondary**: #E8B4B8 (Dusty rose - compassion, warmth)
- **Accent**: #FFD6A5 (Peachy - energy, optimism)
- **Emergency**: #FF6B6B (Soft red - urgency without alarm)
- **Background**: #F9F7F4 (Warm off-white)
- **Surface**: #FFFFFF (Pure white cards)
- **Text Primary**: #3D3D3D (Soft charcoal)
- **Text Secondary**: #8B8B8B (Medium gray)
- **Success**: #9FD8CB (Mint - calm positive)
- **Border**: #E8E8E8 (Light gray)

## Typography
**Font**: Nunito (Google Font - friendly, approachable)
- **H1**: 28px, Bold (Screen titles)
- **H2**: 22px, SemiBold (Section headers)
- **H3**: 18px, SemiBold (Card titles)
- **Body**: 16px, Regular (Main content)
- **Caption**: 14px, Regular (Metadata, labels)
- **Small**: 12px, Regular (Timestamps, hints)

## Visual Design
- Cards: 16px border radius, subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 4)
- Floating buttons: 56px circle, shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- Pressed state: 0.95 scale, opacity 0.8
- Icons: Feather icon set, 24px standard size
- Spacing scale: xs:4, sm:8, md:12, lg:16, xl:24, xxl:32

## Assets to Generate
1. **icon.png** - App icon: Minimalist lotus or abstract mind/heart symbol in primary color palette
2. **splash-icon.png** - Same as app icon for launch screen
3. **logo-horizontal.png** - "HEAL HERE" wordmark + icon, used in headers - WHERE USED: Onboarding, auth screens
4. **onboarding-1.png** - 3D illustration: Person meditating in calm environment - WHERE USED: Onboarding screen 1
5. **onboarding-2.png** - 3D illustration: Supportive hands holding heart - WHERE USED: Onboarding screen 2
6. **onboarding-3.png** - 3D illustration: Growth/transformation metaphor - WHERE USED: Onboarding screen 3
7. **empty-journal.png** - Open book with gentle glow - WHERE USED: Journal empty state
8. **empty-therapists.png** - Friendly counselor silhouette - WHERE USED: Therapist list empty state
9. **avatar-default.png** - Neutral user avatar (pastel colors) - WHERE USED: Profile, therapist cards
10. **chatbot-avatar.png** - Friendly AI companion character - WHERE USED: AI chatbot interface
11. **emergency-icon.png** - SOS symbol in emergency color - WHERE USED: Emergency floating button