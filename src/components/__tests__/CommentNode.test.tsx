import { render, screen, fireEvent } from "@testing-library/react";
import { CommentNodeComponent } from "../CommentNode";
import { useComposeStore } from "@/store/composeStore";
import { CommentNode } from "@/types/compose";

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

describe("CommentNodeComponent", () => {
  const mockComment: CommentNode = {
    id: "comment-1",
    text: "This is a test comment",
  };

  const mockUpdateComment = jest.fn();
  const mockDeleteComment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useComposeStore as unknown as jest.Mock).mockReturnValue({
      updateComment: mockUpdateComment,
      deleteComment: mockDeleteComment,
    });

    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  it("should render comment text", () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    expect(screen.getByText("This is a test comment")).toBeInTheDocument();
  });

  it('should render "Note" label', () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("should enable edit mode when edit button is clicked", () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    // Textarea should be visible in edit mode
    const textarea = screen.getByDisplayValue("This is a test comment");
    expect(textarea).toBeInTheDocument();
  });

  it("should update comment text when saved", () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    // Enter edit mode
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);

    // Change text
    const textarea = screen.getByDisplayValue("This is a test comment");
    fireEvent.change(textarea, { target: { value: "Updated comment text" } });

    // Save (blur event)
    fireEvent.blur(textarea);

    expect(mockUpdateComment).toHaveBeenCalledWith("comment-1", {
      text: "Updated comment text",
    });
  });

  it("should call deleteComment when delete button is clicked and confirmed", () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith("Delete this comment?");
    expect(mockDeleteComment).toHaveBeenCalledWith("comment-1");
  });

  it("should not delete comment when confirmation is cancelled", () => {
    (global.confirm as jest.Mock).mockReturnValueOnce(false);

    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    const deleteButton = screen.getByLabelText(/delete/i);
    fireEvent.click(deleteButton);

    expect(mockDeleteComment).not.toHaveBeenCalled();
  });

  it("should enable edit mode when comment text is clicked", () => {
    render(<CommentNodeComponent id="comment-1" data={mockComment} />);

    const commentText = screen.getByText("This is a test comment");
    fireEvent.click(commentText);

    // Textarea should be visible
    const textarea = screen.getByDisplayValue("This is a test comment");
    expect(textarea).toBeInTheDocument();
  });

  it("should render handles for connections", () => {
    const { getAllByTestId } = render(
      <CommentNodeComponent id="comment-1" data={mockComment} />,
    );

    const handles = getAllByTestId(/handle-/);
    expect(handles.length).toBeGreaterThan(0);
  });

  it("should handle empty comment text", () => {
    const emptyComment = { ...mockComment, text: "" };
    render(<CommentNodeComponent id="comment-1" data={emptyComment} />);

    expect(screen.getByText("Note")).toBeInTheDocument();
  });
});
