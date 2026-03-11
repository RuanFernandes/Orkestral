import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en-us", "pt-br"],
  defaultLocale: "pt-br",
  localePrefix: "never", // não adiciona prefixo de idioma nas URLs
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
