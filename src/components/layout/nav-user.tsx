"use client";

import { clearAuth, getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Power } from "lucide-react";

const LIGHT_AVATAR_COLORS = [
  "b3e5fc",
  "c8e6c9",
  "d1c4e9",
  "ffe0b2",
  "ffccbc",
  "f0f4c3",
  "bbdefb",
  "e1bee7",
];

export function NavUser() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "User", email: "", avatar: "" });

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(
        userData.email || "user",
      )}&backgroundColor=${LIGHT_AVATAR_COLORS.join(",")}`;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({
        name: userData.name || "User",
        email: userData.email ?? "",
        avatar: avatarUrl,
      });
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          asChild
          className="flex items-center justify-between gap-2 px-2 py-1.5 text-left text-sm hover:bg-transparent active:bg-transparent"
        >
          <div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Logout"
            >
              <Power className="size-4" />
            </Button>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
