"use client";

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  IconButton,
  Select,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { Plus, X } from "lucide-react";
import { useComposeStore } from "@/store/composeStore";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function ServiceEditor() {
  const t = useTranslations();
  const { services, selectedServiceId, selectService, updateService } =
    useComposeStore();

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const isOpen = !!selectedService;

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    containerName: "",
    restart: "unless-stopped",
    command: "",
    ports: [""],
    volumes: [""],
    environment: [{ key: "", value: "" }],
    networks: [""],
  });

  useEffect(() => {
    if (selectedService) {
      setFormData({
        name: selectedService.name,
        image: selectedService.image,
        containerName: selectedService.containerName || "",
        restart: selectedService.restart || "unless-stopped",
        command: selectedService.command || "",
        ports: selectedService.ports.length > 0 ? selectedService.ports : [""],
        volumes:
          selectedService.volumes.length > 0 ? selectedService.volumes : [""],
        environment:
          Object.keys(selectedService.environment).length > 0
            ? Object.entries(selectedService.environment).map(
                ([key, value]) => ({ key, value }),
              )
            : [{ key: "", value: "" }],
        networks:
          selectedService.networks.length > 0 ? selectedService.networks : [""],
      });
    }
  }, [selectedService]);

  const handleClose = () => {
    selectService(null);
  };

  const handleSave = () => {
    if (!selectedServiceId) return;

    const environment: Record<string, string> = {};
    formData.environment.forEach(({ key, value }) => {
      if (key) environment[key] = value;
    });

    updateService(selectedServiceId, {
      name: formData.name,
      image: formData.image,
      containerName: formData.containerName || undefined,
      restart: formData.restart,
      command: formData.command || undefined,
      ports: formData.ports.filter((p) => p),
      volumes: formData.volumes.filter((v) => v),
      environment,
      networks: formData.networks.filter((n) => n),
    });

    handleClose();
  };

  const addPort = () =>
    setFormData((prev) => ({ ...prev, ports: [...prev.ports, ""] }));
  const removePort = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      ports: prev.ports.filter((_, i) => i !== index),
    }));
  const updatePort = (index: number, value: string) =>
    setFormData((prev) => ({
      ...prev,
      ports: prev.ports.map((p, i) => (i === index ? value : p)),
    }));

  const addVolume = () =>
    setFormData((prev) => ({ ...prev, volumes: [...prev.volumes, ""] }));
  const removeVolume = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      volumes: prev.volumes.filter((_, i) => i !== index),
    }));
  const updateVolume = (index: number, value: string) =>
    setFormData((prev) => ({
      ...prev,
      volumes: prev.volumes.map((v, i) => (i === index ? value : v)),
    }));

  const addEnvVar = () =>
    setFormData((prev) => ({
      ...prev,
      environment: [...prev.environment, { key: "", value: "" }],
    }));
  const removeEnvVar = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      environment: prev.environment.filter((_, i) => i !== index),
    }));
  const updateEnvVar = (index: number, field: "key" | "value", value: string) =>
    setFormData((prev) => ({
      ...prev,
      environment: prev.environment.map((env, i) =>
        i === index ? { ...env, [field]: value } : env,
      ),
    }));

  const addNetwork = () =>
    setFormData((prev) => ({ ...prev, networks: [...prev.networks, ""] }));
  const removeNetwork = (index: number) =>
    setFormData((prev) => ({
      ...prev,
      networks: prev.networks.filter((_, i) => i !== index),
    }));
  const updateNetwork = (index: number, value: string) =>
    setFormData((prev) => ({
      ...prev,
      networks: prev.networks.map((n, i) => (i === index ? value : n)),
    }));

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={handleClose}
      size={{ base: "full", md: "md" }}
    >
      <DrawerOverlay />
      <DrawerContent bg="#1f2937" maxW={{ base: "100%", md: "500px" }}>
        <DrawerCloseButton />
        <DrawerHeader
          color="gray.100"
          borderBottom="1px solid"
          borderColor="#2d3748"
        >
          {t("editService")}
        </DrawerHeader>

        <DrawerBody py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {/* General */}
            <VStack spacing={4} align="stretch">
              <Heading size="sm" color="gray.100">
                {t("general")}
              </Heading>
              <FormControl>
                <FormLabel fontSize={{ base: "xs", md: "sm" }} color="gray.400">
                  {t("serviceName")}
                </FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="app"
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  _hover={{ borderColor: "#3b82f6" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize={{ base: "xs", md: "sm" }} color="gray.400">
                  {t("containerName")}
                </FormLabel>
                <Input
                  value={formData.containerName}
                  onChange={(e) =>
                    setFormData({ ...formData, containerName: e.target.value })
                  }
                  placeholder="my-app-container"
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  _hover={{ borderColor: "#3b82f6" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize={{ base: "xs", md: "sm" }} color="gray.400">
                  {t("image")}
                </FormLabel>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="node:20-alpine"
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  _hover={{ borderColor: "#3b82f6" }}
                />
              </FormControl>
            </VStack>

            <Divider borderColor="#2d3748" />

            {/* Networking */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="sm" color="gray.100">
                  {t("ports")}
                </Heading>
                <IconButton
                  aria-label={t("addPort")}
                  icon={<Plus size={16} />}
                  size="xs"
                  onClick={addPort}
                  colorScheme="blue"
                />
              </HStack>
              {formData.ports.map((port, index) => (
                <HStack key={index}>
                  <Input
                    value={port}
                    onChange={(e) => updatePort(index, e.target.value)}
                    placeholder="3000:3000"
                    bg="#111827"
                    border="1px solid"
                    borderColor="#2d3748"
                    _hover={{ borderColor: "#3b82f6" }}
                  />
                  <IconButton
                    aria-label={t("removePort")}
                    icon={<X size={16} />}
                    size="sm"
                    onClick={() => removePort(index)}
                    variant="ghost"
                    colorScheme="red"
                  />
                </HStack>
              ))}
            </VStack>

            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="sm" color="gray.100">
                  {t("networks")}
                </Heading>
                <IconButton
                  aria-label={t("addNetworkLabel")}
                  icon={<Plus size={16} />}
                  size="xs"
                  onClick={addNetwork}
                  colorScheme="blue"
                />
              </HStack>
              {formData.networks.map((network, index) => (
                <HStack key={index}>
                  <Input
                    value={network}
                    onChange={(e) => updateNetwork(index, e.target.value)}
                    placeholder="app-network"
                    bg="#111827"
                    border="1px solid"
                    borderColor="#2d3748"
                    _hover={{ borderColor: "#3b82f6" }}
                  />
                  <IconButton
                    aria-label={t("removeNetwork")}
                    icon={<X size={16} />}
                    size="sm"
                    onClick={() => removeNetwork(index)}
                    variant="ghost"
                    colorScheme="red"
                  />
                </HStack>
              ))}
            </VStack>

            <Divider borderColor="#2d3748" />

            {/* Volumes */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="sm" color="gray.100">
                  {t("volumes")}
                </Heading>
                <IconButton
                  aria-label={t("addVolume")}
                  icon={<Plus size={16} />}
                  size="xs"
                  onClick={addVolume}
                  colorScheme="blue"
                />
              </HStack>
              {formData.volumes.map((volume, index) => (
                <HStack key={index}>
                  <Input
                    value={volume}
                    onChange={(e) => updateVolume(index, e.target.value)}
                    placeholder="./data:/app/data"
                    bg="#111827"
                    border="1px solid"
                    borderColor="#2d3748"
                    _hover={{ borderColor: "#3b82f6" }}
                  />
                  <IconButton
                    aria-label={t("removeVolume")}
                    icon={<X size={16} />}
                    size="sm"
                    onClick={() => removeVolume(index)}
                    variant="ghost"
                    colorScheme="red"
                  />
                </HStack>
              ))}
            </VStack>

            <Divider borderColor="#2d3748" />

            {/* Environment */}
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="sm" color="gray.100">
                  {t("environment")}
                </Heading>
                <IconButton
                  aria-label={t("addEnvironmentVariable")}
                  icon={<Plus size={16} />}
                  size="xs"
                  onClick={addEnvVar}
                  colorScheme="blue"
                />
              </HStack>
              {formData.environment.map((env, index) => (
                <HStack key={index}>
                  <Input
                    value={env.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    placeholder="NODE_ENV"
                    bg="#111827"
                    border="1px solid"
                    borderColor="#2d3748"
                    _hover={{ borderColor: "#3b82f6" }}
                  />
                  <Input
                    value={env.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    placeholder="production"
                    bg="#111827"
                    border="1px solid"
                    borderColor="#2d3748"
                    _hover={{ borderColor: "#3b82f6" }}
                  />
                  <IconButton
                    aria-label={t("removeEnvironmentVariable")}
                    icon={<X size={16} />}
                    size="sm"
                    onClick={() => removeEnvVar(index)}
                    variant="ghost"
                    colorScheme="red"
                  />
                </HStack>
              ))}
            </VStack>

            <Divider borderColor="#2d3748" />

            {/* Advanced */}
            <VStack spacing={4} align="stretch">
              <Heading size="sm" color="gray.100">
                {t("advanced")}
              </Heading>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  {t("restart")}
                </FormLabel>
                <Select
                  value={formData.restart}
                  onChange={(e) =>
                    setFormData({ ...formData, restart: e.target.value })
                  }
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  _hover={{ borderColor: "#3b82f6" }}
                >
                  <option value="no">no</option>
                  <option value="always">always</option>
                  <option value="on-failure">on-failure</option>
                  <option value="unless-stopped">unless-stopped</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="gray.400">
                  {t("command")}
                </FormLabel>
                <Input
                  value={formData.command}
                  onChange={(e) =>
                    setFormData({ ...formData, command: e.target.value })
                  }
                  placeholder="npm start"
                  bg="#111827"
                  border="1px solid"
                  borderColor="#2d3748"
                  _hover={{ borderColor: "#3b82f6" }}
                />
              </FormControl>
            </VStack>

            {/* Save Button */}
            <Button colorScheme="blue" onClick={handleSave} w="full" size="lg">
              {t("saveChanges")}
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
