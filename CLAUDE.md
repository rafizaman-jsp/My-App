@AGENTS.md

React Native Expo Cross-Platform Agent Prompt

You are an expert React Native + Expo engineer.

Convert/refactor this project into a single cross-platform Expo React Native application that works properly on:

📱 iOS
📱 Android
🌐 Web

The goal is to maintain one shared codebase with maximum code reuse while still providing platform-appropriate UX.

Requirements

Expo


Use Expo Router if routing/navigation is required.
Ensure the project runs with:
npx expo start
npx expo start --web
iOS/Android Expo development builds or Expo Go where supported.

Cross-platform UI

Use React Native primitives (View, Text, Pressable, ScrollView, KeyboardAvoidingView, etc.) instead of HTML-specific elements.
Make layouts responsive for phones, tablets, and desktop web.
Support mouse, keyboard, touch, and mobile gestures where appropriate.
Avoid fixed widths/heights that break on different screen sizes.
Use Platform or platform-specific files only when behavior genuinely differs.

Web compatibility

Make every screen functional in React Native Web.
Replace browser-only assumptions with cross-platform React Native implementations.
Handle responsive breakpoints appropriately.
Ensure scrolling, forms, modals, navigation, buttons, links, and keyboard interaction work on web.

Mobile compatibility

Respect safe areas/notches.
Handle Android back navigation appropriately.
Support different screen sizes and orientations.
Avoid web-only APIs unless they are isolated behind platform-specific implementations.

Platform-specific code
When behavior must differ, prefer:

Component.tsx
Component.web.tsx
Component.native.tsx
Component.ios.tsx
Component.android.tsx

Keep platform-specific code minimal and share everything else.

Dependencies

Audit existing dependencies.
Remove packages that are incompatible with Expo, React Native, or React Native Web.
Replace incompatible libraries with Expo/RN-compatible alternatives when necessary.
Do not introduce unnecessary dependencies.

Styling

Create a consistent responsive design system.
Centralize colors, typography, spacing, radii, and common component styles.
Make sure styles behave correctly on both native and web.

TypeScript

Use strict TypeScript where practical.
Fix type errors rather than suppressing them with any.
Ensure platform-specific implementations have compatible interfaces/types.

Navigation

Make navigation work consistently across iOS, Android, and web.
Support browser back/forward navigation and deep linking where applicable.

Existing functionality

Preserve all existing features and business logic.
Do not rewrite working functionality unnecessarily.
If a feature cannot work identically on all platforms, implement the closest appropriate platform-specific behavior.

Important path

D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\backend\.env.runAtStart
D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\backend\src\ApiServer.java
D:\New folder\IUS\7th-semester\Mobile Application and Development\Pokemon\MY-APP\Schema.txt


Execution instructions

First inspect the entire repository and Important paths then identify:

Current framework and Expo/RN versions
Navigation architecture
Existing screens/components
Dependencies
Web-specific code
Native-specific code
Incompatible packages
Responsive-layout problems
TypeScript/build errors

Then create a short migration plan.

After that, implement the changes directly in the codebase.

Do not stop after giving recommendations.

After implementation:

Run TypeScript/type checking.
Run linting if configured.
Run the Expo web build/start process and restart the backend.
Verify Android/iOS compatibility as far as the available environment allows.
Fix all errors you encounter.
Check every screen for responsive behavior.
Check navigation and deep linking.
Check forms, modals, scrolling, touch interactions, and keyboard behavior.
Remove/comments dead/incompatible code.
Provide a concise final report containing:
Files changed
Dependencies added/removed
Platform-specific implementations
Commands used for verification
Any remaining limitations
Important

Do not create separate applications for mobile and web.

The target architecture is:

One Expo + React Native codebase → iOS + Android + Web

Prioritize shared components and shared business logic, while using platform-specific files only where necessary.

Start by inspecting the repository.