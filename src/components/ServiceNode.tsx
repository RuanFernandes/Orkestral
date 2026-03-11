"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Text, HStack, VStack, IconButton, Badge } from "@chakra-ui/react";
import {
  Edit,
  Trash2,
  Copy,
  Network,
  HardDrive,
  Key,
  Link2,
} from "lucide-react";
import { ComposeService } from "@/types/compose";
import { useComposeStore } from "@/store/composeStore";
import { useTranslations } from "next-intl";

export const ServiceNode = memo(({ id, data }: NodeProps<ComposeService>) => {
  const t = useTranslations();
  const { selectService, deleteService, duplicateService } = useComposeStore();

  const handleEdit = () => {
    selectService(id);
  };

  const handleDelete = () => {
    if (confirm(t("deleteServiceConfirm", { name: data.name }))) {
      deleteService(id);
    }
  };

  const handleDuplicate = () => {
    duplicateService(id);
  };

  return (
    <Box
      bg="#1f2937"
      border="2px solid"
      borderColor="#2d3748"
      borderRadius="md"
      p={{ base: 3, md: 4 }}
      minW={{ base: "240px", md: "280px" }}
      maxW={{ base: "300px", md: "320px" }}
      _hover={{ borderColor: "blue.400" }}
      transition="all 0.2s"
    >
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={true}
        style={{ background: "#3b82f6" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={true}
        style={{ background: "#3b82f6" }}
      />

      <VStack align="stretch" spacing={{ base: 2, md: 3 }}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              color="gray.100"
              noOfLines={1}
            >
              {data.name}
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.400"
              noOfLines={1}
            >
              {data.image}
            </Text>
          </VStack>

          <HStack spacing={{ base: 0, md: 1 }}>
            <IconButton
              aria-label={t("editServiceLabel")}
              icon={<Edit size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="blue"
              onClick={handleEdit}
            />
            <IconButton
              aria-label={t("duplicateService")}
              icon={<Copy size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
              onClick={handleDuplicate}
            />
            <IconButton
              aria-label={t("deleteServiceLabel")}
              icon={<Trash2 size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
            />
          </HStack>
        </HStack>

        {data.ports.length > 0 && (
          <HStack spacing={2} flexWrap="wrap">
            {data.ports.slice(0, 3).map((port, idx) => (
              <Badge
                key={idx}
                colorScheme="blue"
                fontSize={{ base: "2xs", md: "xs" }}
              >
                {port}
              </Badge>
            ))}
            {data.ports.length > 3 && (
              <Badge colorScheme="gray" fontSize={{ base: "2xs", md: "xs" }}>
                +{data.ports.length - 3}
              </Badge>
            )}
          </HStack>
        )}

        <VStack align="stretch" spacing={1}>
          {data.networks.length > 0 && (
            <HStack fontSize={{ base: "2xs", md: "xs" }} color="purple.300">
              <Network size={12} />
              <Text>
                {data.networks.length} {t("networkCount")}
              </Text>
            </HStack>
          )}

          {data.volumes.length > 0 && (
            <HStack fontSize={{ base: "2xs", md: "xs" }} color="orange.300">
              <HardDrive size={12} />
              <Text>
                {data.volumes.length} {t("volumeCount")}
              </Text>
            </HStack>
          )}

          {Object.keys(data.environment).length > 0 && (
            <HStack fontSize={{ base: "2xs", md: "xs" }} color="green.300">
              <Key size={12} />
              <Text>
                {Object.keys(data.environment).length} {t("envVarCount")}
              </Text>
            </HStack>
          )}

          {data.dependsOn.length > 0 && (
            <HStack fontSize={{ base: "2xs", md: "xs" }} color="blue.300">
              <Link2 size={12} />
              <Text>
                {data.dependsOn.length} {t("dependencyCount")}
              </Text>
            </HStack>
          )}
        </VStack>
      </VStack>

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        style={{ background: "#3b82f6" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        isConnectable={true}
        style={{ background: "#3b82f6" }}
      />
    </Box>
  );
});

ServiceNode.displayName = "ServiceNode";
