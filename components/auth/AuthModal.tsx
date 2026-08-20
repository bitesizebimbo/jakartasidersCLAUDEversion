"use client";

import { Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";

export function AuthModal() {
  const { open, redirectTo, closeModal } = useAuthModal();
  const { isConfigured } = useAuth();

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => !next && closeModal()}
      title="Save your Jakarta discoveries"
      className="max-w-md sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <div className="flex flex-col items-center gap-5 px-6 pb-10 pt-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center border border-ink">
          <Sparkles size={20} strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">SAVE YOUR JAKARTA DISCOVERIES</h2>
          <p className="text-sm text-grey-600">
            Sign in to save places, build collections, and pick up where you left off.
          </p>
        </div>

        {isConfigured ? (
          <div className="w-full max-w-xs">
            <GoogleSignInButton redirectTo={redirectTo} />
          </div>
        ) : (
          <p className="border border-grey-200 bg-grey-50 px-4 py-3 font-mono text-xs uppercase tracking-wide text-grey-500">
            Sign-in isn&apos;t configured in this environment yet.
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
