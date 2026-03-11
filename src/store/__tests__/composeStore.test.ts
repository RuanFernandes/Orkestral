import { renderHook, act } from "@testing-library/react";
import { useComposeStore } from "../composeStore";
import { ComposeService, NetworkNode, CommentNode } from "@/types/compose";

describe("useComposeStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useComposeStore());
    act(() => {
      result.current.clearAll();
    });

    // Clear localStorage
    localStorage.clear();
  });

  describe("Service Actions", () => {
    const mockService: ComposeService = {
      id: "service-1",
      name: "test-service",
      image: "nginx:latest",
      ports: ["80:80"],
      environment: {},
      volumes: [],
      networks: [],
      dependsOn: [],
      command: "",
      restart: "unless-stopped",
    };

    it("should add a service", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
      });

      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0]).toEqual(mockService);
    });

    it("should update a service", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.updateService("service-1", { name: "updated-service" });
      });

      expect(result.current.services[0].name).toBe("updated-service");
    });

    it("should delete a service", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.deleteService("service-1");
      });

      expect(result.current.services).toHaveLength(0);
    });

    it("should duplicate a service", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.duplicateService("service-1");
      });

      expect(result.current.services).toHaveLength(2);
      expect(result.current.services[1].name).toBe("test-service_copy");
    });

    it("should select a service", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.selectService("service-1");
      });

      expect(result.current.selectedServiceId).toBe("service-1");
    });

    it("should clear all services", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.clearServices();
      });

      expect(result.current.services).toHaveLength(0);
      expect(result.current.selectedServiceId).toBeNull();
    });

    it("should import services", () => {
      const { result } = renderHook(() => useComposeStore());
      const services = [mockService, { ...mockService, id: "service-2" }];

      act(() => {
        result.current.importServices(services);
      });

      expect(result.current.services).toHaveLength(2);
    });

    it("should handle service dependencies when deleting", () => {
      const { result } = renderHook(() => useComposeStore());
      const dependentService: ComposeService = {
        ...mockService,
        id: "service-2",
        dependsOn: ["service-1"],
      };

      act(() => {
        result.current.addService(mockService);
        result.current.addService(dependentService);
        result.current.deleteService("service-1");
      });

      expect(result.current.services).toHaveLength(1);
      expect(result.current.services[0].dependsOn).toEqual([]);
    });
  });

  describe("Network Actions", () => {
    const mockNetwork: NetworkNode = {
      id: "network-1",
      name: "test-network",
      driver: "bridge",
      external: false,
    };

    it("should add a network", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addNetwork(mockNetwork);
      });

      expect(result.current.networks).toHaveLength(1);
      expect(result.current.networks[0]).toEqual(mockNetwork);
    });

    it("should update a network", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addNetwork(mockNetwork);
        result.current.updateNetwork("network-1", { name: "updated-network" });
      });

      expect(result.current.networks[0].name).toBe("updated-network");
    });

    it("should delete a network", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addNetwork(mockNetwork);
        result.current.deleteNetwork("network-1");
      });

      expect(result.current.networks).toHaveLength(0);
    });

    it("should remove network position when deleting", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addNetwork(mockNetwork);
        result.current.updateNodePosition("network-1", { x: 100, y: 200 });
        result.current.deleteNetwork("network-1");
      });

      expect(result.current.nodePositions["network-1"]).toBeUndefined();
    });
  });

  describe("Comment Actions", () => {
    const mockComment: CommentNode = {
      id: "comment-1",
      text: "Test comment",
    };

    it("should add a comment", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addComment(mockComment);
      });

      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0]).toEqual(mockComment);
    });

    it("should update a comment", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addComment(mockComment);
        result.current.updateComment("comment-1", { text: "Updated comment" });
      });

      expect(result.current.comments[0].text).toBe("Updated comment");
    });

    it("should delete a comment", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addComment(mockComment);
        result.current.deleteComment("comment-1");
      });

      expect(result.current.comments).toHaveLength(0);
    });

    it("should remove comment position when deleting", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addComment(mockComment);
        result.current.updateNodePosition("comment-1", { x: 50, y: 50 });
        result.current.deleteComment("comment-1");
      });

      expect(result.current.nodePositions["comment-1"]).toBeUndefined();
    });
  });

  describe("Node Position Actions", () => {
    it("should update node position", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.updateNodePosition("node-1", { x: 100, y: 200 });
      });

      expect(result.current.nodePositions["node-1"]).toEqual({
        x: 100,
        y: 200,
      });
    });

    it("should update multiple node positions", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.updateNodePosition("node-1", { x: 100, y: 200 });
        result.current.updateNodePosition("node-2", { x: 300, y: 400 });
      });

      expect(Object.keys(result.current.nodePositions)).toHaveLength(2);
      expect(result.current.nodePositions["node-1"]).toEqual({
        x: 100,
        y: 200,
      });
      expect(result.current.nodePositions["node-2"]).toEqual({
        x: 300,
        y: 400,
      });
    });
  });

  describe("UI Actions", () => {
    it("should toggle YAML panel", () => {
      const { result } = renderHook(() => useComposeStore());
      const initialState = result.current.yamlPanelOpen;

      act(() => {
        result.current.toggleYamlPanel();
      });

      expect(result.current.yamlPanelOpen).toBe(!initialState);
    });

    it("should set YAML panel open state", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.setYamlPanelOpen(false);
      });

      expect(result.current.yamlPanelOpen).toBe(false);

      act(() => {
        result.current.setYamlPanelOpen(true);
      });

      expect(result.current.yamlPanelOpen).toBe(true);
    });

    it("should toggle auto-save", () => {
      const { result } = renderHook(() => useComposeStore());
      const initialState = result.current.autoSaveEnabled;

      act(() => {
        result.current.toggleAutoSave();
      });

      expect(result.current.autoSaveEnabled).toBe(!initialState);
    });
  });

  describe("Workflow Actions", () => {
    const mockService: ComposeService = {
      id: "service-1",
      name: "test-service",
      image: "nginx:latest",
      ports: [],
      environment: {},
      volumes: [],
      networks: [],
      dependsOn: [],
      command: "",
      restart: "unless-stopped",
    };

    const mockNetwork: NetworkNode = {
      id: "network-1",
      name: "test-network",
      driver: "bridge",
      external: false,
    };

    const mockComment: CommentNode = {
      id: "comment-1",
      text: "Test comment",
    };

    it("should save workflow to localStorage", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.addNetwork(mockNetwork);
        result.current.addComment(mockComment);
        result.current.saveWorkflow();
      });

      const saved = localStorage.getItem("orkestral-workflow");
      expect(saved).toBeTruthy();

      const workflow = JSON.parse(saved!);
      expect(workflow.services).toHaveLength(1);
      expect(workflow.networks).toHaveLength(1);
      expect(workflow.comments).toHaveLength(1);
    });

    it("should load workflow from state", () => {
      const { result } = renderHook(() => useComposeStore());

      const workflow = {
        services: [mockService],
        networks: [mockNetwork],
        comments: [mockComment],
        nodePositions: { "node-1": { x: 100, y: 200 } },
        version: "1.0",
      };

      act(() => {
        result.current.loadWorkflow(workflow);
      });

      expect(result.current.services).toHaveLength(1);
      expect(result.current.networks).toHaveLength(1);
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.nodePositions["node-1"]).toEqual({
        x: 100,
        y: 200,
      });
    });

    it("should clear all data", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.addNetwork(mockNetwork);
        result.current.addComment(mockComment);
        result.current.updateNodePosition("node-1", { x: 100, y: 200 });
        result.current.clearAll();
      });

      expect(result.current.services).toHaveLength(0);
      expect(result.current.networks).toHaveLength(0);
      expect(result.current.comments).toHaveLength(0);
      expect(Object.keys(result.current.nodePositions)).toHaveLength(0);
    });

    it("should handle empty workflow on load", () => {
      const { result } = renderHook(() => useComposeStore());

      act(() => {
        result.current.addService(mockService);
        result.current.loadWorkflow({
          services: [],
          networks: [],
          comments: [],
          nodePositions: {},
          version: "1.0",
        });
      });

      expect(result.current.services).toHaveLength(0);
    });
  });
});
