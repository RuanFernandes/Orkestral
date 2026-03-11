"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { VStack, HStack, Text, IconButton, Input } from "@chakra-ui/react";
import { Edit2, Trash2, Network } from "lucide-react";
import { NetworkNode as NetworkNodeType } from "@/types/compose";
import { useComposeStore } from "@/store/composeStore";
import { useTranslations } from "next-intl";

export const NetworkNodeComponent = memo(
  ({ id, data }: NodeProps<NetworkNodeType>) => {
    const t = useTranslations();
    const { updateNetwork, deleteNetwork } = useComposeStore();
    const [isEditing, setIsEditing] = useState(false);
    const [networkName, setNetworkName] = useState(data.name);

    const handleSave = () => {
      updateNetwork(id, { name: networkName });
      setIsEditing(false);
    };

    const handleDelete = () => {
      if (confirm(t("deleteNetworkSimple"))) {
        deleteNetwork(id);
      }
    };

    return (
      <VStack
        bg="#2d1f3d"
        border="2px solid"
        borderColor="#7c3aed"
        borderRadius="lg"
        p={{ base: 3, md: 4 }}
        spacing={2}
        minW={{ base: "180px", md: "200px" }}
        position="relative"
      >
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          isConnectable={true}
          style={{ background: "#7c3aed" }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          isConnectable={true}
          style={{ background: "#7c3aed" }}
        />

        <HStack w="full" justify="space-between">
          <HStack spacing={2}>
            <Network size={20} color="#a78bfa" />
            {isEditing ? (
              <Input
                value={networkName}
                onChange={(e) => setNetworkName(e.target.value)}
                onBlur={handleSave}
                onKeyPress={(e) => e.key === "Enter" && handleSave()}
                size="sm"
                autoFocus
                bg="#1f2937"
                border="1px solid #7c3aed"
                fontSize={{ base: "xs", md: "sm" }}
              />
            ) : (
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="bold"
                color="gray.100"
              >
                {data.name}
              </Text>
            )}
          </HStack>

          <HStack spacing={{ base: 0, md: 1 }}>
            <IconButton
              aria-label={t("edit")}
              icon={<Edit2 size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="purple"
              onClick={() => setIsEditing(true)}
            />
            <IconButton
              aria-label={t("delete")}
              icon={<Trash2 size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              onClick={handleDelete}
            />
          </HStack>
        </HStack>

        {data.driver && (
          <Text fontSize="xs" color="gray.400">
            {t("driver")}: {data.driver}
          </Text>
        )}

        {data.external && (
          <Text fontSize="xs" color="purple.300">
            {t("external")}
          </Text>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          isConnectable={true}
          style={{ background: "#7c3aed" }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          isConnectable={true}
          style={{ background: "#7c3aed" }}
        />
      </VStack>
    );
  },
);

NetworkNodeComponent.displayName = "NetworkNode";
