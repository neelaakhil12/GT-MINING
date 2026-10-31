# GT Network - Android Mobile App

This directory contains the standalone React Native / Expo Android application, cloning the exact mobile view and interactions of the GT Network website.

---

## 📱 Features Included

1. **Dashboard (`DashboardScreen.tsx`)**:
   - Header with GT Network branding and user greeting.
   - Market Overview card with the **11-Coin 3D Cross-Horizontal Orbit Animation** (`GtCoinOrbit.tsx`).
   - GT Tasks bounty card.
   - Real-time mining status and hardware node metrics.

2. **Protocol Mining (`MiningScreen.tsx`)**:
   - 4-Hour Mining Cycle countdown timer.
   - Interactive 3D pulsating GT Core Node with rotating ring.
   - "Start 4-Hour Session" action button with haptic feedback.
   - Real-time metrics: Hash Rate (2.50 GH/s), Session Earned, Uptime, Online Nodes.

3. **Referrals & Dividends (`ReferralsScreen.tsx`)**:
   - Protocol Dividend claim card with cryptographic proof ready.
   - **Claim button with continuous rotating neon line beam animation** (`ClaimRotatingButton.tsx`).
   - Protocol Rule callout: *"If your referred friend mines 100 GT, you earn 10 GT in commission."*
   - Official brand social media sharing buttons: WhatsApp, Telegram, X, Instagram, and Native Share (`SocialShareRow.tsx`).
   - Referral Friends list with active node badges.

4. **Floating Bottom Navigation (`FloatingBottomNav.tsx`)**:
   - Frosted glass floating pill bar matching the website's exact design.
   - 4 Tabs: Home, Node, Mine, Referrals with active elevated forest-green squircle.

5. **Additional Screens**:
   - **Private Network (`PrivateNetworkScreen.tsx`)**: Encrypted P2P mobile chat interface.
   - **Wallet (`WalletScreen.tsx`)**: GT Vault wallet with Send/Receive and transaction activity.
   - **Tasks (`TasksScreen.tsx`)**: Community bounties and rewards.
   - **Profile (`ProfileScreen.tsx`)**: Account details, 2FA, and KYC status.
   - **Notifications (`NotificationsScreen.tsx`)**: Protocol and referral alerts.

---

## 🚀 How to Run the App

### 1. Test on your Android Phone with Expo Go
1. Install **Expo Go** from the Google Play Store on your Android phone.
2. In your terminal, navigate to the `android-app` directory:
   ```bash
   cd android-app
   npx expo start
   ```
3. Scan the QR code displayed in the terminal using the Expo Go app.

---

### 2. Generate Native Android Project (for Android Studio / APK)
To build a standalone APK using Android Studio:
```bash
cd android-app
npx expo prebuild
```
This generates the native `android/` directory containing the Gradle build files and Java/Kotlin code, which you can open in Android Studio and build into an `.apk` (`Build > Build Bundle(s) / APK(s) > Build APK(s)`).

---

### 3. Build APK via EAS Cloud
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
This builds an installable `.apk` file directly in the cloud.

