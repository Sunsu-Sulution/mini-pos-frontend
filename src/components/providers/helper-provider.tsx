/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { BackendClient } from "@/lib/request";
import { initUser, isErrorResponse, User } from "@/types/request";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFullLoadingContext } from "./full-loading-provider";
import { useAlertContext } from "./alert-provider";

interface HelperContextType {
  setAlert: (
    title: string,
    text: string,
    action: undefined | (() => void),
    canCancel: boolean,
  ) => void;
  setFullLoading: (value: boolean) => void;
  backendClient: BackendClient;
  router: ReturnType<typeof useRouter>;
  userData: User;
  title: string;
  setTitle: (value: string) => void;
}

const HelperContext = createContext<() => HelperContextType>(() => {
  return {
    setAlert: () => {},
    setFullLoading: () => {},
    backendClient: new BackendClient(() => {}),
    // Default placeholder; real router is provided by HelperProvider
    router: {} as ReturnType<typeof useRouter>,
    userData: initUser(),
    title: "sunsu merchandise",
    setTitle: () => {},
  };
});

export function HelperProvider({ children }: { children: ReactNode }) {
  const setAlert = useAlertContext();
  const setFullLoading = useFullLoadingContext();
  const router = useRouter();
  const [userData, setUserData] = useState<User>(initUser());
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const backendClient = new BackendClient(setAlert);
      const response = await backendClient.getUserInfo();
      setFullLoading(true);
      const isError = isErrorResponse(response);
      if (isError) {
        return;
      }
      setFullLoading(false);

      if (window.location.pathname === "/") {
        if (response.id !== "") {
          if (response.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/main");
          }
        }
      } else {
        if (response.id === "") {
          router.push("/");
        }
        if (
          response.role !== "admin" &&
          window.location.pathname.startsWith("/admin")
        ) {
          router.push("/main");
        }
        if (
          response.role === "admin" &&
          !window.location.pathname.startsWith("/admin")
        ) {
          router.push("/admin");
        }
      }
      setUserData(response);
    };

    fetchUserData();
  }, [setAlert, router]);

  const useHelper = useCallback(
    () => ({
      setAlert,
      setFullLoading,
      backendClient: new BackendClient(setAlert),
      router,
      userData,
      setTitle: onSetTitle,
      title,
    }),
    [setAlert, setFullLoading, router, userData, title],
  );

  const onSetTitle = (text: string) => {
    if (!text) {
      document.title = "sunsu merchandise";
      setTitle("sunsu merchandise");
    }
    document.title = "sunsu merchandise - " + text;
    setTitle(text);
  };

  return (
    <HelperContext.Provider value={useHelper}>
      {children}
    </HelperContext.Provider>
  );
}

export const useHelperContext = () => useContext(HelperContext);
