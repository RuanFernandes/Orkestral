"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { VStack, HStack, IconButton, Textarea, Text } from "@chakra-ui/react";
import { MessageSquare, Trash2, Edit2 } from "lucide-react";
import { CommentNode as CommentNodeType } from "@/types/compose";
import { useComposeStore } from "@/store/composeStore";
import { useTranslations } from "next-intl";

export const CommentNodeComponent = memo(
  ({ id, data }: NodeProps<CommentNodeType>) => {
    const t = useTranslations();
    const { updateComment, deleteComment } = useComposeStore();
    const [isEditing, setIsEditing] = useState(false);
    const [commentText, setCommentText] = useState(data.text);

    const handleSave = () => {
      updateComment(id, { text: commentText });
      setIsEditing(false);
    };

    const handleDelete = () => {
      if (confirm(t("deleteComment"))) {
        deleteComment(id);
      }
    };

    return (
      <VStack
        bg="#fef3c7"
        border="2px solid"
        borderColor="#fbbf24"
        borderRadius="lg"
        p={{ base: 3, md: 4 }}
        spacing={2}
        minW={{ base: "200px", md: "250px" }}
        maxW={{ base: "300px", md: "350px" }}
        position="relative"
        boxShadow="md"
      >
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          isConnectable={true}
          style={{ background: "#fbbf24", opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          isConnectable={true}
          style={{ background: "#fbbf24", opacity: 0 }}
        />

        <HStack w="full" justify="space-between">
          <HStack spacing={2}>
            <MessageSquare size={18} color="#d97706" />
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="bold"
              color="#78350f"
            >
              {t("note")}
            </Text>
          </HStack>

          <HStack spacing={{ base: 0, md: 1 }}>
            <IconButton
              aria-label={t("edit")}
              icon={<Edit2 size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="yellow"
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

        {isEditing ? (
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onBlur={handleSave}
            placeholder={t("typeNoteHere")}
            size="sm"
            rows={4}
            bg="white"
            border="1px solid #fbbf24"
            color="#78350f"
            autoFocus
            fontSize={{ base: "xs", md: "sm" }}
            _focus={{
              borderColor: "#f59e0b",
              boxShadow: "0 0 0 1px #f59e0b",
            }}
          />
        ) : (
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color="#78350f"
            whiteSpace="pre-wrap"
            w="full"
            minH={{ base: "50px", md: "60px" }}
            cursor="pointer"
            onClick={() => setIsEditing(true)}
          >
            {data.text || t("clickToEdit")}
          </Text>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          isConnectable={true}
          style={{ background: "#fbbf24", opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          isConnectable={true}
          style={{ background: "#fbbf24", opacity: 0 }}
        />
      </VStack>
    );
  },
);

CommentNodeComponent.displayName = "CommentNode";
