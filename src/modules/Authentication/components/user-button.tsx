"use client";

import { useState, useCallback, useEffect } from "react";
import { LogOut, Settings, CreditCard, User as UserIcon } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";
import type { Mode } from "@/contexts/settingsContext";
import type { UserProps } from "@/modules/Layout/Types";

interface UserButtonProps {
  user: UserProps | null;
  onLogout?: () => void | Promise<void>;
  onSettings?: () => void;
  onProfile?: () => void;
  onBilling?: () => void;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  showEmail?: boolean;
  showMemberSince?: boolean;
}

export default function UserButton({
  user,
  onLogout,
  onSettings,
  onProfile,
  onBilling,
  showBadge = false,
  badgeText = "Pro",
  badgeVariant = "default",
  size = "md",
  showEmail = true,
  showMemberSince = true,
}: UserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { startTransition } = useThemeTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newMode: Mode = settings.mode === "dark" ? "light" : "dark";

    startTransition(() => {
      const updatedSettings = {
        ...settings,
        mode: newMode,
        theme: {
          ...settings.theme,
          styles: {
            light: settings.theme.styles?.light || {},
            dark: settings.theme.styles?.dark || {},
          },
        },
      };
      updateSettings(updatedSettings);
      setTheme(newMode);
    });
  }, [settings, updateSettings, setTheme, startTransition]);

  const onSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const formatMemberSince = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  if (!user) {
    return null;
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className={`relative flex items-center gap-2 ${
          size === "sm" ? "h-9 px-2" : size === "lg" ? "h-12 px-3" : "h-10 px-2"
        } rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border`}
        disabled
      >
        <div
          className={`${avatarSizes[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center`}
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User avatar"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <span className="text-primary-foreground font-semibold text-sm">
              {getUserInitials(user.name, user.email)}
            </span>
          )}
        </div>

        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">
            {user.name || "User"}
          </span>
          {showEmail && user.email && (
            <span className="text-xs text-muted-foreground leading-none mt-0.5">
              {user.email.length > 20
                ? `${user.email.slice(0, 20)}...`
                : user.email}
            </span>
          )}
        </div>

        {showBadge && (
          <Badge
            variant={badgeVariant}
            className="absolute -top-1 -right-1 h-5 px-1.5 text-[10px] font-semibold"
          >
            {badgeText}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative flex items-center gap-2 ${
            size === "sm"
              ? "h-9 px-2"
              : size === "lg"
              ? "h-12 px-3"
              : "h-10 px-2"
          } rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border`}
          disabled={isLoading}
        >
          <div
            className={`${avatarSizes[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center`}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User avatar"}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-primary-foreground font-semibold text-sm">
                {getUserInitials(user.name, user.email)}
              </span>
            )}
          </div>

          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium leading-none">
              {user.name || "User"}
            </span>
            {showEmail && user.email && (
              <span className="text-xs text-muted-foreground leading-none mt-0.5">
                {user.email.length > 20
                  ? `${user.email.slice(0, 20)}...`
                  : user.email}
              </span>
            )}
          </div>

          {showBadge && (
            <Badge
              variant={badgeVariant}
              className="absolute -top-1 -right-1 h-5 px-1.5 text-[10px] font-semibold"
            >
              {badgeText}
            </Badge>
          )}

          <Badge
            variant={'secondary'}
            className="absolute -top-1 -right-1 h-5 px-1.5 text-[10px] font-semibold"
          >
            {user?.role === 'ADMIN' ? 'Admin' : 'User'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 p-2" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-14 w-14 relative rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/10 shrink-0">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User avatar"}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <span className="text-primary-foreground font-semibold text-lg">
                    {getUserInitials(user.name, user.email)}
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold leading-none">
                    {user.name || "User"}
                  </p>
                  {showBadge && (
                    <Badge
                      variant={badgeVariant}
                      className="h-5 px-2 text-[10px] font-medium"
                    >
                      {badgeText}
                    </Badge>
                  )}
                </div>
                {showEmail && user.email && (
                  <p className="text-xs leading-none text-muted-foreground font-medium">
                    {user.email}
                  </p>
                )}
                {showMemberSince && (
                  <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                    Member since {formatMemberSince(user.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        <div className="space-y-1">
          {onProfile && (
            <DropdownMenuItem
              onClick={onProfile}
              className="cursor-pointer rounded-md py-2.5 px-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">Profile</span>
                </div>
              </div>
            </DropdownMenuItem>
          )}

          {onBilling && (
            <DropdownMenuItem
              onClick={onBilling}
              className="cursor-pointer rounded-md py-2.5 px-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">Billing</span>
                </div>
              </div>
            </DropdownMenuItem>
          )}

          {onSettings && (
            <DropdownMenuItem
              onClick={onSettings}
              className="cursor-pointer rounded-md py-2.5 px-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">Settings</span>
                </div>
              </div>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggleButton
              theme={
                settings.mode === "system"
                  ? "light"
                  : (settings.mode as "light" | "dark")
              }
              onClick={handleThemeToggle}
              variant="polygon"
            />
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer rounded-md py-2.5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">
              {isLoading ? "Logging out..." : "Log out"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
