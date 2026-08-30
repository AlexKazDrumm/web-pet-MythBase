import { API_BASE_URL } from "./config";
import type {
  Creature,
  CreatureDetail,
  CreatureQuery,
  CreatureType,
  MythLocation,
  NewCreature,
  NewLocation,
} from "./types";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
  } catch {
    throw new ApiError(0, "Network error: the API is unreachable");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* keep the default message */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function creatureQuery(query: CreatureQuery = {}): string {
  const params = new URLSearchParams();
  if (query.name) params.set("name", query.name);
  if (query.type) params.set("type", query.type);
  if (query.unique) params.set("unique", "1");
  for (const id of query.locations ?? []) params.append("locations", String(id));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  listCreatures: (query?: CreatureQuery): Promise<Creature[]> =>
    request(`/creatures${creatureQuery(query)}`),

  getCreature: (id: number): Promise<CreatureDetail> =>
    request(`/creatures/${id}`),

  createCreature: (body: NewCreature): Promise<CreatureDetail> =>
    request(`/creatures`, { method: "POST", body: JSON.stringify(body) }),

  listLocations: (query?: { type?: string; unique?: boolean }): Promise<MythLocation[]> => {
    const params = new URLSearchParams();
    if (query?.type) params.set("type", query.type);
    if (query?.unique) params.set("unique", "1");
    const qs = params.toString();
    return request(`/locations${qs ? `?${qs}` : ""}`);
  },

  createLocation: (body: NewLocation): Promise<MythLocation> =>
    request(`/locations`, { method: "POST", body: JSON.stringify(body) }),

  listTypes: (query?: { locations?: number[]; unique?: boolean }): Promise<CreatureType[]> => {
    const params = new URLSearchParams();
    if (query?.unique) params.set("unique", "1");
    for (const id of query?.locations ?? []) params.append("locations", String(id));
    const qs = params.toString();
    return request(`/types${qs ? `?${qs}` : ""}`);
  },
};
