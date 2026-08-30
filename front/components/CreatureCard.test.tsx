import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CreatureCard from "./CreatureCard";
import type { Creature } from "../lib/types";

const creature: Creature = {
  id: 42,
  name: "Glimmerwyrm",
  description: "A luminous serpent.",
  coverLink: "glimmerwyrm.svg",
  type: { id: 2, name: "beast" },
};

describe("CreatureCard", () => {
  it("shows the name and type badge", () => {
    render(<CreatureCard creature={creature} onSelect={() => {}} />);
    expect(screen.getByText("Glimmerwyrm")).toBeInTheDocument();
    expect(screen.getByText("beast")).toHaveClass("badge--beast");
  });

  it("calls onSelect with the creature when clicked", () => {
    const onSelect = vi.fn();
    render(<CreatureCard creature={creature} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Glimmerwyrm/ }));
    expect(onSelect).toHaveBeenCalledWith(creature);
  });

  it("falls back to a placeholder cover on image error", () => {
    render(<CreatureCard creature={creature} onSelect={() => {}} />);
    const img = document.querySelector("img") as HTMLImageElement;
    fireEvent.error(img);
    expect(img.src).toContain("/covers/_placeholder.svg");
  });
});
