import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_PRIMARY, PRIMARY_COLOR_PRESETS } from "../theme/primaryColors";

const PRIMARY_COLOR_KEY = "gonext_primary_color";

export type PrimaryColorHex = (typeof PRIMARY_COLOR_PRESETS)[number];

type PrimaryColorContextValue = {
  primaryColor: string;
  setPrimaryColor: (hex: string) => Promise<void>;
};

const PrimaryColorContext = createContext<PrimaryColorContextValue | null>(null);

function isValidPreset(hex: string): hex is PrimaryColorHex {
  return PRIMARY_COLOR_PRESETS.includes(hex as PrimaryColorHex);
}

export function PrimaryColorProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY);

  useEffect(() => {
    AsyncStorage.getItem(PRIMARY_COLOR_KEY).then((value) => {
      if (value && isValidPreset(value)) {
        setPrimaryColorState(value);
      }
    });
  }, []);

  const setPrimaryColor = useCallback(async (hex: string) => {
    if (!isValidPreset(hex)) return;
    setPrimaryColorState(hex);
    await AsyncStorage.setItem(PRIMARY_COLOR_KEY, hex);
  }, []);

  return (
    <PrimaryColorContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </PrimaryColorContext.Provider>
  );
}

export function usePrimaryColor() {
  const ctx = useContext(PrimaryColorContext);
  if (!ctx) {
    throw new Error("usePrimaryColor must be used within PrimaryColorProvider");
  }
  return ctx;
}
