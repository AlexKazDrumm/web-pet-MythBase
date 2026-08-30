import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./api";

function mockFetch(response: Partial<Response> & { jsonBody?: unknown }) {
  const fn = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.jsonBody ?? {},
  } as Response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("api.listCreatures", () => {
  it("builds a query string from filters", async () => {
    const fetchMock = mockFetch({ jsonBody: [] });
    await api.listCreatures({
      name: "wyrm",
      type: "beast",
      unique: true,
      locations: [3, 7],
    });
    const url = fetchMock.mock.calls[0]![0] as string;
    expect(url).toContain("/creatures?");
    expect(url).toContain("name=wyrm");
    expect(url).toContain("type=beast");
    expect(url).toContain("unique=1");
    expect(url).toContain("locations=3");
    expect(url).toContain("locations=7");
  });

  it("omits empty filters", async () => {
    const fetchMock = mockFetch({ jsonBody: [] });
    await api.listCreatures();
    expect(fetchMock.mock.calls[0]![0]).toMatch(/\/creatures$/);
  });
});

describe("api.createCreature", () => {
  it("sends a JSON POST body", async () => {
    const fetchMock = mockFetch({ status: 201, jsonBody: { id: 1 } });
    await api.createCreature({
      name: "Test",
      description: "d",
      coverLink: "c.svg",
      typeId: 1,
      locationIds: [2],
    });
    const init = fetchMock.mock.calls[0]![1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Test" });
  });
});

describe("error handling", () => {
  it("throws ApiError with the server message", async () => {
    mockFetch({ ok: false, status: 404, jsonBody: { error: "Creature not found" } });
    await expect(api.getCreature(999)).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Creature not found",
    });
  });

  it("wraps network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("boom")),
    );
    const error = await api.listCreatures().catch((err) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });
});
