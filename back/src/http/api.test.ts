import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl) process.env.DATABASE_URL = testDatabaseUrl;
const hasDatabase = Boolean(testDatabaseUrl);

describe.skipIf(!hasDatabase)("MythBase API (integration)", () => {
  let app: Express;
  let hollowFensId: number;
  let heroTypeId: number;

  beforeAll(async () => {
    const { AppDataSource } = await import("../db/data-source");
    const { seed } = await import("../db/seed");
    const { createApp } = await import("./app");
    const { Location } = await import("../entities/Location");
    const { TypeEntity } = await import("../entities/TypeEntity");

    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    await AppDataSource.transaction((manager) =>
      seed(manager, { replaceExisting: true }),
    );

    hollowFensId = (
      await AppDataSource.getRepository(Location).findOneByOrFail({
        name: "Hollow Fens",
      })
    ).id;
    heroTypeId = (
      await AppDataSource.getRepository(TypeEntity).findOneByOrFail({
        name: "hero",
      })
    ).id;

    app = createApp();
  });

  afterAll(async () => {
    const { AppDataSource } = await import("../db/data-source");
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });

  it("reports health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("lists the seeded creatures sorted by name", async () => {
    const res = await request(app).get("/creatures");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(12);
    const names = res.body.map((c: { name: string }) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(res.body[0]).toHaveProperty("coverLink");
    expect(res.body[0].type).toHaveProperty("name");
  });

  it("filters creatures by partial name", async () => {
    const res = await request(app).get("/creatures").query({ name: "ember" });
    expect(res.status).toBe(200);
    expect(res.body.map((c: { name: string }) => c.name)).toContain(
      "Ember Verk",
    );
  });

  it("filters creatures by type", async () => {
    const res = await request(app).get("/creatures").query({ type: "hero" });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const creature of res.body) {
      expect(creature.type.name).toBe("hero");
    }
  });

  it("filters creatures by a location subtree", async () => {
    const res = await request(app)
      .get("/creatures")
      .query({ locations: hollowFensId });
    expect(res.status).toBe(200);
    expect(res.body.map((c: { name: string }) => c.name)).toContain(
      "Glimmerwyrm",
    );
  });

  it("returns a creature detail with relations", async () => {
    const list = await request(app).get("/creatures").query({ name: "Marn" });
    const id = list.body[0].id as number;
    const res = await request(app).get(`/creatures/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Marn the Ferryless");
    expect(Array.isArray(res.body.locations)).toBe(true);
    expect(res.body.locations.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.altNames)).toBe(true);
  });

  it("returns 404 for a missing creature", async () => {
    const res = await request(app).get("/creatures/999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Creature not found");
  });

  it("returns 400 for a non-numeric id", async () => {
    const res = await request(app).get("/creatures/not-a-number");
    expect(res.status).toBe(400);
  });

  it("lists locations with creature counts", async () => {
    const res = await request(app).get("/locations");
    expect(res.status).toBe(200);
    const fens = res.body.find(
      (l: { name: string }) => l.name === "Hollow Fens",
    );
    expect(fens.creatureCount).toBeGreaterThan(0);
    expect(fens).toHaveProperty("parentId");
  });

  it("lists types with creature counts", async () => {
    const res = await request(app).get("/types");
    expect(res.status).toBe(200);
    const total = res.body.reduce(
      (sum: number, t: { creatureCount: number }) => sum + t.creatureCount,
      0,
    );
    expect(total).toBe(12);
  });

  it("rejects unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });

  it("creates a creature and reflects it in listings", async () => {
    const res = await request(app)
      .post("/creatures")
      .send({
        name: "Test Wyrm",
        description: "A creature added by the integration test.",
        coverLink: "glimmerwyrm.svg",
        typeId: heroTypeId,
        locationIds: [hollowFensId],
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Wyrm");
    expect(res.body.locations[0].name).toBe("Hollow Fens");

    const list = await request(app).get("/creatures").query({ name: "Test Wyrm" });
    expect(list.body).toHaveLength(1);
  });

  it("rejects a creature payload with unknown fields", async () => {
    const res = await request(app)
      .post("/creatures")
      .send({
        name: "Bad Wyrm",
        description: "x".repeat(10),
        coverLink: "x.svg",
        typeId: heroTypeId,
        locationIds: [hollowFensId],
        isAdmin: true,
      });
    expect(res.status).toBe(400);
  });

  it("rejects a creature with an unknown type", async () => {
    const res = await request(app)
      .post("/creatures")
      .send({
        name: "Orphan",
        description: "no type for me",
        coverLink: "x.svg",
        typeId: 999999,
        locationIds: [hollowFensId],
      });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Type not found");
  });

  it("rejects a creature with an unknown location", async () => {
    const res = await request(app)
      .post("/creatures")
      .send({
        name: "Nowhere Beast",
        description: "no place for me",
        coverLink: "x.svg",
        typeId: heroTypeId,
        locationIds: [888888],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Unknown location");
  });

  it("creates a location under an existing parent", async () => {
    const res = await request(app)
      .post("/locations")
      .send({ name: "Test Glade", parentId: hollowFensId });
    expect(res.status).toBe(201);
    expect(res.body.parentId).toBe(hollowFensId);
  });

  it("rejects a location with an unknown parent", async () => {
    const res = await request(app)
      .post("/locations")
      .send({ name: "Floating Isle", parentId: 777777 });
    expect(res.status).toBe(400);
  });
});
