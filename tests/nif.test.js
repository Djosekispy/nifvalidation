import test from "node:test";
import assert from "node:assert/strict";
import { getNifData, NifService, NifEntity } from "../index.js";

const OK_DATA = {
  nif: "0000000000000",
  name: "Contribuinte Exemplo",
  type: "Pessoa Singular",
  state: "Activo",
  vatRegime: "Regime Geral",
  residenciaFiscal: "Angola",
};

class MockBrowserAdapter {
  constructor() {
    this.closeCount = 0;
  }

  async createPage() {
    return {
      browser: {
        close: async () => {
          this.closeCount += 1;
        },
      },
      page: {},
    };
  }
}

class MockProvider {
  constructor(impl = async () => OK_DATA) {
    this.impl = impl;
    this.calls = 0;
  }

  getLookupUrl() {
    return "https://fake-provider";
  }

  async lookup(page, nif, options) {
    this.calls += 1;
    return this.impl(page, nif, options, this.calls);
  }
}

test("NifService retorna uma instância de NifEntity com os dados esperados", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider();
  const service = new NifService(adapter, { provider });

  const result = await service.getNIF("0000000000000");

  assert.ok(result instanceof NifEntity);
  assert.equal(result.nif, "0000000000000");
  assert.equal(result.name, "Contribuinte Exemplo");
  assert.equal(result.type, "Pessoa Singular");
  assert.equal(result.state, "Activo");
  assert.equal(result.vatRegime, "Regime Geral");
  assert.equal(result.residenciaFiscal, "Angola");
  assert.equal(provider.calls, 1);
  assert.equal(adapter.closeCount, 1);
});

test("getNifData utiliza o browserAdapter customizado quando fornecido", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider();

  const result = await getNifData("0000000000000", {
    browserAdapter: adapter,
    provider,
  });

  assert.ok(result instanceof NifEntity);
  assert.equal(result.nif, "0000000000000");
  assert.equal(provider.calls, 1);
});

test("NifService faz retry quando ha erro temporario", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider(async (_page, _nif, _options, call) => {
    if (call === 1) {
      throw new Error("falha temporaria");
    }
    return OK_DATA;
  });

  const service = new NifService(adapter, {
    provider,
    retries: 1,
  });

  const result = await service.getNIF("0000000000000");

  assert.equal(result.nif, "0000000000000");
  assert.equal(provider.calls, 2);
  assert.equal(adapter.closeCount, 2);
});

test("NifService usa cache opcional para evitar nova consulta", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider();
  const service = new NifService(adapter, {
    provider,
    enableCache: true,
    cacheTtlMs: 60000,
  });

  const first = await service.getNIF("0000000000000");
  const second = await service.getNIF("0000000000000");

  assert.equal(provider.calls, 1);
  assert.strictEqual(first, second);
});

test("NifService rejeita entrada invalida", async () => {
  const adapter = new MockBrowserAdapter();
  const service = new NifService(adapter, {
    provider: new MockProvider(),
  });

  await assert.rejects(service.getNIF(""), {
    message: "NIF/BI e obrigatorio",
  });

  await assert.rejects(service.getNIF("abc@@"), {
    message: "NIF/BI contem caracteres invalidos",
  });
});

test("NifService rejeita resposta inconsistente do provedor", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider(async () => ({
    ...OK_DATA,
    nif: "1111111111111",
  }));
  const service = new NifService(adapter, {
    provider,
    retries: 0,
  });

  await assert.rejects(service.getNIF("0000000000000"), {
    message: "NIF/BI invalido ou indisponivel",
  });
});

test("NifService falha apos esgotar retries", async () => {
  const adapter = new MockBrowserAdapter();
  const provider = new MockProvider(async () => {
    throw new Error("indisponivel");
  });

  const service = new NifService(adapter, {
    provider,
    retries: 2,
  });

  await assert.rejects(service.getNIF("0000000000000"), {
    message: "NIF/BI invalido ou indisponivel",
  });

  assert.equal(provider.calls, 3);
  assert.equal(adapter.closeCount, 3);
});

