import { describe, expect, it } from "vitest";
import { schemaFromDatabaseUrl } from "../dbAdapter";

describe("schemaFromDatabaseUrl", () => {
  it("reads the per-salon schema from the connection string", () => {
    expect(schemaFromDatabaseUrl("postgresql://u:p@host/db?sslmode=require&schema=vivacious")).toBe("vivacious");
  });

  it("leaves the default schema alone when none is given", () => {
    expect(schemaFromDatabaseUrl("postgresql://u:p@host/db?sslmode=require")).toBeUndefined();
  });
});
