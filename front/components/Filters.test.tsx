import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Filters from "./Filters";
import type { CreatureType, MythLocation } from "../lib/types";

const types: CreatureType[] = [
  { id: 1, name: "hero", creatureCount: 4 },
  { id: 2, name: "beast", creatureCount: 6 },
];

const locations: MythLocation[] = [
  { id: 1, name: "Aethergard", parentId: null, creatureCount: 5 },
  { id: 2, name: "Sunmarch", parentId: 1, creatureCount: 2 },
];

function setup(overrides: Partial<ComponentProps<typeof Filters>> = {}) {
  const props = {
    types,
    locations,
    selectedTypes: [],
    onToggleType: vi.fn(),
    selectedLocations: [],
    onToggleLocation: vi.fn(),
    uniqueOnly: false,
    onToggleUnique: vi.fn(),
    ...overrides,
  };
  render(<Filters {...props} />);
  return props;
}

describe("Filters", () => {
  it("renders types with their counts", () => {
    setup();
    expect(screen.getByText("hero (4)")).toBeInTheDocument();
    expect(screen.getByText("beast (6)")).toBeInTheDocument();
  });

  it("renders the nested location tree", () => {
    setup();
    expect(screen.getByText("Aethergard (5)")).toBeInTheDocument();
    expect(screen.getByText("Sunmarch (2)")).toBeInTheDocument();
  });

  it("reports type toggles", () => {
    const props = setup();
    fireEvent.click(screen.getByText("hero (4)"));
    expect(props.onToggleType).toHaveBeenCalledWith("hero");
  });

  it("reports the unique toggle", () => {
    const props = setup();
    fireEvent.click(screen.getByText(/Только уникальные/));
    expect(props.onToggleUnique).toHaveBeenCalled();
  });
});
