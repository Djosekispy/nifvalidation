import { PuppeteerBrowser } from "./adapters/PuppeteerBrowser.js";
import { NifService } from "./services/NifService.js";

/**
 * Obtém os dados do NIF a partir do portal do contribuinte de Angola.
 * @param {string} nif Número de identificação fiscal ou BI a consultar.
 * @param {{
 * browserAdapter?: PuppeteerBrowser,
 * provider?: import("./interfaces/INifProvider.js").INifProvider,
 * retries?: number,
 * timeoutMs?: number,
 * resultTimeoutMs?: number,
 * enableCache?: boolean,
 * cacheTtlMs?: number,
 * debug?: boolean,
 * logger?: { debug?: Function, warn?: Function, error?: Function },
 * }} [options] Opções de configuração.
 * @returns {Promise<import("./entities/Nif.js").Entity>} Entidade com os dados do contribuinte.
 */
export async function getNifData(nif, options = {}) {
  const browserAdapter = options.browserAdapter ?? new PuppeteerBrowser();
  const service = new NifService(browserAdapter, {
    retries: options.retries,
    timeoutMs: options.timeoutMs,
    resultTimeoutMs: options.resultTimeoutMs,
    enableCache: options.enableCache,
    cacheTtlMs: options.cacheTtlMs,
    debug: options.debug,
    logger: options.logger,
    provider: options.provider,
  });
  return service.getNIF(nif);
}

export { NifService } from "./services/NifService.js";
export { PuppeteerBrowser } from "./adapters/PuppeteerBrowser.js";
export { Entity as NifEntity } from "./entities/Nif.js";
export { INifProvider } from "./interfaces/INifProvider.js";
export { PortalContribuinteProvider } from "./providers/PortalContribuinteProvider.js";


