"use client";

import {
  Box,
  VStack,
  HStack,
  IconButton,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { Copy, Download, FileUp } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useComposeStore } from "@/store/composeStore";
import {
  generateDockerCompose,
  parseDockerCompose,
} from "@/lib/composeGenerator";
import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";

export function YamlViewer() {
  const t = useTranslations();
  const { services, importServices, addNetwork, setEdgeConnections } =
    useComposeStore();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const yamlContent = useMemo(() => {
    return generateDockerCompose(services);
  }, [services]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      toast({
        title: t("copiedToClipboard"),
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: t("failedToCopy"),
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t("downloadedYaml"),
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const {
        services: importedServices,
        networks: importedNetworks,
        edgeConnections,
      } = parseDockerCompose(content);

      if (importedServices.length > 0 || importedNetworks.length > 0) {
        // importa os serviços
        importServices(importedServices, importedNetworks);

        // adiciona as redes na store
        importedNetworks.forEach((network) => {
          addNetwork(network);
        });

        // configura as conexões
        setEdgeConnections(edgeConnections);

        toast({
          title: `${importedServices.length} ${t("importedServices")}, ${importedNetworks.length} ${t("networks")}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: t("noServicesFound"),
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      }
    };
    reader.readAsText(file);

    // limpa o input
    event.target.value = "";
  };

  return (
    <VStack
      h="full"
      spacing={0}
      bg="#1f2937"
      borderLeft={{ base: "none", lg: "1px solid" }}
      borderColor="#2d3748"
    >
      <HStack
        w="full"
        p={{ base: 3, md: 4 }}
        justify="space-between"
        borderBottom="1px solid"
        borderColor="#2d3748"
        flexWrap={{ base: "wrap", md: "nowrap" }}
        gap={{ base: 2, md: 0 }}
      >
        <Heading
          size={{ base: "sm", md: "md" }}
          color="gray.100"
          mr={{ base: 0, md: 2 }}
        >
          docker-compose.yml
        </Heading>
        <HStack spacing={{ base: 1, md: 2 }} flexShrink={0}>
          <IconButton
            aria-label={t("importYaml")}
            icon={<FileUp size={18} />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={handleImport}
          />
          <IconButton
            aria-label={t("copyYaml")}
            icon={<Copy size={18} />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={handleCopy}
          />
          <IconButton
            aria-label={t("downloadYaml")}
            icon={<Download size={18} />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={handleDownload}
          />
        </HStack>
      </HStack>

      <Box flex={1} w="full">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={yamlContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            folding: true,
            renderLineHighlight: "none",
          }}
        />
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".yml,.yaml"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </VStack>
  );
}
