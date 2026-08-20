"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface AuthModalContextValue {
  open: boolean;
  redirectTo: string;
  openModal: (redirectTo?: string) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/");

  const value = useMemo<AuthModalContextValue>(
    () => ({
      open,
      redirectTo,
      openModal: (target = "/") => {
        setRedirectTo(target);
        setOpen(true);
      },
      closeModal: () => setOpen(false),
    }),
    [open, redirectTo]
  );

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
