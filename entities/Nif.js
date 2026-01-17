/**
 * Representa os dados de um contribuinte obtidos a partir do NIF.
 */
class Entity {
  /**
   * @param {{ nif: string, name: string, type: string, state: string, vatRegime: string, residenciaFiscal: string }} data
   */
  constructor({ nif, name, type, state, vatRegime, residenciaFiscal }) {
    this.nif = nif;
    this.name = name;
    this.type = type;
    this.state = state;
    this.vatRegime = vatRegime;
    this.residenciaFiscal = residenciaFiscal;
  }
}

export { Entity };
