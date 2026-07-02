import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/providers/trpc";

// All pairs available in the platform (mirrors TRACKED_PAIRS in market-router.ts)
export const AVAILABLE_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
  "XRP/USDT", "DOGE/USDT", "ADA/USDT", "AVAX/USDT",
  "LINK/USDT", "DOT/USDT", "MATIC/USDT", "UNI/USDT",
];

interface TradingPairContextValue {
  activePair: string;
  setActivePair: (pair: string) => void;
}

const TradingPairContext = createContext<TradingPairContextValue>({
  activePair: "BTC/USDT",
  setActivePair: () => {},
});

export function TradingPairProvider({ children }: { children: ReactNode }) {
  const [activePair, setActivePair] = useState("BTC/USDT");
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Sync from user preferences once loaded
  useEffect(() => {
    const pref = (user?.preferences as any)?.defaultPair;
    if (pref && AVAILABLE_PAIRS.includes(pref)) {
      setActivePair(pref);
    }
  }, [user]);

  return (
    <TradingPairContext.Provider value={{ activePair, setActivePair }}>
      {children}
    </TradingPairContext.Provider>
  );
}

export function useActivePair() {
  return useContext(TradingPairContext);
}
