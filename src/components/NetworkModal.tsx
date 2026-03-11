"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useComposeStore } from "@/store/composeStore";
import { NetworkNode } from "@/types/compose";
import { useTranslations } from "next-intl";

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkModal({ isOpen, onClose }: NetworkModalProps) {
  const t = useTranslations();
  const { addNetwork } = useComposeStore();
  const [networkName, setNetworkName] = useState("");
  const [driver, setDriver] = useState("bridge");
  const [isExternal, setIsExternal] = useState(false);

  const handleAdd = () => {
    if (!networkName.trim()) return;

    const network: NetworkNode = {
      id: `network-${Date.now()}`,
      name: networkName.trim(),
      driver: driver || undefined,
      external: isExternal || undefined,
    };

    addNetwork(network);
    setNetworkName("");
    setDriver("bridge");
    setIsExternal(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "md" }}>
      <ModalOverlay />
      <ModalContent
        bg="#1f2937"
        borderColor="#2d3748"
        borderWidth="1px"
        mx={{ base: 0, sm: 4 }}
      >
        <ModalHeader color="gray.100">{t("addNetwork")}</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                {t("networkName")}
              </FormLabel>
              <Input
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                placeholder="my-network"
                bg="#111827"
                borderColor="#2d3748"
                color="gray.100"
                _hover={{ borderColor: "#3b82f6" }}
                _focus={{
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 1px #3b82f6",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                {t("networkDriver")}
              </FormLabel>
              <Input
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                placeholder="bridge"
                bg="#111827"
                borderColor="#2d3748"
                color="gray.100"
                _hover={{ borderColor: "#3b82f6" }}
                _focus={{
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 1px #3b82f6",
                }}
              />
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel color="gray.300" fontSize="sm" mb={0}>
                  {t("networkExternal")}
                </FormLabel>
                <Switch
                  isChecked={isExternal}
                  onChange={(e) => setIsExternal(e.target.checked)}
                  colorScheme="purple"
                />
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t("useExistingNetwork")}
              </Text>
            </FormControl>

            <HStack w="full" justify="flex-end" spacing={3} pt={4}>
              <Button variant="ghost" onClick={onClose} size="sm">
                {t("cancel")}
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleAdd}
                size="sm"
                isDisabled={!networkName.trim()}
              >
                {t("addNetwork")}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
