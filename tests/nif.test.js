import test from "node:test";
import assert from "node:assert/strict";
import { getNifData, NifService, NifEntity } from "../index.js";

class MockBrowserAdapter {
  async createPage() {
    const browser = {
      async close() {},
    };

    const page = {
      async goto() {},
      async waitForSelector() {},
      async type() {},
      async click() {},
      async evaluate() {
        return {
          nif: "0000000000000",
          name: "Contribuinte Exemplo",
          type: "Pessoa Singular",
          state: "Activo",
          vatRegime: "Regime Geral",
          residenciaFiscal: "Angola",
        };
      },
    };

    return { browser, page };
  }
}

test("NifService retorna uma instância de NifEntity com os dados esperados", async () => {
  const adapter = new MockBrowserAdapter();
  const service = new NifService(adapter);

  const result = await service.getNIF("0000000000000");

  assert.ok(result instanceof NifEntity);
  assert.equal(result.nif, "0000000000000");
  assert.equal(result.name, "Contribuinte Exemplo");
  assert.equal(result.type, "Pessoa Singular");
  assert.equal(result.state, "Activo");
  assert.equal(result.vatRegime, "Regime Geral");
  assert.equal(result.residenciaFiscal, "Angola");
});

test("getNifData utiliza o browserAdapter customizado quando fornecido", async () => {
  const adapter = new MockBrowserAdapter();

  const result = await getNifData("0000000000000", {
    browserAdapter: adapter,
  });

  assert.ok(result instanceof NifEntity);
  assert.equal(result.nif, "0000000000000");
});

