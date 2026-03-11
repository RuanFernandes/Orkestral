import {
  downloadWorkflow,
  uploadWorkflow,
  loadWorkflowFromLocalStorage,
} from "../workflowUtils";
import { WorkflowState } from "@/types/compose";

describe("workflowUtils", () => {
  describe("downloadWorkflow", () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      // Reset URL mocks
      (global.URL.createObjectURL as jest.Mock).mockReturnValue(
        "blob:test-url",
      );
      (global.URL.revokeObjectURL as jest.Mock).mockClear();

      // Mock document methods
      appendChildSpy = jest
        .spyOn(document.body, "appendChild")
        .mockImplementation();
      removeChildSpy = jest
        .spyOn(document.body, "removeChild")
        .mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create a download link with correct attributes", () => {
      const mockWorkflow: WorkflowState = {
        services: [],
        networks: [],
        comments: [],
        nodePositions: {},
        edgeConnections: [],
        version: "1.0",
      };

      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };

      createElementSpy = jest
        .spyOn(document, "createElement")
        .mockReturnValue(mockLink as any);

      downloadWorkflow(mockWorkflow);

      expect(mockLink.href).toBe("blob:test-url");
      expect(mockLink.download).toBe("orkestral-workflow.json");
      expect(mockLink.click).toHaveBeenCalled();
    });

    it("should create a blob with correct workflow JSON", () => {
      const mockWorkflow: WorkflowState = {
        services: [
          {
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
          },
        ],
        networks: [],
        comments: [],
        nodePositions: { "service-1": { x: 100, y: 200 } },
        edgeConnections: [],
        version: "1.0",
      };

      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };

      createElementSpy = jest
        .spyOn(document, "createElement")
        .mockReturnValue(mockLink as any);

      downloadWorkflow(mockWorkflow);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      const blobArg = (global.URL.createObjectURL as jest.Mock).mock
        .calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe("application/json");
    });

    it("should clean up after download", () => {
      const mockWorkflow: WorkflowState = {
        services: [],
        networks: [],
        comments: [],
        nodePositions: {},
        edgeConnections: [],
        version: "1.0",
      };

      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };

      createElementSpy = jest
        .spyOn(document, "createElement")
        .mockReturnValue(mockLink as any);

      downloadWorkflow(mockWorkflow);

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
    });
  });

  describe("uploadWorkflow", () => {
    it("should resolve with workflow when valid file is selected", async () => {
      const mockWorkflow: WorkflowState = {
        services: [],
        networks: [],
        comments: [],
        nodePositions: {},
        edgeConnections: [],
        version: "1.0",
      };

      // Create a proper mock File with text() method
      const mockFile = {
        text: jest.fn().mockResolvedValue(JSON.stringify(mockWorkflow)),
        name: "workflow.json",
        type: "application/json",
      };

      const mockInput = {
        type: "",
        accept: "",
        onchange: null as any,
        click: jest.fn(function (this: any) {
          if (mockInput.onchange) {
            const event = {
              target: {
                files: [mockFile],
              },
            };
            mockInput.onchange(event as any);
          }
        }),
      };

      jest.spyOn(document, "createElement").mockReturnValue(mockInput as any);

      const result = await uploadWorkflow();

      expect(mockInput.type).toBe("file");
      expect(mockInput.accept).toBe(".json");
      expect(result).toEqual(mockWorkflow);
    });

    it("should reject when no file is selected", async () => {
      const mockInput = {
        type: "",
        accept: "",
        onchange: null as any,
        click: jest.fn(function (this: any) {
          if (mockInput.onchange) {
            const event = {
              target: {
                files: null,
              },
            };
            mockInput.onchange(event as any);
          }
        }),
      };

      jest.spyOn(document, "createElement").mockReturnValue(mockInput as any);

      await expect(uploadWorkflow()).rejects.toThrow("No file selected");
    });

    it("should reject when file contains invalid JSON", async () => {
      // Create a mock file with invalid JSON
      const mockFile = {
        text: jest.fn().mockResolvedValue("invalid json content"),
        name: "workflow.json",
        type: "application/json",
      };

      const mockInput = {
        type: "",
        accept: "",
        onchange: null as any,
        click: jest.fn(function (this: any) {
          if (mockInput.onchange) {
            const event = {
              target: {
                files: [mockFile],
              },
            };
            mockInput.onchange(event as any);
          }
        }),
      };

      jest.spyOn(document, "createElement").mockReturnValue(mockInput as any);

      await expect(uploadWorkflow()).rejects.toThrow();
    });
  });

  describe("loadWorkflowFromLocalStorage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should return workflow from localStorage when available", () => {
      const mockWorkflow: WorkflowState = {
        services: [
          {
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
          },
        ],
        networks: [],
        comments: [],
        nodePositions: {},
        edgeConnections: [],
        version: "1.0",
      };

      localStorage.setItem("orkestral-workflow", JSON.stringify(mockWorkflow));

      const result = loadWorkflowFromLocalStorage();

      expect(result).toEqual(mockWorkflow);
    });

    it("should return null when no workflow is saved", () => {
      const result = loadWorkflowFromLocalStorage();

      expect(result).toBeNull();
    });

    it("should return null and log error when localStorage contains invalid JSON", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      localStorage.setItem("orkestral-workflow", "invalid json");

      const result = loadWorkflowFromLocalStorage();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should handle complex workflow data correctly", () => {
      const complexWorkflow: WorkflowState = {
        services: [
          {
            id: "service-1",
            name: "web",
            image: "nginx:latest",
            ports: ["80:80"],
            environment: { NODE_ENV: "production" },
            volumes: ["/app:/app"],
            networks: ["frontend"],
            dependsOn: ["db"],
            command: "npm start",
            restart: "always",
          },
          {
            id: "service-2",
            name: "db",
            image: "postgres:14",
            ports: ["5432:5432"],
            environment: { POSTGRES_PASSWORD: "secret" },
            volumes: ["/data:/var/lib/postgresql/data"],
            networks: ["backend"],
            dependsOn: [],
            command: "",
            restart: "unless-stopped",
          },
        ],
        networks: [
          {
            id: "network-1",
            name: "frontend",
            driver: "bridge",
            external: false,
          },
          {
            id: "network-2",
            name: "backend",
            driver: "bridge",
            external: false,
          },
        ],
        comments: [{ id: "comment-1", text: "This is the web service" }],
        nodePositions: {
          "service-1": { x: 100, y: 100 },
          "service-2": { x: 300, y: 100 },
          "network-1": { x: 100, y: 300 },
          "network-2": { x: 300, y: 300 },
        },
        edgeConnections: [],
        version: "1.0",
      };

      localStorage.setItem(
        "orkestral-workflow",
        JSON.stringify(complexWorkflow),
      );

      const result = loadWorkflowFromLocalStorage();

      expect(result).toEqual(complexWorkflow);
      expect(result?.services).toHaveLength(2);
      expect(result?.networks).toHaveLength(2);
      expect(result?.comments).toHaveLength(1);
      expect(Object.keys(result?.nodePositions || {})).toHaveLength(4);
    });
  });
});
