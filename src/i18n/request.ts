import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // Use defaultLocale as fallback to avoid middleware 404 when locale is missing
  const resolvedLocale = routing.locales.includes(locale as any)
    ? (locale as string)
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
    timeZone: "America/Sao_Paulo",
  };
});
