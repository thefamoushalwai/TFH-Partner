# THF Partner App — Comprehensive Audit Report

## App Overview
**THF (The Famous Halwai) Partner App** — an Expo React Native application for chef/partner onboarding, KYC verification, booking management, and earnings tracking.

---

## 🗺️ App Flow Diagram

```mermaid
flowchart TD
    A["index.tsx (Splash)"] --> B{Session exists?}
    B -->|No| C["LanguageSelect"]
    B -->|Yes, no profile| D["Experience (KYC)"]
    B -->|Yes, has profile| E["Dashboard"]
    
    C --> F["MobileLogin"]
    F --> G{Profile exists?}
    G -->|No (signup)| H["OTP"]
    G -->|Yes (login)| I["Password Step"]
    
    H --> J["password (Create)"]
    J --> K{Profile complete?}
    K -->|Yes| E
    K -->|No| D
    
    I -->|Success| L{Profile complete?}
    L -->|Yes| E
    L -->|No| D
    
    I -->|Forgot| M["ForgotPassword"]
    M --> N["OTP (forgot mode)"]
    N --> O["ResetPassword"]
    O --> E
    
    D --> P["Cuisines"]
    P --> Q["Details"]
    Q --> R["UploadDocuments_1"]
    R --> S["Selfie"]
    R --> T["Aadhar"]
    R --> U["Pan"]
    S --> R
    T --> R
    U --> R
    R -->|All docs uploaded| V["linkKycToUser → Dashboard"]
```

---

## 🔴 Critical Issues (Crash Risks)

