import { create } from "zustand";
import {
  ComposeService,
  NetworkNode,
  CommentNode,
  NodePosition,
  WorkflowState,
  EdgeConnection,
} from "@/types/compose";

interface ComposeStore {
  services: ComposeService[];
  networks: NetworkNode[];
  comments: CommentNode[];
  edgeConnections: EdgeConnection[];
  nodePositions: Record<string, NodePosition>;
  selectedServiceId: string | null;
  yamlPanelOpen: boolean;
  autoSaveEnabled: boolean;

  // estado pra desfazer/refazer
  past: WorkflowState[];
  future: WorkflowState[];

  // funções dos serviços
  addService: (service: ComposeService) => void;
  updateService: (id: string, updates: Partial<ComposeService>) => void;
  deleteService: (id: string) => void;
  duplicateService: (id: string) => void;
  selectService: (id: string | null) => void;
  clearServices: () => void;
  importServices: (
    services: ComposeService[],
    networks?: NetworkNode[],
  ) => void;

  // funções de rede
  addNetwork: (network: NetworkNode) => void;
  updateNetwork: (id: string, updates: Partial<NetworkNode>) => void;
  deleteNetwork: (id: string) => void;

  // funções de comentários
  addComment: (comment: CommentNode) => void;
  updateComment: (id: string, updates: Partial<CommentNode>) => void;
  deleteComment: (id: string) => void;

  // funções das conexões
  addEdgeConnection: (edge: EdgeConnection) => void;
  removeEdgeConnection: (edgeId: string) => void;
  setEdgeConnections: (edges: EdgeConnection[]) => void;

  // atualizar posições dos nodes
  updateNodePosition: (id: string, position: NodePosition) => void;

  // desfazer e refazer
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;

  // controles da interface
  toggleYamlPanel: () => void;
  setYamlPanelOpen: (open: boolean) => void;
  toggleAutoSave: () => void;

  // gerenciar workflow
  saveWorkflow: () => void;
  loadWorkflow: (workflow: WorkflowState) => void;
  clearAll: () => void;
}

const WORKFLOW_STORAGE_KEY = "orkestral-workflow";

