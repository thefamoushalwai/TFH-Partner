import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export interface NetworkStatus {
  /** True when the device has an active internet connection */
  isOnline: boolean;
  /**
   * True when the connection exists but is low-quality:
   * - cellular 2G / unknown generation
   * - connection strength below 50 %
   * - link speed below 1 Mbps (if available)
   */
  isWeak: boolean;
  /** Underlying connection type reported by the OS ("wifi", "cellular", etc.) */
  connectionType: string | null;
}

const SAFE_DEFAULT: NetworkStatus = {
  isOnline: true,  // optimistic default – avoids false offline flash on mount
  isWeak: false,
  connectionType: null,
};

const WEAK_CELLULAR_TYPES = new Set(["2g", "unknown"]);

/**
 * Safely evaluate a NetInfoState into our simplified NetworkStatus.
 * All field access is guarded – a malformed / undefined state just
 * returns the safe default.
 */
function evaluateState(state: NetInfoState | null | undefined): NetworkStatus {
  // Guard: netinfo can call the listener with undefined during early init
  if (!state) return SAFE_DEFAULT;

  try {
    const isOnline = !!(
      state.isConnected && state.isInternetReachable !== false
    );

    let isWeak = false;

    if (isOnline) {
      const details = state.details as Record<string, unknown> | null;

      // Cellular – flag 2G / unknown generation
      if (state.type === "cellular") {
        const gen = details?.cellularGeneration as string | null | undefined;
        if (gen && WEAK_CELLULAR_TYPES.has(gen.toLowerCase())) {
          isWeak = true;
        }
      }

      // Wi-Fi – flag low signal strength (0–4 on Android, 0–100 on iOS)
      if (state.type === "wifi" && details) {
        const strength = details.strength as number | null | undefined;
        if (typeof strength === "number" && strength < 50) {
          isWeak = true;
        }
      }

      // Flag very low link speed (in Mbps, Android only)
      if (details) {
        const linkSpeed = details.linkSpeed as number | null | undefined;
        if (typeof linkSpeed === "number" && linkSpeed > 0 && linkSpeed < 1) {
          isWeak = true;
        }
      }
    }

    return {
      isOnline,
      isWeak,
      connectionType: state.type ?? null,
    };
  } catch {
    // If anything goes wrong evaluating state, stay optimistic
    return SAFE_DEFAULT;
  }
}

/**
 * Returns real-time network status.
 *
 * Crash-safe: all NetInfo calls are wrapped in try/catch so a native
 * module initialization failure (e.g. "Cannot read property 'stale'
 * of undefined") will never bubble up to the component tree.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(SAFE_DEFAULT);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        // configure() triggers native module setup – calling it before
        // fetch/addEventListener avoids the 'stale' undefined race.
        NetInfo.configure({});

        const initial = await NetInfo.fetch();
        setStatus(evaluateState(initial));
      } catch (e) {
        // Native module not available (e.g. Expo Go without custom dev build) –
        // silently ignore and keep the optimistic default.
        console.warn("[useNetworkStatus] NetInfo.fetch failed:", e);
      }

      try {
        unsubscribe = NetInfo.addEventListener((state) => {
          setStatus(evaluateState(state));
        });
      } catch (e) {
        console.warn("[useNetworkStatus] NetInfo.addEventListener failed:", e);
      }
    };

    init();

    return () => {
      try {
        unsubscribe?.();
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  return status;
}
