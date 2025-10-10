"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import Image from "next/image";

const FullLoadingContext = createContext((value: boolean) => value);

function FullLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#00000050] bg-opacity-50 z-50">
      <Image
        src="/logo.png"
        alt="Loading"
        width={60}
        height={60}
        className="animate-spin [animation-direction:reverse]"
        priority
      />
    </div>
  );
}

export function FullLoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false);

  const onChangeLoading = useCallback((value: boolean) => {
    setLoading(value);
    return value;
  }, []);

  return (
    <FullLoadingContext.Provider value={onChangeLoading}>
      {loading && <FullLoading />}
      {children}
    </FullLoadingContext.Provider>
  );
}

export const useFullLoadingContext = () => useContext(FullLoadingContext);
