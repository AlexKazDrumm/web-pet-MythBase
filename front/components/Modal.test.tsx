import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal";

describe("Modal", () => {
  it("focuses the close button and handles Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Карточка" onClose={onClose}>
        <button type="button">Действие</button>
      </Modal>,
    );

    expect(screen.getByRole("button", { name: "Закрыть" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps keyboard focus inside the dialog", () => {
    render(
      <Modal title="Карточка" onClose={() => {}}>
        <button type="button">Действие</button>
      </Modal>,
    );

    const close = screen.getByRole("button", { name: "Закрыть" });
    const action = screen.getByRole("button", { name: "Действие" });
    action.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();
  });
});