### 1. Missing Screen Registrations in Root Layout
**File:** [_layout.tsx](file:///d:/Projects/TFH/THF/app/_layout.tsx#L83-L95)

**Problem:** Several screens that exist as files are **not registered** in the `Stack` navigator:

```diff
 <Stack screenOptions={{ headerShown: false }}>
   <Stack.Screen name="index" />
   <Stack.Screen name="welcome/LanguageSelect" />
   <Stack.Screen name="welcome/MobileLogin" />
   <Stack.Screen name="welcome/OTP" />
   <Stack.Screen name="welcome/password" />
   <Stack.Screen name="welcome/ForgotPassword" />
+  <Stack.Screen name="welcome/ResetPassword" />    // ❌ MISSING
   <Stack.Screen name="kyc/Details" />
   <Stack.Screen name="kyc/Experience" />
   <Stack.Screen name="kyc/Aadhar" />
   <Stack.Screen name="kyc/Selfie" />
+  <Stack.Screen name="kyc/Cuisines" />              // ❌ MISSING
+  <Stack.Screen name="kyc/Pan" />                    // ❌ MISSING
+  <Stack.Screen name="kyc/UploadDocuments_1" />      // ❌ MISSING
+  <Stack.Screen name="edit/AccountDetails" />        // ❌ MISSING
+  <Stack.Screen name="edit/ChangeLanguage" />        // ❌ MISSING
+  <Stack.Screen name="edit/EditDetails" />           // ❌ MISSING
+  <Stack.Screen name="edit/JobTimer" />              // ❌ MISSING
+  <Stack.Screen name="edit/ReferFriend" />           // ❌ MISSING
   <Stack.Screen name="(tabs)" />
 </Stack>
```

**Impact:** While expo-router auto-discovers files, **missing explicit registrations** can cause inconsistent back-stack behavior and flash of unstyled navigation headers on some devices. More critically, if `headerShown: false` isn't inherited by these routes, users will see broken headers during KYC.

> [!CAUTION]
> The `ResetPassword` screen is navigated to via `router.replace()` from OTP but is NOT registered in the Stack. This can cause crashes on certain Android versions.

---

### 2. No Global Error Boundary
**File:** [_layout.tsx](file:///d:/Projects/TFH/THF/app/_layout.tsx)

**Problem:** There is **no `ErrorBoundary`** export in the root layout. Any uncaught JS error during rendering will crash the app with a white screen.

**Fix:** Add an `ErrorBoundary` export:
```tsx
export { ErrorBoundary } from 'expo-router';
```

> [!IMPORTANT]
> This is the #1 most likely cause of Play Store crash reports. Without an error boundary, any rendering error in ANY screen cascades into a full crash.

---

### 3. Inconsistent `hasCompletedProfile` Definitions
**Problem:** The `hasCompletedProfile` function is **defined 3 times** across different files with **different logic**:

| File | Logic |
|------|-------|
| [OTP.tsx](file:///d:/Projects/TFH/THF/app/welcome/OTP.tsx#L33-L47) | Checks `name, email, phone, emergencyPhone, gender, city, address, experience[]` |
| [password.tsx](file:///d:/Projects/TFH/THF/app/welcome/password.tsx#L57-L70) | Same as OTP (strict check) |
| [MobileLogin.tsx](file:///d:/Projects/TFH/THF/app/welcome/MobileLogin.tsx#L45-L47) | Simply checks `profile !== null` (lenient) |
| [index.tsx](file:///d:/Projects/TFH/THF/app/index.tsx#L74) | Simply checks `profile` is truthy (lenient) |

**Impact:** A user who has a Firestore doc with only partial data (e.g., just `experience`) will:
- Be sent to **Dashboard** by `MobileLogin` and `index.tsx` ✅
- Be sent to **KYC flow** by `OTP.tsx` and `password.tsx` ❌

This creates a loop where login routes to Dashboard but OTP routes to KYC for the same user.

> [!WARNING]
> This inconsistency is a **routing loop risk**. A user who signed up via OTP, set a password, but didn't complete Details will oscillate between KYC and Dashboard depending on which login path they use.

---

## 🟡 Medium Issues (Workflow Bugs)

### 4. KYC Flow Never Uses `Cuisines` Screen in `hasCompletedProfile`
**Problem:** The KYC onboarding flow goes `Experience → Cuisines → Details → UploadDocuments_1`. However, the `hasCompletedProfile` check (in OTP/password screens) checks for `experience[]` but **never checks for `cuisines[]`**. This means a user who completes Experience but skips Cuisines can be considered "complete" and sent to Dashboard.

---

### 5. `Experience` Screen Back Button Goes to Create Password
**File:** [Experience.tsx](file:///d:/Projects/TFH/THF/app/kyc/Experience.tsx#L103-L111)

**Problem:** The back button calls `router.back()`, which navigates to the `password` screen (the previous step in the Stack). This creates a confusing UX where the user goes back to password creation from KYC onboarding. If they came via `index.tsx → Experience` (returning user without profile), `router.back()` navigates to the Splash screen.

---

### 6. AsyncStorage Keys Lack Cleanup on Logout
**Problem:** During logout (in Profile.tsx), only `sessionStorage.clearSession()` and `useUserStore.getState().clearProfile()` are called. But the following AsyncStorage keys are **never cleaned up**:

| Key | Set By | Cleaned on Logout? |
|-----|--------|:------------------:|
| `profilePhotoUrl` | Selfie.tsx | ❌ |
| `aadharPhotoUrl` | Aadhar.tsx | ❌ |
| `aadharPhotoBackUrl` | Aadhar.tsx | ❌ |
| `panPhotoUrl` | Pan.tsx | ❌ |
| `user_profile_cache` | Multiple screens | ❌ |
| `selected_language` | LanguageSelect.tsx | ❌ |
| `ignored_bookings` | Dashboard.tsx | ❌ |

**Impact:** If a user logs out and signs in with a **different account**, they may see stale KYC document URLs from the previous user, causing document misattribution.

> [!WARNING]
> This is a **data integrity issue**. KYC document URLs from User A may be displayed or linked to User B if they share the same device.

---

### 7. `UploadDocuments_1` — Race Condition on `useFocusEffect`
**File:** [UploadDocuments_1.tsx](file:///d:/Projects/TFH/THF/app/kyc/UploadDocuments_1.tsx)

**Problem:** The `useFocusEffect` callback calls `AsyncStorage.multiGet()` to sync document upload status. However:
- There is no `try/catch` wrapper documented around `multiGet`
- If `AsyncStorage` is slow or errors (common on low-memory Android devices), the status checkmarks won't update
- The `handleContinue` (linking KYC to user) depends on all 4 flags being true, but these flags are derived from AsyncStorage reads that may silently fail

---

### 8. Notification Trigger Deprecation
**File:** [notificationService.ts](file:///d:/Projects/TFH/THF/src/services/notificationService.ts#L102)

```ts
trigger: null, // fire immediately
```

**Problem:** Passing `null` as the trigger is deprecated in newer versions of `expo-notifications`. The correct way for an immediate notification is:
```ts
trigger: { type: 'timeInterval', seconds: 1, repeats: false }
```

---

## 🟢 Minor Issues (Polish / Best Practices)

### 9. `READ_EXTERNAL_STORAGE` Permission is Deprecated
**File:** [app.json](file:///d:/Projects/TFH/THF/app.json#L24-L26)

```json
"permissions": [
  "android.permission.CAMERA",
  "android.permission.READ_EXTERNAL_STORAGE"  // ❌ Deprecated on Android 13+
]
```

**Problem:** `READ_EXTERNAL_STORAGE` has been split into `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, and `READ_MEDIA_AUDIO` starting with Android 13 (API 33). This permission does nothing on newer devices.

**Fix:** Since `expo-image-picker` handles its own permissions, consider removing this entirely and letting the library manage it.

---

### 10. Missing `ios` Configuration Block
**File:** [app.json](file:///d:/Projects/TFH/THF/app.json)

**Problem:** There is **no `ios` block** in `app.json`. If you ever plan to publish on iOS, this will cause the build to fail. Even if iOS isn't targeted, having an empty `ios: {}` block prevents confusion.

---

### 11. Hardcoded Phone Number Fallback in OTP Screen
**File:** [OTP.tsx](file:///d:/Projects/TFH/THF/app/welcome/OTP.tsx#L55)

```ts
const phoneNumber = params.phoneNumber ?? '+91 9205394233';
```

**Problem:** A hardcoded fallback phone number is used if `params.phoneNumber` is missing. This should either throw an error or redirect back to MobileLogin instead of using a default dev number.

---

### 12. No `adaptiveIcon.foregroundImage` Fallback
**File:** [app.json](file:///d:/Projects/TFH/THF/app.json#L19)

```json
"foregroundImage": "./assets/app_assets/TFH-splash (3).png"
```

The filename contains spaces and parentheses, which can cause issues on some CI/CD systems and certain Android devices.

---

### 13. `kycStatus` Values Mismatch
**Problem:** The `UserProfile` interface in [userService.ts](file:///d:/Projects/TFH/THF/src/services/userService.ts#L35) defines:
```ts
kycStatus: 'unsubmitted' | 'pending' | 'pending_verification' | 'approved' | 'verified' | 'rejected'
```

But `createUserProfile` sets `kycStatus: 'pending'`, while `linkKycToUser` in `kycStorageService.ts` sets `kycStatus: 'pending_verification'`. The Dashboard checks against these values differently in various places. Consider consolidating to a single enum.

---

## 📋 Permissions Audit

| Permission | Declared In | Used By | Status |
|-----------|-------------|---------|--------|
| `CAMERA` | `app.json`, `expo-camera`, `expo-image-picker` | Selfie, Aadhar, Pan screens | ✅ Properly configured |
| `READ_EXTERNAL_STORAGE` | `app.json` | Image picker | ⚠️ Deprecated on Android 13+ |
| Push Notifications | `expo-notifications` plugin | Dashboard, _layout.tsx | ✅ Configured |
| Internet | Auto-granted | All Firebase operations | ✅ OK |
| SecureStore | `expo-secure-store` plugin | Password caching | ✅ Configured |

---

## 📊 Summary

| Severity | Count | Description |
|----------|:-----:|-------------|
| 🔴 Critical | 3 | Missing routes, no error boundary, inconsistent profile checks |
| 🟡 Medium | 5 | Stale AsyncStorage on logout, race conditions, deprecations |
| 🟢 Minor | 5 | Deprecated permissions, hardcoded values, naming issues |

---

## ✅ Recommended Fix Priority

1. **Add `ErrorBoundary` export to `_layout.tsx`** — prevents white-screen crashes
2. **Register all missing screens in the Stack** — prevents navigation crashes
3. **Unify `hasCompletedProfile`** into a shared utility function
4. **Clean AsyncStorage on logout** — prevents cross-account data leaks
5. **Replace deprecated notification trigger** — prevents future breakage
6. **Remove `READ_EXTERNAL_STORAGE`** — no-op on Android 13+
7. **Remove hardcoded phone number fallback** in OTP.tsx

> [!TIP]
> The most impactful fix is adding the `ErrorBoundary` — this alone could eliminate the majority of Play Store crash reports by catching rendering errors gracefully instead of crashing the entire app.
