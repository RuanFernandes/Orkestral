"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Box,
  VStack,
  Text,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Database, Server, Box as BoxIcon } from "lucide-react";
import { serviceTemplates } from "@/lib/templates";
import { useComposeStore } from "@/store/composeStore";
import { ComposeService } from "@/types/compose";
import { useTranslations } from "next-intl";

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  Box: BoxIcon,
  Database: Database,
  Server: Server,
};

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
  const t = useTranslations();
  const { addService, services } = useComposeStore();
  const toast = useToast();
  const iconSize = useBreakpointValue({ base: 24, md: 32 }) || 32;

  const handleSelectTemplate = (templateId: string) => {
    const template = serviceTemplates.find((t) => t.id === templateId);
    if (!template) return;

    // gera um nome único pro serviço
    let serviceName = template.config.name || template.id;
    let counter = 1;
    while (services.some((s) => s.name === serviceName)) {
      serviceName = `${template.config.name || template.id}_${counter}`;
      counter++;
    }

    const timestamp = Date.now();
    // eslint-disable-next-line react-compiler/react-compiler
    const newService: ComposeService = {
      id: `service-${timestamp}`,
      name: serviceName,
      image: template.config.image || "",
      ports: template.config.ports || [],
      volumes: template.config.volumes || [],
      environment: template.config.environment || {},
      dependsOn: template.config.dependsOn || [],
      networks: template.config.networks || [],
      restart: template.config.restart,
      command: template.config.command,
      containerName: template.config.containerName,
    };

    addService(newService);

    toast({
      title: `${t("serviceAdded")}: ${serviceName}`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "xl", lg: "2xl" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        bg="#1f2937"
        maxW={{ base: "100%", md: "90%", lg: "800px" }}
        mx={{ base: 0, md: 4 }}
      >
        <ModalHeader
          color="gray.100"
          borderBottom="1px solid"
          borderColor="#2d3748"
          fontSize={{ base: "lg", md: "xl" }}
          py={{ base: 3, md: 4 }}
        >
          {t("addServiceFromTemplate")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={{ base: 4, md: 6 }} px={{ base: 3, md: 6 }}>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 3, md: 4 }}
          >
            {serviceTemplates.map((template) => {
              const Icon = iconMap[template.icon] || BoxIcon;
              return (
                <Box
                  key={template.id}
                  p={{ base: 4, md: 5 }}
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{
                    borderColor: "blue.400",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <VStack spacing={{ base: 2, md: 3 }} align="center">
                    <Box p={{ base: 2, md: 3 }} bg="#1f2937" borderRadius="md">
                      <Icon size={iconSize} color="#3b82f6" />
                    </Box>
                    <Text
                      fontWeight="bold"
                      color="gray.100"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {template.name}
                    </Text>
                    <Text
                      fontSize={{ base: "2xs", md: "xs" }}
                      color="gray.400"
                      textAlign="center"
                      noOfLines={2}
                    >
                      {template.description}
                    </Text>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
