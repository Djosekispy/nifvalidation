/**
 * Interface de provedor de dados de NIF/BI.
 * Implementacoes concretas devem encapsular seletores e estrategia de extracao.
 */
class INifProvider {
  /**
   * @returns {string}
   */
  getLookupUrl() {
    throw new Error("Method getLookupUrl() must be implemented");
  }

  /**
   * @param {import("puppeteer").Page} page
   * @param {string} nif
   * @param {{ timeoutMs: number, resultTimeoutMs: number }} options
   * @returns {Promise<{ nif: string, name: string, type: string, state: string, vatRegime: string, residenciaFiscal: string }>}
   */
  async lookup(_page, _nif, _options) {
    throw new Error("Method lookup() must be implemented");
  }
}

export { INifProvider };