export const useComposeStore = create<ComposeStore>((set, get) => ({
  services: [],
  networks: [],
  comments: [],
  edgeConnections: [],
  nodePositions: {},
  selectedServiceId: null,
  yamlPanelOpen: true,
  autoSaveEnabled: false,
  past: [],
  future: [],

  saveSnapshot: () => {
    const state = get();
    const snapshot: WorkflowState = {
      services: state.services,
      networks: state.networks,
      comments: state.comments,
      edgeConnections: state.edgeConnections,
      nodePositions: state.nodePositions,
      version: "1.0",
    };
    set((state) => ({
      past: [...state.past.slice(-49), snapshot], // guarda os últimos 50 estados
      future: [], // limpa o futuro quando faz uma ação nova
    }));
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);

    const current: WorkflowState = {
      services: state.services,
      networks: state.networks,
      comments: state.comments,
      edgeConnections: state.edgeConnections,
      nodePositions: state.nodePositions,
      version: "1.0",
    };

    set({
      services: previous.services,
      networks: previous.networks,
      comments: previous.comments,
      edgeConnections: previous.edgeConnections,
      nodePositions: previous.nodePositions,
      past: newPast,
      future: [current, ...state.future.slice(0, 49)],
    });

    if (state.autoSaveEnabled) {
      setTimeout(() => get().saveWorkflow(), 100);
    }
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    const current: WorkflowState = {
      services: state.services,
      networks: state.networks,
      comments: state.comments,
      edgeConnections: state.edgeConnections,
      nodePositions: state.nodePositions,
      version: "1.0",
    };

    set({
      services: next.services,
      networks: next.networks,
      comments: next.comments,
      edgeConnections: next.edgeConnections,
      nodePositions: next.nodePositions,
      past: [...state.past, current],
      future: newFuture,
    });

    if (state.autoSaveEnabled) {
      setTimeout(() => get().saveWorkflow(), 100);
    }
  },

  addService: (service) => {
    get().saveSnapshot();
    set((state) => {
      const newState = {
        services: [...state.services, service],
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  updateService: (id, updates) => {
    // não salva snapshot em todo update, seria muito frequente
    set((state) => {
      const newState = {
        services: state.services.map((service) =>
          service.id === id ? { ...service, ...updates } : service,
        ),
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  deleteService: (id) => {
    get().saveSnapshot();
    set((state) => {
      // remove o serviço e atualiza as dependências
      const updatedServices = state.services
        .filter((service) => service.id !== id)
        .map((service) => ({
          ...service,
          dependsOn: service.dependsOn.filter((depId) => depId !== id),
        }));

      const { [id]: _, ...remainingPositions } = state.nodePositions;

      const newState = {
        services: updatedServices,
        nodePositions: remainingPositions,
        selectedServiceId:
          state.selectedServiceId === id ? null : state.selectedServiceId,
      };

      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  duplicateService: (id) =>
    set((state) => {
      const service = state.services.find((s) => s.id === id);
      if (!service) return state;

      const newService: ComposeService = {
        ...service,
        id: `service-${Date.now()}`,
        name: `${service.name}_copy`,
      };

      const newState = {
        services: [...state.services, newService],
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  selectService: (id) =>
    set(() => ({
      selectedServiceId: id,
    })),

  clearServices: () =>
    set((state) => {
      const newState = {
        services: [],
        selectedServiceId: null,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  importServices: (services, networks) =>
    set((state) => {
      const newState = {
        services,
        networks: networks || state.networks,
        selectedServiceId: null,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  // funções de rede
  addNetwork: (network) => {
    get().saveSnapshot();
    set((state) => {
      const newState = {
        networks: [...state.networks, network],
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  updateNetwork: (id, updates) =>
    set((state) => {
      const newState = {
        networks: state.networks.map((network) =>
          network.id === id ? { ...network, ...updates } : network,
        ),
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  deleteNetwork: (id) => {
    get().saveSnapshot();
    set((state) => {
      const network = state.networks.find((n) => n.id === id);
      const { [id]: _, ...remainingPositions } = state.nodePositions;

      // remove as conexões de rede dos serviços
      const updatedServices = network
        ? state.services.map((service) => ({
            ...service,
            networks: service.networks.filter((n) => n !== network.name),
          }))
        : state.services;

      // remove as arestas conectadas nessa rede
      const updatedEdges = state.edgeConnections.filter(
        (edge) => edge.source !== id && edge.target !== id,
      );

      const newState = {
        networks: state.networks.filter((network) => network.id !== id),
        services: updatedServices,
        edgeConnections: updatedEdges,
        nodePositions: remainingPositions,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  // funções de comentários
  addComment: (comment) => {
    get().saveSnapshot();
    set((state) => {
      const newState = {
        comments: [...state.comments, comment],
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  updateComment: (id, updates) =>
    set((state) => {
      const newState = {
        comments: state.comments.map((comment) =>
          comment.id === id ? { ...comment, ...updates } : comment,
        ),
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  deleteComment: (id) => {
    get().saveSnapshot();
    set((state) => {
      const { [id]: _, ...remainingPositions } = state.nodePositions;

      const newState = {
        comments: state.comments.filter((comment) => comment.id !== id),
        nodePositions: remainingPositions,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  // funções das conexões
  addEdgeConnection: (edge) => {
    get().saveSnapshot();
    set((state) => {
      // verifica se já existe essa conexão
      const exists = state.edgeConnections.some((e) => e.id === edge.id);
      if (exists) return state;

      const newState = {
        edgeConnections: [...state.edgeConnections, edge],
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  removeEdgeConnection: (edgeId) => {
    get().saveSnapshot();
    set((state) => {
      const newState = {
        edgeConnections: state.edgeConnections.filter((e) => e.id !== edgeId),
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    });
  },

  setEdgeConnections: (edges) =>
    set((state) => {
      const newState = {
        edgeConnections: edges,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),

  // atualizar posições
  updateNodePosition: (id, position) =>
    set((state) => ({
      nodePositions: {
        ...state.nodePositions,
        [id]: position,
      },
    })),

  toggleYamlPanel: () =>
    set((state) => ({
      yamlPanelOpen: !state.yamlPanelOpen,
    })),

  setYamlPanelOpen: (open) =>
    set(() => ({
      yamlPanelOpen: open,
    })),

  toggleAutoSave: () =>
    set((state) => {
      const newAutoSave = !state.autoSaveEnabled;
      if (newAutoSave) {
        // salva na hora quando ativa
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return {
        autoSaveEnabled: newAutoSave,
      };
    }),

  // salvar e carregar workflow
  saveWorkflow: () => {
    const state = get();
    const workflow: WorkflowState = {
      services: state.services,
      networks: state.networks,
      comments: state.comments,
      edgeConnections: state.edgeConnections,
      nodePositions: state.nodePositions,
      version: "1.0",
    };

    try {
      localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflow));
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  },

  loadWorkflow: (workflow) =>
    set(() => ({
      services: workflow.services || [],
      networks: workflow.networks || [],
      comments: workflow.comments || [],
      edgeConnections: workflow.edgeConnections || [],
      nodePositions: workflow.nodePositions || {},
      selectedServiceId: null,
    })),

  clearAll: () =>
    set((state) => {
      const newState = {
        services: [],
        networks: [],
        comments: [],
        edgeConnections: [],
        nodePositions: {},
        selectedServiceId: null,
      };
      if (state.autoSaveEnabled) {
        setTimeout(() => get().saveWorkflow(), 100);
      }
      return newState;
    }),
}));
