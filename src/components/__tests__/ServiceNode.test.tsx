import { render, screen, fireEvent } from "@testing-library/react";
import { ServiceNode } from "../ServiceNode";
import { useComposeStore } from "@/store/composeStore";
import { ComposeService } from "@/types/compose";

// Mock Zustand store
jest.mock("@/store/composeStore");

// Mock ReactFlow components
jest.mock("reactflow", () => ({
  Handle: ({ type, position }: any) => (
    <div data-testid={`handle-${type}-${position}`} />
  ),
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

describe("ServiceNode", () => {
  const mockService: ComposeService = {
    id: "service-1",
    name: "web-service",
    image: "nginx:latest",
    ports: ["80:80", "443:443"],
    environment: { NODE_ENV: "production", PORT: "3000" },
    volumes: ["/app:/app", "/data:/data"],
    networks: ["frontend", "backend"],
    dependsOn: ["database", "cache"],
    command: "",
    restart: "unless-stopped",
  };

  const mockSelectService = jest.fn();
  const mockDeleteService = jest.fn();
  const mockDuplicateService = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useComposeStore as unknown as jest.Mock).mockReturnValue({
      selectService: mockSelectService,
      deleteService: mockDeleteService,
      duplicateService: mockDuplicateService,
    });

    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  it("should render service name", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("web-service")).toBeInTheDocument();
  });

  it("should render service image", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("nginx:latest")).toBeInTheDocument();
  });

  it("should display correct network count", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("2 network(s)")).toBeInTheDocument();
  });

  it("should display correct volume count", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("2 volume(s)")).toBeInTheDocument();
  });

  it("should display correct environment variable count", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("2 env var(s)")).toBeInTheDocument();
  });

  it("should display correct dependency count", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    expect(screen.getByText("2 dependency(s)")).toBeInTheDocument();
  });

  it("should call selectService when edit button is clicked", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    expect(mockSelectService).toHaveBeenCalledWith("service-1");
  });

  it("should call deleteService when delete button is clicked and confirmed", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith(
      'Delete service "web-service"?',
    );
    expect(mockDeleteService).toHaveBeenCalledWith("service-1");
  });

  it("should call duplicateService when duplicate button is clicked", () => {
    render(<ServiceNode id="service-1" data={mockService} />);

    const duplicateButton = screen.getByLabelText(/duplicate/i);
    fireEvent.click(duplicateButton);

    expect(mockDuplicateService).toHaveBeenCalledWith("service-1");
  });

  it("should render handles for connections", () => {
    const { getAllByTestId } = render(
      <ServiceNode id="service-1" data={mockService} />,
    );

    const handles = getAllByTestId(/handle-/);
    expect(handles.length).toBeGreaterThan(0);
  });

  it("should handle service with no dependencies", () => {
    const serviceWithoutDeps = { ...mockService, dependsOn: [] };
    render(<ServiceNode id="service-1" data={serviceWithoutDeps} />);

    // Component doesn't show count when it's 0
    expect(screen.queryByText(/dependency/)).not.toBeInTheDocument();
  });

  it("should handle service with no ports", () => {
    const serviceWithoutPorts = { ...mockService, ports: [] };
    render(<ServiceNode id="service-1" data={serviceWithoutPorts} />);

    // Service should still render
    expect(screen.getByText("web-service")).toBeInTheDocument();
  });
});
