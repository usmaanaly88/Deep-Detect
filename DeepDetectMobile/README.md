# Deep-Detect Mobile Client

DeepDetectMobile is a cross-platform React Native mobile client written in TypeScript. It allows users to pick or capture images and get real-time classifications using the Deep-Detect FastAPI backend. The app integrates Firebase for guest-based session authentication and scan history persistence, and uses Cloudinary for remote image hosting.

---

## Features

- **Anonymous Authentication** - Guest sign-in powered by Firebase Auth.
- **Scan History** - Previous predictions saved to Cloudinary and tracked in Firestore.
- **Responsive Animations** - State transitions and custom loaders for analyzing state.
- **State Management** - Centralized application state powered by Redux Toolkit.
- **Modern Navigation** - Stack navigation implemented via React Navigation v7.
- **Image Handling** - Native camera and gallery picking options.

---

## Repository Structure

```
DeepDetectMobile/
├── android/                 # Android native project files
├── ios/                     # iOS native project files
├── src/
│   ├── assets/              # App fonts, images, and static resources
│   ├── components/          # Reusable presentation and layout components
│   ├── config/              # Server configuration settings
│   │   └── config.ts        # Base URL and API endpoint configuration
│   ├── constants/           # Screen names, color palettes, and global constants
│   ├── hooks/               # Custom React hooks
│   ├── route/               # Stack navigation navigation layout (AppNavigator)
│   ├── screens/             # UI screens (Splash, Onboarding, Home, Analyzing, Results, Share, History, Settings, Privacy)
│   ├── services/            # API integration, Firebase Auth, Firestore DB, and Cloudinary uploads
│   ├── store/               # Redux state configuration and slices
│   └── utils/               # Helpers and validation functions
├── App.tsx                  # Root application wrapper (Providers for Redux, Navigation, and Safe Area)
├── index.js                 # Metro registry entry point
├── package.json             # NPM package scripts and dependencies
└── tsconfig.json            # TypeScript compiler configuration
```

---

## Setup and Installation

### Prerequisites

- **Node.js** - Version 22.11.0 or higher is required.
- **NPM** - Standard package installer.
- **Android Studio** - Installed with Android SDK, SDK platform tools, and Emulator configurations.
- **CocoaPods** - For macOS/iOS native builds.

### Windows Paths Advisory

To prevent build failures due to Windows' 260-character path limit, clone or move the workspace to a shallow path:

```powershell
# Example: Copying to a root directory
Copy-Item "C:\path\to\Deep-Detect" "C:\DD" -Recurse
cd C:\DD\DeepDetectMobile
```

### Installation Steps

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure Android SDK Environment Variables:
   On Windows (PowerShell):
   ```powershell
   $env:ANDROID_HOME = "C:\Users\<YourUser>\AppData\Local\Android\Sdk"
   $env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools"
   ```

3. Update Connection Configuration:
   Open [src/config/config.ts](src/config/config.ts) and edit your endpoint settings:
   ```typescript
   export const BASE_URL = "http://<your-local-ip>:8000";
   export const END_POINT = "/predict";
   ```

4. Native iOS Setup (macOS only):
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

---

## Development Execution

### 1. Start Metro Bundler

Run the Metro bundler to compile your JavaScript bundle:

```bash
npm start
```

If you encounter caching errors or have updated packages:
```bash
npx react-native start --reset-cache
```

### 2. Launch Platform Application

Open a second terminal window and execute:

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

---

## Screen Breakdown

- **Splash** - Entry loading screen initializing Firebase session credentials.
- **Onboarding (UnAuth)** - Simple introduction screen explaining the utility.
- **Home** - Core dashboard to trigger camera capture or media picker.
- **Analyzing** - Processing interface while calling the FastAPI backend.
- **Results** - Visual layout showing the class label and confidence percentage.
- **History** - Past scan logs retrieved chronologically from Firestore.
- **Share** - Dynamic platform options to share scan results.
- **Settings** - User options and route to the privacy policy.
- **Privacy** - Compliance page showing privacy and data terms.

---

## Troubleshooting

- **SDK Location Error**: If the build fails indicating SDK paths are missing, create an `android/local.properties` file:
  ```properties
  sdk.dir=C\:\\Users\\<YourUser>\\AppData\\Local\\Android\\Sdk
  ```
- **Port Conflict**: If Metro fails to start because port 8081 is in use:
  ```bash
  npx react-native start --port 8082
  ```
- **Network Request Failures**: Ensure your mobile device is on the same local network as your backend host. Double-check your IP configuration in `src/config/config.ts`.
