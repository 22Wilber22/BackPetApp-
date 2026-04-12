import { describe, expect, it } from "vitest";
import { createPetSchema } from "../src/schemas/pets.schemas";

describe("createPetSchema", () => {
  it("accepts valid payload", () => {
    const parsed = createPetSchema.safeParse({
      body: {
        usaVeterinaria: false,
        nombre: "Milo",
        especie: "Perro",
        raza: "Mestizo",
        sexo: "M",
        fechaNacimiento: null,
        alergias: null,
        condicionesCronicas: null,
        fotoUrl: null
      },
      params: {},
      query: {}
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects missing vetId when usaVeterinaria=true", () => {
    const parsed = createPetSchema.safeParse({
      body: {
        usaVeterinaria: true,
        nombre: "Luna",
        especie: "Gato",
        raza: "Criollo",
        sexo: "F"
      },
      params: {},
      query: {}
    });

    expect(parsed.success).toBe(false);
  });
});
