"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setDataMode, type DataMode } from "@/lib/mode";

const ModeContext = createContext<{ mode: DataMode; setMode: (m: DataMode) => void }>({
  mode: "demo",
  setMode: () => undefined,
});

export function useMode() {
  return useContext(ModeContext);
}

export function ModeProvider({
  initialMode,
  children,
}: {
  initialMode: DataMode;
  children: ReactNode;
}) {
  const router = useRouter();
  // Starts from the server cookie: first render matches hydration.
  const [mode, setModeState] = useState<DataMode>(initialMode);
  const setMode = useCallback(
    (m: DataMode) => {
      setDataMode(m);
      setModeState(m);
      // Server pages gate mock data on the mode cookie; refresh so the
      // new mode applies without manual navigation.
      router.refresh();
    },
    [router],
  );
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}
