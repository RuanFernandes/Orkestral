"use client";

import { Box, Grid, GridItem } from "@chakra-ui/react";
import { ReactFlowProvider } from "reactflow";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Canvas } from "@/components/Canvas";
import { YamlViewer } from "@/components/YamlViewer";
import { ServiceEditor } from "@/components/ServiceEditor";
import { useComposeStore } from "@/store/composeStore";
import { loadWorkflowFromLocalStorage } from "@/lib/workflowUtils";

export default function Home() {
  const { yamlPanelOpen, loadWorkflow, autoSaveEnabled } = useComposeStore();

  // carrega automaticamente o workflow salvo se o auto-save tá ligado
  useEffect(() => {
    const savedWorkflow = loadWorkflowFromLocalStorage();
    if (savedWorkflow && autoSaveEnabled) {
      loadWorkflow(savedWorkflow);
    }
  }, [loadWorkflow, autoSaveEnabled]);

  return (
    <Box h="100vh" display="flex" flexDirection="column" bg="#0f172a">
      <Header />

      <Box flex={1} overflow="hidden">
        <Grid
          h="full"
          templateColumns={
            yamlPanelOpen
              ? {
                  base: "1fr",
                  md: "1fr",
                  lg: "1fr 500px",
                  xl: "1fr 600px",
                }
              : "1fr"
          }
          transition="all 0.3s"
        >
          <GridItem
            h="full"
            overflow="hidden"
            display={{ base: yamlPanelOpen ? "none" : "block", lg: "block" }}
          >
            <ReactFlowProvider>
              <Canvas />
            </ReactFlowProvider>
          </GridItem>

          {yamlPanelOpen && (
            <GridItem h="full" overflow="hidden">
              <YamlViewer />
            </GridItem>
          )}
        </Grid>
      </Box>

      <ServiceEditor />
    </Box>
  );
}
