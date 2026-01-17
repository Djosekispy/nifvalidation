import { PuppeteerBrowser } from "./adapters/PuppeteerBrowser.js";
import { NifService } from "./services/NifService.js";

/**
 * Obtém os dados do NIF a partir do portal do contribuinte de Angola.
 * @param {string} nif Número de identificação fiscal ou BI a consultar.
 * @param {{ browserAdapter?: PuppeteerBrowser }} [options] Opções de configuração.
 * @returns {Promise<import("./entities/Nif.js").Entity>} Entidade com os dados do contribuinte.
 */
export async function getNifData(nif, options = {}) {
  const browserAdapter = options.browserAdapter ?? new PuppeteerBrowser();
  const service = new NifService(browserAdapter);
  return service.getNIF(nif);
}

export { NifService } from "./services/NifService.js";
export { PuppeteerBrowser } from "./adapters/PuppeteerBrowser.js";
export { Entity as NifEntity } from "./entities/Nif.js";


