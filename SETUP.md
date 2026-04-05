# Pray4Me — Setup Guide

## Prerequisites

- **Xcode 15.0+** (for iOS 17 and SwiftUI)
- **Apple Developer Account** (for Sign in with Apple and App Store)
- **Firebase Account** ([console.firebase.google.com](https://console.firebase.google.com))
- **CocoaPods** or **Swift Package Manager** (SPM recommended)

## Step 1: Create the Xcode Project

1. Open Xcode → **File → New → Project**
2. Choose **iOS → App**
3. Settings:
   - **Product Name:** `Pray4Me`
   - **Bundle Identifier:** `com.yourname.pray4me`
   - **Interface:** SwiftUI
   - **Language:** Swift
   - **Minimum Deployment:** iOS 17.0
4. Save to this repo's root directory
5. Delete the default `ContentView.swift` and `Pray4MeApp.swift` that Xcode creates
6. Drag the `Pray4Me/` source folder into the Xcode project navigator

## Step 2: Add Dependencies via SPM

In Xcode: **File → Add Package Dependencies**

Add these packages:

| Package | URL | Version |
|---------|-----|---------|
| Firebase iOS SDK | `https://github.com/firebase/firebase-ios-sdk.git` | 11.0.0+ |
| Google Sign-In | `https://github.com/google/GoogleSignIn-iOS.git` | 8.0.0+ |

When prompted, add these libraries to your target:
- `FirebaseAuth`
- `FirebaseFirestore`
- `FirebaseMessaging`
- `GoogleSignIn`
- `GoogleSignInSwift`

## Step 3: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create a new project** named `Pray4Me`
2. **Add an iOS app** with your bundle ID
3. Download `GoogleService-Info.plist` and add it to the Xcode project root (next to Info.plist)
4. Enable **Authentication** providers:
   - Google
   - Apple
   - Facebook (optional — requires Facebook Developer setup)
5. Enable **Cloud Firestore** in the Firebase Console
6. Deploy the Firestore rules from `Pray4Me/Resources/Firestore.rules`
7. Deploy the indexes from `Pray4Me/Resources/Firestore.indexes.json`

## Step 4: Configure Sign In with Apple

1. In your Apple Developer Account → **Certificates, Identifiers & Profiles**
2. Edit your App ID → Enable **Sign In with Apple**
3. In Xcode → Select your target → **Signing & Capabilities** → **+ Capability** → **Sign in with Apple**

## Step 5: Configure Google Sign In

1. In Firebase Console → Authentication → Sign-in method → Google → Enable
2. Copy the **Reversed Client ID** from `GoogleService-Info.plist`
3. In Xcode → Target → Info → URL Types:
   - Add a URL scheme with the Reversed Client ID value

## Step 6: Configure Location & Notifications

In Xcode → Target → **Signing & Capabilities**:

1. Add **Background Modes**:
   - Location updates
   - Remote notifications
2. The `Info.plist` already includes `NSLocationWhenInUseUsageDescription`

## Step 7: Facebook Login (Optional)

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add the Facebook SDK via SPM: `https://github.com/facebook/facebook-ios-sdk.git`
3. Add `FacebookLogin` library to your target
4. Update `Info.plist` with your Facebook App ID
5. Implement the Facebook login flow in `AuthViewModel.signInWithFacebook()`

## Step 8: Build & Run

1. Select an iOS 17+ simulator or your device
2. Build and run (`Cmd + R`)
3. Use the **DEBUG location simulator** buttons (visible in debug builds) to test the geofencing at holy sites

## Project Structure

```
Pray4Me/
├── App/
│   └── Pray4MeApp.swift          # App entry point, Firebase config
├── Models/
│   ├── User.swift                 # AppUser model
│   ├── DuaRequest.swift           # Dua request + DuaMadeRecord models
│   ├── DuaCategory.swift          # 12 categories + suggested duas
│   └── HolySite.swift             # 5 geofenced holy sites
├── ViewModels/
│   ├── AuthViewModel.swift        # Auth (Google, Apple, Facebook)
│   ├── DuaRequestViewModel.swift  # Create/manage dua requests
│   └── LocationViewModel.swift    # Location & geofencing
├── Views/
│   ├── Auth/
│   │   └── LoginView.swift        # Login + splash screen
│   ├── Home/
│   │   ├── MainTabView.swift      # Tab navigation
│   │   └── HomeView.swift         # Dashboard
│   ├── Request/
│   │   ├── NewDuaRequestView.swift    # Create new dua request
│   │   └── MyDuaRequestsView.swift    # User's own requests
│   ├── MakeDua/
│   │   └── MakeDuaView.swift      # Geofenced dua-making view
│   ├── Profile/
│   │   └── ProfileView.swift      # User profile + settings
│   └── Components/
│       ├── DuaRequestCard.swift           # Reusable dua card
│       └── IslamicPatternHeader.swift     # Decorative header
├── Services/
│   ├── FirebaseService.swift      # Firestore CRUD operations
│   ├── LocationService.swift      # CoreLocation + geofencing
│   └── NotificationService.swift  # Push notification handling
├── Theme/
│   └── AppTheme.swift             # Colors, fonts, modifiers
└── Resources/
    ├── Info.plist                  # App config + permissions
    ├── Firestore.rules            # Security rules
    └── Firestore.indexes.json     # Required indexes
```

## Holy Sites & Geofencing

The app monitors these locations:

| Site | City | Radius |
|------|------|--------|
| Masjid al-Haram | Makkah | 1,000m |
| Mina | Makkah | 2,000m |
| Muzdalifah | Makkah | 2,000m |
| Arafat | Makkah | 3,000m |
| Masjid an-Nabawi | Madinah | 800m |

## Dua Categories

Health & Healing, Forgiveness, Guidance, Family & Children, Marriage, Rizq (Provision), Protection, Studies & Work, Patience & Strength, Jannah, Deceased Loved Ones, The Ummah, Custom.

Each category includes suggested duas from the Quran and Sunnah.

## Future Enhancements (v2)

- Make dua from anywhere (not just holy sites)
- Dua request expiration / seasonal (Hajj-only requests)
- Community features (dua groups, masjid communities)
- Arabic language support
- Widget for daily dua count
- Share dua requests via link
