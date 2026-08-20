"use client";

import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function ProfilePage() {
  const { user, loading, isConfigured, signOut } = useAuth();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-8">
      <header className="border-b border-ink px-4 pb-6 pt-[calc(env(safe-area-inset-top)+20px)]">
        <h1 className="text-3xl font-semibold tracking-tight">PROFILE</h1>
      </header>

      <div className="flex flex-col gap-6 px-5 pt-6">
        {!isConfigured && (
          <p className="border border-grey-200 bg-grey-50 px-4 py-3 text-xs text-grey-600">
            Sign-in isn&apos;t configured in this environment yet — the map, search, and Explore
            still work fully without an account.
          </p>
        )}

        {isConfigured && !loading && !user && (
          <div className="flex flex-col items-center gap-4 border border-grey-200 px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-ink">
              <UserIcon size={20} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide">You&apos;re browsing anonymously</p>
              <p className="max-w-xs text-sm text-grey-600">
                Sign in to save places and build collections.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <GoogleSignInButton redirectTo="/profile" />
            </div>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-4 border border-grey-200 p-4">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 border border-ink object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center border border-ink">
                <UserIcon size={20} strokeWidth={1.5} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user.user_metadata?.full_name ?? user.email ?? "Jakarta explorer"}
              </p>
              <p className="truncate text-xs text-grey-500">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()} aria-label="Sign out">
              <LogOut size={16} strokeWidth={1.75} />
            </Button>
          </div>
        )}

        <section className="space-y-2 border-t border-grey-200 pt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">
            About VIRAL / GEM
          </h2>
          <p className="text-sm leading-relaxed text-grey-600">
            A curated discovery layer over Jakarta — mapping what&apos;s currently viral online
            against genuinely good hidden gems that haven&apos;t been overexposed yet. Jakarta
            only, for now.
          </p>
        </section>
      </div>
    </main>
  );
}
