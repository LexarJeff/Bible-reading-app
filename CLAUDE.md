# Bible Reading 2026 - Android App

## Project Structure

```
Bible Reading App/
├── www/
│   └── index.html          ← Web app source (edit this for app changes)
├── android/                 ← Capacitor-generated Android project
├── capacitor.config.json    ← Capacitor config (app ID, plugins, theme)
├── package.json             ← npm dependencies
├── index.html               ← Original web-only version (not used by Android build)
└── BibleReading2026-debug.apk  ← Most recent built APK
```

## Tech Stack

- **Web app**: Single-file vanilla HTML/CSS/JS (`www/index.html`)
- **Android wrapper**: Capacitor 6 (wraps web app in native Android shell)
- **Capacitor plugins**: Browser, Filesystem, Share, StatusBar
- **Build tools**: Gradle (via Android project), JDK 21, Android SDK 36

## How to Rebuild After Making Changes

1. Edit `www/index.html` (this is the app source)
2. Sync web assets into the Android project:
   ```
   npx cap sync
   ```
3. Build the debug APK:
   ```bash
   set JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot
   set ANDROID_SDK_ROOT=C:\Users\JeffR\android-sdk
   cd android
   gradlew.bat assembleDebug
   ```
4. The APK will be at: `android\app\build\outputs\apk\debug\app-debug.apk`

### One-liner rebuild (from project root, in Git Bash):

```bash
export JAVA_HOME="/c/Program Files/Microsoft/jdk-21.0.10.7-hotspot" && export ANDROID_SDK_ROOT="$HOME/android-sdk" && npx cap sync && cd android && ./gradlew.bat assembleDebug && cd ..
```

## Deploying Updates

The user updates the app via the **in-app OTA update mechanism** only. Do NOT suggest ADB install, USB transfer, or any manual APK installation steps.

## Key Capacitor Details

- **App ID**: `com.biblereading.app2026`
- **App Name**: Bible Reading 2026
- **Web Dir**: `www/`
- **Theme color**: `#1a1612` (dark wood)
- **Accent color**: `#d4a574` (gold)
- External links use Capacitor `Browser` plugin (in-app browser on Android)
- Export/backup uses Capacitor `Filesystem` + `Share` plugins on Android
- All interactive JS functions are on `window.*` (required since they're called from inline onclick handlers)

## Installed Dependencies (on this machine)

- **JDK 21**: `C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot`
- **JDK 17**: `C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot`
- **Android SDK**: `C:\Users\JeffR\android-sdk` (platforms 34+36, build-tools 34+36, platform-tools, cmdline-tools)
