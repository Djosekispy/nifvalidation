/**
 * Interface para serviços responsáveis por consultar dados de NIF.
 * Deve ser extendida por implementações concretas.
 */
class INif {
  /**
   * Consulta os dados do contribuinte a partir do NIF/BI.
   * @param {string} nif
   * @returns {Promise<any>}
   */
  async getNIF(nif) {
    throw new Error("Method getNIF() must be implemented");
  }
}

export { INif };
