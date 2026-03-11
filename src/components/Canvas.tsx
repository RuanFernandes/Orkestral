"use client";

import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  Edge,
  Node,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { Box } from "@chakra-ui/react";
import { ServiceNode } from "./ServiceNode";
import { NetworkNodeComponent } from "./NetworkNode";
import { CommentNodeComponent } from "./CommentNode";
import { NetworkEdge } from "./NetworkEdge";
import { DependencyEdge } from "./DependencyEdge";
import { OrkestralWatermark } from "./OrkestralWatermark";
import { useComposeStore } from "@/store/composeStore";

// define os tipos de node fora do componente pra evitar warning do React Flow
const nodeTypes = {
  service: ServiceNode,
  network: NetworkNodeComponent,
  comment: CommentNodeComponent,
};

const edgeTypes = {
  network: NetworkEdge,
  dependency: DependencyEdge,
};

export function Canvas() {
  const {
    services,
    networks,
    comments,
    edgeConnections,
    nodePositions,
    updateService,
    updateNodePosition,
    addEdgeConnection,
    removeEdgeConnection,
    undo,
    redo,
  } = useComposeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // converte serviços, redes e comentários em nodes
  useEffect(() => {
    const newNodes: Node[] = [];

    // adiciona os nodes de serviço
    services.forEach((service, index) => {
      const position = nodePositions[service.id] || {
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200,
      };

      newNodes.push({
        id: service.id,
        type: "service",
        position,
        data: service,
      });
    });

    // adiciona os nodes de rede
    networks.forEach((network, index) => {
      const position = nodePositions[network.id] || {
        x: 100 + (index % 3) * 300,
        y: 400 + Math.floor(index / 3) * 200,
      };

      newNodes.push({
        id: network.id,
        type: "network",
        position,
        data: network,
      });
    });

    // adiciona os nodes de comentário
    comments.forEach((comment, index) => {
      const position = nodePositions[comment.id] || {
        x: 500 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200,
      };

      newNodes.push({
        id: comment.id,
        type: "comment",
        position,
        data: comment,
      });
    });

    setNodes(newNodes);
  }, [services, networks, comments, nodePositions, setNodes]);

  // cria as arestas a partir das conexões salvas
  useEffect(() => {
    const newEdges: Edge[] = edgeConnections.map((edgeConn) => {
      let label = "";

      if (edgeConn.type === "dependency") {
        const sourceService = services.find((s) => s.id === edgeConn.source);
        const targetService = services.find((s) => s.id === edgeConn.target);
        if (sourceService && targetService) {
          label = `${sourceService.name} depends on ${targetService.name}`;
        } else {
          label = "depends_on";
        }
      } else if (edgeConn.type === "network") {
        label = "network";
      }

      const edge: Edge = {
        id: edgeConn.id,
        source: edgeConn.source,
        target: edgeConn.target,
        sourceHandle: edgeConn.sourceHandle,
        targetHandle: edgeConn.targetHandle,
        type: edgeConn.type,
        animated: edgeConn.type === "dependency",
        label,
        labelStyle: {
          fill: edgeConn.type === "dependency" ? "#3b82f6" : "#a78bfa",
          fontSize: 10,
        },
      };
      return edge;
    });

    setEdges(newEdges);
  }, [edgeConnections, services, setEdges]);

  // lida com os atalhos de teclado pra desfazer/refazer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // checa se tá focado em algum input
      const target = e.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // não ativa desfazer/refazer se tiver digitando
      if (isInputElement) return;

      // Ctrl+Z ou Cmd+Z pra desfazer
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y ou Cmd+Shift+Z pra refazer
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // atualiza a posição dos nodes quando arrasta
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position && change.id) {
          updateNodePosition(change.id, change.position);
        }
      });
      onNodesChange(changes);
    },
    [onNodesChange, updateNodePosition],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // preserva os IDs dos handles exatos
      const sourceHandle = connection.sourceHandle || "top";
      const targetHandle = connection.targetHandle || "top";

      // serviço pra serviço = adiciona dependência
      if (sourceNode.type === "service" && targetNode.type === "service") {
        const targetService = services.find((s) => s.id === connection.target);
        const sourceService = services.find((s) => s.id === connection.source);

        if (targetService && sourceService) {
          // checa se já tem essa dependência
          if (targetService.dependsOn.includes(sourceService.name)) {
            return; // evita duplicar
          }

          const updatedDependsOn = [...targetService.dependsOn];
          updatedDependsOn.push(sourceService.name);
          updateService(targetService.id, { dependsOn: updatedDependsOn });

          // salva a conexão com os handles exatos
          const edgeId = `dep-${connection.source}-${connection.target}`;
          addEdgeConnection({
            id: edgeId,
            source: connection.source,
            target: connection.target,
            sourceHandle,
            targetHandle,
            type: "dependency",
          });
        }
      }

      // serviço e rede = adiciona na rede
      if (
        (sourceNode.type === "service" && targetNode.type === "network") ||
        (sourceNode.type === "network" && targetNode.type === "service")
      ) {
        const serviceNode =
          sourceNode.type === "service" ? sourceNode : targetNode;
        const networkNode =
          sourceNode.type === "network" ? sourceNode : targetNode;

        const service = services.find((s) => s.id === serviceNode.id);
        const network = networks.find((n) => n.id === networkNode.id);

        if (service && network) {
          // verifica se já tá conectado nessa rede
          if (service.networks.includes(network.name)) {
            return; // evita duplicar
          }

          // atualiza as redes do serviço
          const updatedNetworks = [...service.networks];
          updatedNetworks.push(network.name);
          updateService(service.id, { networks: updatedNetworks });

          // salva a conexão sem normalizar os handles
          const edgeId = `net-${service.id}-${network.id}`;
          addEdgeConnection({
            id: edgeId,
            source: connection.source!,
            target: connection.target!,
            sourceHandle,
            targetHandle,
            type: "network",
          });
        }
      }
    },
    [services, networks, nodes, updateService, addEdgeConnection],
  );

  const onEdgeDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        // pega info da aresta ANTES de remover
        const edgeConn = edgeConnections.find((e) => e.id === edge.id);
        if (!edgeConn) {
          console.warn("Edge connection not found:", edge.id);
          return;
        }

        // lida com remoção de dependência
        if (edgeConn.type === "dependency") {
          const sourceService = services.find((s) => s.id === edgeConn.source);
          const targetService = services.find((s) => s.id === edgeConn.target);

          if (sourceService && targetService) {
            const updatedDependsOn = targetService.dependsOn.filter(
              (name) => name !== sourceService.name,
            );
            updateService(targetService.id, { dependsOn: updatedDependsOn });
          }
        }

        // lida com remoção de conexão de rede
        if (edgeConn.type === "network") {
          const serviceNode = nodes.find(
            (n) =>
              (n.id === edgeConn.source || n.id === edgeConn.target) &&
              n.type === "service",
          );
          const networkNode = nodes.find(
            (n) =>
              (n.id === edgeConn.source || n.id === edgeConn.target) &&
              n.type === "network",
          );

          if (serviceNode && networkNode) {
            const service = services.find((s) => s.id === serviceNode.id);
            const network = networks.find((n) => n.id === networkNode.id);

            if (service && network) {
              const updatedNetworks = service.networks.filter(
                (name) => name !== network.name,
              );
              updateService(service.id, { networks: updatedNetworks });
            }
          }
        }

        // remove da store só DEPOIS de atualizar os serviços
        removeEdgeConnection(edge.id);
      });
    },
    [
      services,
      networks,
      nodes,
      edgeConnections,
      updateService,
      removeEdgeConnection,
    ],
  );

  // handler customizado que intercepta quando deleta arestas
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // checa mudanças do tipo remove (quando deleta)
      const removeChanges = changes.filter((c) => c.type === "remove");

      if (removeChanges.length > 0) {
        const edgesToDelete = edges.filter((edge) =>
          removeChanges.some((change) => change.id === edge.id),
        );
        onEdgeDelete(edgesToDelete);
      }

      // checa tipo reset (primeira vez que deleta quando seleciona)
      const resetChanges = changes.filter((c) => c.type === "reset");

      if (resetChanges.length > 0) {
        // pega as arestas selecionadas que vão ser deletadas
        const selectedEdges = edges.filter((edge) => edge.selected === true);
        if (selectedEdges.length > 0) {
          onEdgeDelete(selectedEdges);
        }
      }

      // aplica todas as mudanças no React Flow
      onEdgesChange(changes);
    },
    [edges, onEdgesChange, onEdgeDelete],
  );

  return (
    <Box h="full" w="full" bg="#111827" position="relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background
          color="#2d3748"
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
        />
        <Controls
          style={{ background: "#1f2937", border: "1px solid #2d3748" }}
        />
      </ReactFlow>
      <OrkestralWatermark />
    </Box>
  );
}
