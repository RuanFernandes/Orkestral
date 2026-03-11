"use client";

import { HStack, Button } from "@chakra-ui/react";
import { useLocale } from "./Providers";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <HStack spacing={1}>
      <Button
        size="xs"
        variant={locale === "en-us" ? "solid" : "ghost"}
        colorScheme="blue"
        onClick={() => setLocale("en-us")}
      >
        EN
      </Button>
      <Button
        size="xs"
        variant={locale === "pt-br" ? "solid" : "ghost"}
        colorScheme="blue"
        onClick={() => setLocale("pt-br")}
      >
        PT
      </Button>
    </HStack>
  );
}
