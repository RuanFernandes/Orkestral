"use client";

import {
  HStack,
  Heading,
  Button,
  IconButton,
  Spacer,
  useDisclosure,
  useToast,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  Box,
} from "@chakra-ui/react";
import {
  Plus,
  Trash2,
  Code,
  Network,
  MessageSquare,
  Save,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import { useComposeStore } from "@/store/composeStore";
import { NetworkModal } from "./NetworkModal";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  downloadWorkflow,
  uploadWorkflow,
  uploadComposeWorkflow,
} from "@/lib/workflowUtils";
import { CommentNode } from "@/types/compose";
import { TemplateModal } from "./TemplateModal";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations();
  const {
    services,
    networks,
    comments,
    nodePositions,
    edgeConnections,
    clearAll,
    toggleYamlPanel,
    yamlPanelOpen,
    addComment,
    loadWorkflow,
  } = useComposeStore();

  const {
    isOpen: isServiceModalOpen,
    onOpen: onServiceModalOpen,
    onClose: onServiceModalClose,
  } = useDisclosure();

  const {
    isOpen: isNetworkModalOpen,
    onOpen: onNetworkModalOpen,
    onClose: onNetworkModalClose,
  } = useDisclosure();

  const toast = useToast();

  const handleClear = () => {
    if (confirm(t("clearAllConfirm"))) {
      clearAll();
    }
  };

  const handleAddComment = () => {
    const comment: CommentNode = {
      id: `comment-${Date.now()}`,
      text: t("newNote"),
    };
    addComment(comment);
  };

  const handleSaveWorkflow = () => {
    const workflow = {
      services,
      networks,
      comments,
      nodePositions,
      edgeConnections,
      version: "1.0",
    };

    downloadWorkflow(workflow);

    toast({
      title: t("workflowSaved"),
      description: t("workflowDownloaded"),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLoadWorkflow = async () => {
    try {
      const workflow = await uploadWorkflow();
      loadWorkflow(workflow);

      toast({
        title: t("workflowLoaded"),
        description: t("canvasRestored"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t("errorLoadingWorkflow"),
        description: t("errorParsingWorkflow"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const showFullButtons = useBreakpointValue({ base: false, xl: true });

  return (
    <>
      <HStack
        w="full"
        h={{ base: "56px", md: "64px" }}
        px={{ base: 3, md: 6 }}
        bg="#1f2937"
        borderBottom="1px solid"
        borderColor="#2d3748"
        spacing={{ base: 2, md: 3, lg: 4 }}
        alignItems="center"
        flexWrap="nowrap"
      >
        <Box display={{ base: "none", md: "block" }}>
          <Image
            src="/logo.png"
            alt="Orkestral Logo"
            h={{ base: "40px", md: "56px" }}
            w="auto"
            objectFit="contain"
          />
        </Box>
        <Heading
          size={{ base: "sm", md: "lg" }}
          color="gray.100"
          fontWeight="bold"
          whiteSpace="nowrap"
        >
          {t("appName")}
        </Heading>
        <Heading
          display={{ base: "none", lg: "block" }}
          size="xs"
          color="gray.400"
          fontWeight="normal"
          whiteSpace="nowrap"
        >
          {t("appDescription")}
        </Heading>

        <Spacer />

        <Box display={{ base: "none", md: "block" }}>
          <LanguageSwitcher />
        </Box>

        {!isMobile && !isTablet && (
          <>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="blue"
              onClick={onServiceModalOpen}
              size="sm"
            >
              {showFullButtons ? t("addService") : ""}
            </Button>

            <Button
              leftIcon={<Network size={18} />}
              colorScheme="purple"
              onClick={onNetworkModalOpen}
              size="sm"
              variant="outline"
              display={{ base: "none", lg: "flex" }}
            >
              {showFullButtons ? t("addNetwork") : ""}
            </Button>

            <Button
              leftIcon={<MessageSquare size={18} />}
              colorScheme="yellow"
              onClick={handleAddComment}
              size="sm"
              variant="outline"
              display={{ base: "none", xl: "flex" }}
            >
              {t("addComment")}
            </Button>

            <Button
              leftIcon={<Save size={18} />}
              colorScheme="green"
              onClick={handleSaveWorkflow}
              size="sm"
              variant="outline"
              display={{ base: "none", xl: "flex" }}
            >
              {t("save")}
            </Button>

            <Button
              leftIcon={<FolderOpen size={18} />}
              colorScheme="cyan"
              onClick={handleLoadWorkflow}
              size="sm"
              variant="outline"
              color="gray.100"
              borderColor="cyan.400"
              display={{ base: "none", xl: "flex" }}
            >
              {t("load")}
            </Button>
          </>
        )}

        <IconButton
          aria-label={t("toggleYaml")}
          icon={<Code size={18} />}
          variant={yamlPanelOpen ? "solid" : "ghost"}
          colorScheme="blue"
          color={yamlPanelOpen ? undefined : "gray.100"}
          onClick={toggleYamlPanel}
          size="sm"
        />

        {(isMobile || isTablet) && (
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<MoreVertical size={18} />}
              variant="ghost"
              colorScheme="gray"
              color="gray.100"
              size="sm"
              aria-label="Menu"
            />
            <MenuList bg="#1f2937" borderColor="#2d3748">
              <MenuItem
                icon={<Plus size={18} />}
                onClick={onServiceModalOpen}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="gray.100"
              >
                {t("addService")}
              </MenuItem>
              <MenuItem
                icon={<Network size={18} />}
                onClick={onNetworkModalOpen}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="gray.100"
              >
                {t("addNetwork")}
              </MenuItem>
              <MenuItem
                icon={<MessageSquare size={18} />}
                onClick={handleAddComment}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="gray.100"
              >
                {t("addComment")}
              </MenuItem>
              <MenuItem
                icon={<Save size={18} />}
                onClick={handleSaveWorkflow}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="gray.100"
              >
                {t("save")}
              </MenuItem>
              <MenuItem
                icon={<FolderOpen size={18} />}
                onClick={handleLoadWorkflow}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="gray.100"
              >
                {t("load")}
              </MenuItem>
              <MenuItem
                icon={<Trash2 size={18} />}
                onClick={handleClear}
                bg="#1f2937"
                _hover={{ bg: "#2d3748" }}
                color="red.400"
              >
                {t("clearAll")}
              </MenuItem>
            </MenuList>
          </Menu>
        )}

        {!isMobile && !isTablet && (
          <IconButton
            aria-label={t("clearAll")}
            icon={<Trash2 size={18} />}
            variant="ghost"
            colorScheme="red"
            onClick={handleClear}
            size="sm"
          />
        )}
      </HStack>

      <TemplateModal
        isOpen={isServiceModalOpen}
        onClose={onServiceModalClose}
      />
      <NetworkModal isOpen={isNetworkModalOpen} onClose={onNetworkModalClose} />
    </>
  );
}
