"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

import { ThemeSwitch } from "@/components/theme-switch";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Entradas", href: "/entries" },
  { label: "Nueva Entrada", href: "/entries/new" },
];

export const Navbar = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">₦</span>
            </div>
            <p className="font-bold text-inherit">NiunMango</p>
          </NextLink>
        </NavbarBrand>

        {/* Navigation Items (only show if authenticated) */}
        {isAuthenticated && (
          <ul className="hidden lg:flex gap-4 justify-start ml-6">
            {navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                    isActive(item.href) && "text-primary font-medium"
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </ul>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        {isLoading ? (
          <NavbarItem>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </NavbarItem>
        ) : isAuthenticated && user ? (
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  name={user.name || "Usuario"}
                  size="sm"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Conectado como</p>
                  <p className="font-semibold">{user.email}</p>
                </DropdownItem>
                <DropdownItem key="dashboard" as={NextLink} href="/dashboard">
                  Dashboard
                </DropdownItem>
                <DropdownItem key="entries" as={NextLink} href="/entries">
                  Mis Entradas
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={handleSignOut}
                >
                  Cerrar Sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <NavbarItem>
            <Button as={NextLink} color="primary" href="/login" variant="flat">
              Iniciar Sesión
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
};
