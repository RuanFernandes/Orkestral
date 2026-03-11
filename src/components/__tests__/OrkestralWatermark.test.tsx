import { render, screen } from "@testing-library/react";
import { OrkestralWatermark } from "../OrkestralWatermark";

describe("OrkestralWatermark", () => {
  it("should render the watermark with correct text", () => {
    render(<OrkestralWatermark />);

    const watermark = screen.getByText("Orkestral");
    expect(watermark).toBeInTheDocument();
  });

  it("should have pointer-events disabled", () => {
    const { container } = render(<OrkestralWatermark />);

    const watermarkBox = container.firstChild as HTMLElement;
    expect(watermarkBox).toHaveStyle({ pointerEvents: "none" });
  });

  it("should be positioned absolutely in the bottom-right corner", () => {
    const { container } = render(<OrkestralWatermark />);

    const watermarkBox = container.firstChild as HTMLElement;
    expect(watermarkBox).toHaveStyle({
      position: "absolute",
      bottom: "12px",
      right: "12px",
    });
  });

  it("should have appropriate z-index to stay on top", () => {
    const { container } = render(<OrkestralWatermark />);

    const watermarkBox = container.firstChild as HTMLElement;
    expect(watermarkBox).toHaveStyle({ zIndex: "10" });
  });
});
