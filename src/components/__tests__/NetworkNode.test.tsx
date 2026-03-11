import { render, screen, fireEvent } from "@testing-library/react";
import { NetworkNodeComponent } from "../NetworkNode";
import { useComposeStore } from "@/store/composeStore";
import { NetworkNode } from "@/types/compose";

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

describe("NetworkNodeComponent", () => {
  const mockNetwork: NetworkNode = {
    id: "network-1",
    name: "frontend-network",
    driver: "bridge",
    external: false,
  };

  const mockUpdateNetwork = jest.fn();
  const mockDeleteNetwork = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useComposeStore as unknown as jest.Mock).mockReturnValue({
      updateNetwork: mockUpdateNetwork,
      deleteNetwork: mockDeleteNetwork,
    });

    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  it("should render network name", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    expect(screen.getByText("frontend-network")).toBeInTheDocument();
  });

  it("should display driver information", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    expect(screen.getByText("Driver: bridge")).toBeInTheDocument();
  });

  it("should show external badge when network is external", () => {
    const externalNetwork = { ...mockNetwork, external: true };
    render(<NetworkNodeComponent id="network-1" data={externalNetwork} />);

    expect(screen.getByText("External")).toBeInTheDocument();
  });

  it("should not show external badge when network is not external", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    expect(screen.queryByText("External")).not.toBeInTheDocument();
  });

  it("should enable edit mode when edit button is clicked", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    // Input should be visible in edit mode
    const input = screen.getByDisplayValue("frontend-network");
    expect(input).toBeInTheDocument();
  });

  it("should update network name when saved", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    // Enter edit mode
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    // Change name
    const input = screen.getByDisplayValue("frontend-network");
    fireEvent.change(input, { target: { value: "backend-network" } });

    // Save
    fireEvent.blur(input);

    expect(mockUpdateNetwork).toHaveBeenCalledWith("network-1", {
      name: "backend-network",
    });
  });

  it("should call deleteNetwork when delete button is clicked and confirmed", () => {
    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Delete this network?");
    expect(mockDeleteNetwork).toHaveBeenCalledWith("network-1");
  });

  it("should not delete network when confirmation is cancelled", () => {
    (global.confirm as jest.Mock).mockReturnValueOnce(false);

    render(<NetworkNodeComponent id="network-1" data={mockNetwork} />);

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(mockDeleteNetwork).not.toHaveBeenCalled();
  });

  it("should render handles for connections", () => {
    const { getAllByTestId } = render(
      <NetworkNodeComponent id="network-1" data={mockNetwork} />,
    );

    const handles = getAllByTestId(/handle-/);
    expect(handles.length).toBeGreaterThan(0);
  });

  it("should handle network without driver", () => {
    const networkWithoutDriver = { ...mockNetwork, driver: undefined };
    render(<NetworkNodeComponent id="network-1" data={networkWithoutDriver} />);

    expect(screen.getByText("frontend-network")).toBeInTheDocument();
  });
});
