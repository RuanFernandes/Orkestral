"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useState } from "react";
import ptBR from "../../messages/pt-br.json";
import enUS from "../../messages/en-us.json";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "#0f172a",
        color: "gray.100",
      },
    },
  },
  colors: {
    background: {
      main: "#0f172a",
      canvas: "#111827",
      panel: "#1f2937",
    },
    border: {
      default: "#2d3748",
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "blue",
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "blue.400",
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: "#1f2937",
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "#1f2937",
        },
      },
    },
  },
});

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "pt-br",
  setLocale: () => {},
});

export const useLocale = () => useContext(LocaleContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("pt-br");
  const [messages, setMessages] = useState(ptBR);

  useEffect(() => {
    // carrega o idioma salvo ou detecta do navegador
    const savedLocale = localStorage.getItem("orkestral-locale");
    if (savedLocale) {
      setLocaleState(savedLocale);
      setMessages(savedLocale === "pt-br" ? ptBR : enUS);
    } else {
      const browserLang = navigator.language.toLowerCase();
      const detectedLocale = browserLang.startsWith("pt") ? "pt-br" : "en-us";
      setLocaleState(detectedLocale);
      setMessages(detectedLocale === "pt-br" ? ptBR : enUS);
      localStorage.setItem("orkestral-locale", detectedLocale);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    setMessages(newLocale === "pt-br" ? ptBR : enUS);
    localStorage.setItem("orkestral-locale", newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="America/Sao_Paulo"
      >
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
