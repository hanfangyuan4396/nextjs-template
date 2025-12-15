import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

afterEach(() => {
  cleanup();
});

describe("<Button />", () => {
  it("renders and can be clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );

    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});


